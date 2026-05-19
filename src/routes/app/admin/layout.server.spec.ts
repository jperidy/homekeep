import { describe, it, expect } from 'vitest';
import { load } from './+layout.server';

const asUser = (role?: string) =>
	({ locals: { user: role !== undefined ? { id: 'user-1', role } : { id: 'user-1' } } }) as any;

const noUser = { locals: { user: null } } as any;

describe('/app/admin layout — ADMIN role guard', () => {
	it('redirects to /app for a USER role', async () => {
		await expect(load(asUser('USER'))).rejects.toMatchObject({
			status: 302,
			location: '/app'
		});
	});

	it('redirects to /app when the role field is absent', async () => {
		await expect(load(asUser())).rejects.toMatchObject({
			status: 302,
			location: '/app'
		});
	});

	it('redirects to /login for an unauthenticated user', async () => {
		await expect(load(noUser)).rejects.toMatchObject({
			status: 302,
			location: '/login'
		});
	});

	it('allows access for an ADMIN user', async () => {
		const result = await load(asUser('ADMIN'));
		expect(result).toBeUndefined();
	});
});
