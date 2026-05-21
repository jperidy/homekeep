import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

async function sendViaBrevoApi(to: string, subject: string, html: string) {
	const response = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'api-key': env.BREVO_API_KEY!,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			sender: { email: env.SMTP_FROM ?? 'noreply@homekeep.app' },
			to: [{ email: to }],
			subject,
			htmlContent: html
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
	}
}

async function sendViaSmtp(to: string, subject: string, html: string) {
	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST ?? 'localhost',
		port: Number(env.SMTP_PORT ?? 1025),
		secure: false
	});

	await transporter.sendMail({
		from: env.SMTP_FROM ?? 'HomeKeep <noreply@homekeep.app>',
		to,
		subject,
		html
	});
}

export async function sendEmail({
	to,
	subject,
	html
}: {
	to: string;
	subject: string;
	html: string;
}) {
	try {
		if (env.BREVO_API_KEY) {
			await sendViaBrevoApi(to, subject, html);
		} else {
			await sendViaSmtp(to, subject, html);
		}
	} catch (err) {
		console.error('[mailer] sendEmail failed:', err);
		throw err;
	}
}
