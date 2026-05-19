import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

const mocks = vi.hoisted(() => ({
	propertyCreate: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: {
		property: {
			create: mocks.propertyCreate
		}
	}
}));

import { actions } from './+page.server';

function makeEvent(fields: Record<string, string>, userId = 'user-1') {
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.append(k, v);
	return {
		request: new Request('http://localhost/app/properties/new', {
			method: 'POST',
			body: formData
		}),
		locals: { user: { id: userId }, session: {} }
	} as any;
}

// --- Action tests ---

describe('properties/new — action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when name is empty', async () => {
		const result = await actions.default(makeEvent({ name: '' }));
		expect(result).toMatchObject({ status: 400, data: { error: expect.any(String) } });
		expect(mocks.propertyCreate).not.toHaveBeenCalled();
	});

	it('returns 400 when name is only whitespace', async () => {
		const result = await actions.default(makeEvent({ name: '   ' }));
		expect(result).toMatchObject({ status: 400 });
		expect(mocks.propertyCreate).not.toHaveBeenCalled();
	});

	it('creates a property and redirects to /app', async () => {
		mocks.propertyCreate.mockResolvedValueOnce({ id: 'prop-1' });
		await expect(
			actions.default(makeEvent({ name: 'My apartment', address: '10 rue de la Paix' }))
		).rejects.toMatchObject({ status: 302, location: '/app' });
		expect(mocks.propertyCreate).toHaveBeenCalledWith({
			data: { userId: 'user-1', name: 'My apartment', address: '10 rue de la Paix' }
		});
	});

	it('trims whitespace from name', async () => {
		mocks.propertyCreate.mockResolvedValueOnce({ id: 'prop-2' });
		await expect(
			actions.default(makeEvent({ name: '  My house  ' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.propertyCreate).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ name: 'My house' }) })
		);
	});

	it('stores null when address is blank', async () => {
		mocks.propertyCreate.mockResolvedValueOnce({ id: 'prop-3' });
		await expect(
			actions.default(makeEvent({ name: 'Studio', address: '' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.propertyCreate).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ address: null }) })
		);
	});

	it('stores null when address is absent', async () => {
		mocks.propertyCreate.mockResolvedValueOnce({ id: 'prop-4' });
		await expect(
			actions.default(makeEvent({ name: 'Chalet' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.propertyCreate).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ address: null }) })
		);
	});
});

// --- UI tests ---

describe('properties/new — page', () => {
	it('renders name and address fields', () => {
		render(Page, { props: { form: null } });
		expect(screen.getByLabelText(/nom de la propriété/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument();
	});

	it('renders the submit button', () => {
		render(Page, { props: { form: null } });
		expect(screen.getByRole('button', { name: /ajouter la propriété/i })).toBeInTheDocument();
	});

	it('shows error message from action data', () => {
		render(Page, { props: { form: { error: 'Le nom est requis.', address: '' } } });
		expect(screen.getByText('Le nom est requis.')).toBeInTheDocument();
	});

	it('repopulates the address field after an error', () => {
		render(Page, { props: { form: { error: 'Le nom est requis.', address: '12 rue Rivoli' } } });
		const input = screen.getByLabelText(/adresse/i) as HTMLInputElement;
		expect(input.value).toBe('12 rue Rivoli');
	});
});
