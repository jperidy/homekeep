import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: {
		SMTP_HOST: 'smtp.example.com',
		SMTP_PORT: '587',
		SMTP_FROM: 'HomeKeep <noreply@homekeep.app>'
	}
}));

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' });

vi.mock('nodemailer', () => ({
	default: {
		createTransport: vi.fn(() => ({ sendMail: mockSendMail }))
	}
}));

// Import après les mocks (hoisting vitest garantit l'ordre)
const { sendEmail } = await import('./mailer');

describe('sendEmail', () => {
	beforeEach(() => {
		mockSendMail.mockClear();
	});

	it('envoie un email avec les bons paramètres', async () => {
		await sendEmail({
			to: 'user@example.com',
			subject: 'Test subject',
			html: '<p>Hello</p>'
		});

		expect(mockSendMail).toHaveBeenCalledOnce();
		expect(mockSendMail).toHaveBeenCalledWith({
			from: 'HomeKeep <noreply@homekeep.app>',
			to: 'user@example.com',
			subject: 'Test subject',
			html: '<p>Hello</p>'
		});
	});

	it('propage les erreurs du transport', async () => {
		mockSendMail.mockRejectedValueOnce(new Error('SMTP connection refused'));

		await expect(
			sendEmail({ to: 'user@example.com', subject: 'Test', html: '<p>x</p>' })
		).rejects.toThrow('SMTP connection refused');
	});

	it('accepte plusieurs destinataires', async () => {
		await sendEmail({
			to: 'a@example.com, b@example.com',
			subject: 'Multi',
			html: '<p>Hi</p>'
		});

		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({ to: 'a@example.com, b@example.com' })
		);
	});
});
