const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');



// Example mutation for setting up 2FA
const resolvers = {
    Mutation: {
        register: async (_, { email, password }, { prisma, isCompany }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const twoFASecret = setup2FA();

            const user = isCompany
                ? await prisma.company.create({ data: { email, password: hashedPassword, twoFASecret } })
                : await prisma.customer.create({ data: { email, password: hashedPassword, twoFASecret } });

            // Return the secret so the user can set it up in their app
            return { ...user, twoFASecret };
        },
        login: async (_, { email, password, twoFACode }, { prisma, isCompany }) => {
            const user = isCompany
                ? await prisma.company.findUnique({ where: { email } })
                : await prisma.customer.findUnique({ where: { email } });

            if (!user) {
                throw new Error('User not found');
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error('Invalid password');
            }

            // Verify 2FA code
            const valid2FA = speakeasy.totp.verify({
                secret: user.twoFASecret,
                encoding: 'base32',
                token: twoFACode,
            });

            if (!valid2FA) {
                throw new Error('Invalid 2FA code');
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user.id, isCompany }, 'your_secret_key');
            return token;
        },
    },
};

module.exports = resolvers;
