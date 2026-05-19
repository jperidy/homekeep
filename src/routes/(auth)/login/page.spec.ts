import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import LoginPage from './+page.svelte';

vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_GOOGLE_ENABLED: 'false', PUBLIC_BETTER_AUTH_URL: 'http://localhost:5173' }
}));

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

const mocks = vi.hoisted(() => ({
	signInEmail: vi.fn(),
	signInMagicLink: vi.fn(),
	signInSocial: vi.fn()
}));

vi.mock('$lib/auth-client', () => ({
	signIn: {
		email: mocks.signInEmail,
		social: mocks.signInSocial
	},
	authClient: {
		signIn: { magicLink: mocks.signInMagicLink }
	}
}));

describe('LoginPage', () => {
	beforeEach(() => {
		mocks.signInEmail.mockReset();
		mocks.signInMagicLink.mockReset();
	});

	it('renders the password form by default', () => {
		render(LoginPage);
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
	});

	it('switches to magic link mode', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
		expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument();
		expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
	});

	it('calls signIn.email with the correct parameters', async () => {
		mocks.signInEmail.mockResolvedValueOnce({ error: null });
		render(LoginPage);

		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'user@example.com' }
		});
		await fireEvent.input(screen.getByLabelText('Mot de passe'), {
			target: { value: 'secret123' }
		});
		await fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

		await waitFor(() => {
			expect(mocks.signInEmail).toHaveBeenCalledWith({
				email: 'user@example.com',
				password: 'secret123',
				callbackURL: '/app'
			});
		});
	});

	it('shows an error message on login failure', async () => {
		mocks.signInEmail.mockResolvedValueOnce({ error: { message: 'Identifiants incorrects' } });
		render(LoginPage);

		await fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

		await waitFor(() => {
			expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
		});
	});

	it('shows confirmation after magic link is sent', async () => {
		mocks.signInMagicLink.mockResolvedValueOnce({ error: null });
		render(LoginPage);

		await fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'user@example.com' }
		});
		await fireEvent.submit(
			screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!
		);

		await waitFor(() => {
			expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument();
		});
	});

	it('shows an error when magic link fails', async () => {
		mocks.signInMagicLink.mockResolvedValueOnce({ error: { message: 'Email introuvable' } });
		render(LoginPage);

		await fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
		await fireEvent.submit(
			screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!
		);

		await waitFor(() => {
			expect(screen.getByText('Email introuvable')).toBeInTheDocument();
		});
	});

	it('hides the Google button when PUBLIC_GOOGLE_ENABLED is false', () => {
		render(LoginPage);
		expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
	});
});
