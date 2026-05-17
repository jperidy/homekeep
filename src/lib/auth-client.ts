import { createAuthClient } from 'better-auth/svelte';
import { magicLinkClient } from 'better-auth/client/plugins';
import { env } from '$env/dynamic/public';

export const authClient = createAuthClient({
	baseURL: env.PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:5173',
	plugins: [magicLinkClient()]
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
