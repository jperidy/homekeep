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

	it('affiche le formulaire mot de passe par défaut', () => {
		render(LoginPage);
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
	});

	it('bascule vers le mode magic link', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
		expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument();
		expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
	});

	it('appelle signIn.email avec les bons paramètres', async () => {
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

	it("affiche un message d'erreur sur échec de connexion", async () => {
		mocks.signInEmail.mockResolvedValueOnce({ error: { message: 'Identifiants incorrects' } });
		render(LoginPage);

		await fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

		await waitFor(() => {
			expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
		});
	});

	it('affiche le message de confirmation après envoi du magic link', async () => {
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

	it("affiche l'erreur du magic link en cas d'échec", async () => {
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

	it("masque le bouton Google quand PUBLIC_GOOGLE_ENABLED est false", () => {
		render(LoginPage);
		expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
	});
});
