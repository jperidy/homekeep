import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import RegisterPage from './+page.svelte';

vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_GOOGLE_ENABLED: 'false', PUBLIC_BETTER_AUTH_URL: 'http://localhost:5173' }
}));

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

const mocks = vi.hoisted(() => ({
	signUpEmail: vi.fn(),
	signInSocial: vi.fn()
}));

vi.mock('$lib/auth-client', () => ({
	signUp: { email: mocks.signUpEmail },
	signIn: { social: mocks.signInSocial }
}));

describe('RegisterPage', () => {
	beforeEach(() => {
		mocks.signUpEmail.mockReset();
	});

	it('renders all form fields', () => {
		render(RegisterPage);
		expect(screen.getByLabelText('Nom complet')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
	});

	it('shows the success screen after registration', async () => {
		mocks.signUpEmail.mockResolvedValueOnce({ error: null });
		render(RegisterPage);

		await fireEvent.input(screen.getByLabelText('Nom complet'), {
			target: { value: 'Jean Dupont' }
		});
		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'jean@example.com' }
		});
		await fireEvent.input(screen.getByLabelText('Mot de passe'), {
			target: { value: 'secret123' }
		});
		await fireEvent.submit(
			screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!
		);

		await waitFor(() => {
			expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument();
		});
	});

	it('calls signUp.email with the correct parameters', async () => {
		mocks.signUpEmail.mockResolvedValueOnce({ error: null });
		render(RegisterPage);

		await fireEvent.input(screen.getByLabelText('Nom complet'), {
			target: { value: 'Jean Dupont' }
		});
		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'jean@example.com' }
		});
		await fireEvent.input(screen.getByLabelText('Mot de passe'), {
			target: { value: 'secret123' }
		});
		await fireEvent.submit(
			screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!
		);

		await waitFor(() => {
			expect(mocks.signUpEmail).toHaveBeenCalledWith({
				name: 'Jean Dupont',
				email: 'jean@example.com',
				password: 'secret123',
				callbackURL: '/app'
			});
		});
	});

	it('shows an error message when registration fails', async () => {
		mocks.signUpEmail.mockResolvedValueOnce({ error: { message: 'Email déjà utilisé' } });
		render(RegisterPage);

		await fireEvent.submit(
			screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!
		);

		await waitFor(() => {
			expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument();
		});
	});

	it('hides the Google button when PUBLIC_GOOGLE_ENABLED is false', () => {
		render(RegisterPage);
		expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
	});

	it('contains a link to the login page', () => {
		render(RegisterPage);
		expect(screen.getByRole('link', { name: /se connecter/i })).toHaveAttribute('href', '/login');
	});

	it('contains a link to the terms of service', () => {
		render(RegisterPage);
		expect(
			screen.getByRole('link', { name: /conditions d'utilisation/i })
		).toHaveAttribute('href', '/terms');
	});
});
