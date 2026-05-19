import { describe, it, expect } from 'vitest';
import { load } from './+layout.server';

const withSession = (role: string) =>
	({
		locals: {
			session: { id: 'sess-1', token: 'tok' },
			user: { id: 'user-1', name: 'Jean', email: 'jean@test.fr', role }
		}
	}) as any;

const noSession = { locals: { session: null, user: null } } as any;

describe('/app layout — authentication guard', () => {
	it('redirects to /login when there is no session', async () => {
		await expect(load(noSession)).rejects.toMatchObject({
			status: 302,
			location: '/login'
		});
	});

	it('allows access with a valid session', async () => {
		await expect(load(withSession('USER'))).resolves.toMatchObject({ user: { id: 'user-1' } });
	});

	it('returns isAdmin: false for a USER role', async () => {
		await expect(load(withSession('USER'))).resolves.toMatchObject({ isAdmin: false });
	});

	it('returns isAdmin: true for an ADMIN role', async () => {
		await expect(load(withSession('ADMIN'))).resolves.toMatchObject({ isAdmin: true });
	});
});
