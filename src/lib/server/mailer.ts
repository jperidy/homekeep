import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const mailer = nodemailer.createTransport({
	host: env.SMTP_HOST ?? 'localhost',
	port: Number(env.SMTP_PORT ?? 1025),
	secure: false
});

export async function sendEmail({
	to,
	subject,
	html
}: {
	to: string;
	subject: string;
	html: string;
}) {
	await mailer.sendMail({
		from: env.SMTP_FROM ?? 'HomeKeep <noreply@homekeep.app>',
		to,
		subject,
		html
	});
}
