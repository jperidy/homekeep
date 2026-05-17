import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { prisma } from './prisma';
import { sendEmail } from './mailer';

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),

	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: 'Réinitialisation de votre mot de passe HomeKeep',
				html: `
					<p>Bonjour ${user.name},</p>
					<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
					<p><a href="${url}">${url}</a></p>
					<p>Ce lien expire dans 1 heure.</p>
				`
			});
		}
	},

	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: 'Vérifiez votre adresse email HomeKeep',
				html: `
					<p>Bonjour ${user.name},</p>
					<p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
					<p><a href="${url}">${url}</a></p>
					<p>Ce lien expire dans 24 heures.</p>
				`
			});
		}
	},

	socialProviders: {
		...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET
					}
				}
			: {})
	},

	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendEmail({
					to: email,
					subject: 'Votre lien de connexion HomeKeep',
					html: `
						<p>Bonjour,</p>
						<p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
						<p><a href="${url}">${url}</a></p>
						<p>Ce lien expire dans 5 minutes.</p>
					`
				});
			}
		})
	],

	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'USER',
				input: false
			}
		}
	}
});

export type Session = typeof auth.$Infer.Session;
