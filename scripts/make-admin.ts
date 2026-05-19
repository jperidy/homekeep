import 'dotenv/config';
import { prisma } from '../src/lib/server/prisma';

const email = process.argv[2];

if (!email) {
	console.error('Usage: pnpm make-admin <email>');
	process.exit(1);
}

try {
	const user = await prisma.user.update({
		where: { email },
		data: { role: 'ADMIN' }
	});
	console.log(`✓ ${user.name} (${user.email}) est maintenant ADMIN`);
} catch (e: unknown) {
	if ((e as { code?: string }).code === 'P2025') {
		console.error(`✗ Aucun utilisateur trouvé avec l'email : ${email}`);
		process.exit(1);
	}
	throw e;
} finally {
	await prisma.$disconnect();
}
