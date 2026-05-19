/**
 * Seed de développement local.
 * Crée un compte admin et provisionne le catalogue d'équipements.
 * Idempotent : peut être relancé sans risque de doublons.
 *
 * Usage : pnpm seed
 * Credentials admin : admin@homekeep.dev / admin1234
 */
import 'dotenv/config';
import { scrypt, randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '../src/lib/server/prisma';

// ── Password hashing (même algorithme que better-auth) ───────────────────────

function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	return new Promise((resolve, reject) => {
		scrypt(
			password.normalize('NFKC'),
			salt,
			64,
			{ N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
			(err, key) => {
				if (err) reject(err);
				else resolve(`${salt}:${(key as Buffer).toString('hex')}`);
			}
		);
	});
}

// ── Données du catalogue ──────────────────────────────────────────────────────

const EQUIPMENT_TYPES = [
	// Chauffage
	{ name: 'Chaudière à gaz',           category: 'Chauffage',    description: 'Chaudière à condensation ou classique, alimentation gaz naturel ou GPL.' },
	{ name: 'Chaudière fioul',            category: 'Chauffage',    description: 'Chaudière à condensation alimentée au fioul domestique.' },
	{ name: 'Pompe à chaleur air/eau',    category: 'Chauffage',    description: 'PAC aérothermique connectée au circuit de chauffage central.' },
	{ name: 'Pompe à chaleur air/air',    category: 'Chauffage',    description: "PAC réversible pour chauffage et climatisation d'appoint." },
	{ name: 'Radiateur électrique',       category: 'Chauffage',    description: 'Radiateur à inertie ou à panneau rayonnant.' },
	{ name: 'Poêle à bois / granulés',   category: 'Chauffage',    description: 'Appareil de chauffage à combustion : bûches ou pellets.' },
	{ name: 'Insert cheminée',            category: 'Chauffage',    description: 'Insert fermé ou foyer fermé intégré dans une cheminée existante.' },
	// Eau chaude sanitaire
	{ name: 'Chauffe-eau électrique',      category: 'Plomberie',    description: "Ballon d'eau chaude électrique (cumulus)." },
	{ name: 'Chauffe-eau thermodynamique', category: 'Plomberie',   description: "Ballon d'eau chaude couplé à une pompe à chaleur." },
	{ name: 'Ballon solaire',              category: 'Plomberie',   description: 'Chauffe-eau solaire individuel (CESI).' },
	{ name: "Adoucisseur d'eau",           category: 'Plomberie',   description: "Système de traitement de l'eau pour réduire le calcaire." },
	// Ventilation
	{ name: 'VMC simple flux',            category: 'Ventilation',  description: 'Ventilation mécanique contrôlée à extraction uniquement.' },
	{ name: 'VMC double flux',            category: 'Ventilation',  description: "VMC avec récupérateur de chaleur sur l'air extrait." },
	// Électricité
	{ name: 'Tableau électrique',         category: 'Électricité',  description: 'Tableau de distribution avec disjoncteurs et différentiels.' },
	{ name: 'Installation photovoltaïque', category: 'Électricité', description: "Panneaux solaires pour production d'électricité." },
	{ name: 'Borne de recharge VE',       category: 'Électricité',  description: 'Point de charge pour véhicule électrique.' },
	// Toiture
	{ name: 'Toiture tuiles',             category: 'Toiture',      description: 'Couverture en tuiles terre cuite ou béton.' },
	{ name: 'Toiture ardoises',           category: 'Toiture',      description: 'Couverture en ardoises naturelles ou fibrociment.' },
	{ name: 'Toiture zinc / bac acier',   category: 'Toiture',      description: 'Couverture métallique : zinc, acier laqué ou aluminium.' },
	{ name: 'Gouttières',                 category: 'Toiture',      description: 'Système de collecte et évacuation des eaux pluviales.' },
	// Extérieur
	{ name: 'Piscine',                    category: 'Extérieur',    description: 'Piscine enterrée ou hors-sol avec système de filtration.' },
	{ name: 'Portail motorisé',           category: 'Extérieur',    description: 'Portail coulissant ou battant avec motorisation.' },
	{ name: "Système d'arrosage",         category: 'Extérieur',   description: 'Arrosage automatique par asperseurs ou goutte-à-goutte.' },
	// Sécurité
	{ name: 'Alarme intrusion',           category: 'Sécurité',     description: "Système d'alarme avec détecteurs et centrale." },
	{ name: 'Détecteurs de fumée',        category: 'Sécurité',     description: 'DAAF obligatoires : détecteurs avertisseurs autonomes.' },
	{ name: 'Détecteur CO',              category: 'Sécurité',     description: 'Détecteur de monoxyde de carbone.' },
] satisfies { name: string; category: string; description: string }[];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seedAdmin() {
	const email = 'admin@homekeep.dev';
	const password = 'admin1234';

	const admin = await prisma.user.upsert({
		where: { email },
		update: { role: 'ADMIN', emailVerified: true },
		create: {
			id: randomUUID(),
			name: 'Admin HomeKeep',
			email,
			emailVerified: true,
			role: 'ADMIN'
		}
	});

	// Créer le compte credential s'il n'existe pas encore
	const existing = await prisma.account.findFirst({
		where: { userId: admin.id, providerId: 'credential' }
	});
	if (!existing) {
		const hashed = await hashPassword(password);
		await prisma.account.create({
			data: {
				id: randomUUID(),
				accountId: admin.id,
				providerId: 'credential',
				userId: admin.id,
				password: hashed
			}
		});
	}

	console.log(`  ✓ Admin : ${email} / ${password}`);
}

async function seedEquipmentTypes() {
	let created = 0;
	let updated = 0;

	for (const type of EQUIPMENT_TYPES) {
		const result = await prisma.equipmentType.upsert({
			where: { name: type.name },
			update: { category: type.category, description: type.description },
			create: { id: randomUUID(), ...type }
		});
		if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
		else updated++;
	}

	console.log(`  ✓ ${EQUIPMENT_TYPES.length} types d'équipement (${created} créés, ${updated} mis à jour)`);
}

// ── Règles de maintenance ─────────────────────────────────────────────────────

const MAINTENANCE_RULES: { typeName: string; label: string; intervalWeeks: number; description?: string }[] = [
	// Chaudière à gaz
	{ typeName: 'Chaudière à gaz',             label: 'Révision annuelle',              intervalWeeks: 52,  description: 'Entretien obligatoire par un professionnel certifié.' },
	{ typeName: 'Chaudière à gaz',             label: 'Purge des radiateurs',           intervalWeeks: 52 },
	// Chaudière fioul
	{ typeName: 'Chaudière fioul',             label: 'Révision annuelle',              intervalWeeks: 52,  description: 'Entretien obligatoire par un professionnel certifié.' },
	// Pompe à chaleur air/eau
	{ typeName: 'Pompe à chaleur air/eau',     label: 'Entretien annuel',               intervalWeeks: 52 },
	{ typeName: 'Pompe à chaleur air/eau',     label: 'Nettoyage des filtres',          intervalWeeks: 12 },
	// Pompe à chaleur air/air
	{ typeName: 'Pompe à chaleur air/air',     label: 'Nettoyage des filtres',          intervalWeeks: 4 },
	{ typeName: 'Pompe à chaleur air/air',     label: 'Entretien annuel',               intervalWeeks: 52 },
	// Chauffe-eau électrique
	{ typeName: 'Chauffe-eau électrique',      label: 'Détartrage',                     intervalWeeks: 52 },
	{ typeName: 'Chauffe-eau électrique',      label: "Changement de l'anode magnésium", intervalWeeks: 104, description: 'À remplacer tous les 2 ans environ.' },
	// Chauffe-eau thermodynamique
	{ typeName: 'Chauffe-eau thermodynamique', label: 'Entretien annuel',               intervalWeeks: 52 },
	{ typeName: 'Chauffe-eau thermodynamique', label: "Nettoyage du filtre à air",      intervalWeeks: 12 },
	// Adoucisseur d'eau
	{ typeName: "Adoucisseur d'eau",           label: 'Réapprovisionnement en sel',     intervalWeeks: 4 },
	{ typeName: "Adoucisseur d'eau",           label: 'Désinfection du bac à sel',      intervalWeeks: 26 },
	// VMC simple flux
	{ typeName: 'VMC simple flux',             label: 'Nettoyage des bouches',          intervalWeeks: 26 },
	{ typeName: 'VMC simple flux',             label: 'Remplacement des filtres',       intervalWeeks: 52 },
	// VMC double flux
	{ typeName: 'VMC double flux',             label: 'Remplacement filtres G4',        intervalWeeks: 13, description: 'Filtres côté reprise.' },
	{ typeName: 'VMC double flux',             label: 'Remplacement filtres F7',        intervalWeeks: 26, description: 'Filtres côté soufflage.' },
	{ typeName: 'VMC double flux',             label: 'Révision annuelle',              intervalWeeks: 52 },
	// Tableau électrique
	{ typeName: 'Tableau électrique',          label: 'Test des disjoncteurs différentiels', intervalWeeks: 26 },
	// Alarme intrusion
	{ typeName: 'Alarme intrusion',            label: 'Test du système',                intervalWeeks: 13 },
	{ typeName: 'Alarme intrusion',            label: 'Remplacement des batteries',     intervalWeeks: 52 },
	// Détecteurs de fumée
	{ typeName: 'Détecteurs de fumée',         label: 'Test du déclenchement',          intervalWeeks: 13, description: 'Appuyer sur le bouton test de chaque détecteur.' },
];

async function seedMaintenanceRules() {
	let created = 0;
	let updated = 0;

	for (const rule of MAINTENANCE_RULES) {
		const type = await prisma.equipmentType.findUnique({ where: { name: rule.typeName } });
		if (!type) continue;

		const result = await prisma.maintenanceRule.upsert({
			where: { equipmentTypeId_label: { equipmentTypeId: type.id, label: rule.label } },
			update: { intervalWeeks: rule.intervalWeeks, description: rule.description ?? null },
			create: {
				id: randomUUID(),
				equipmentTypeId: type.id,
				label: rule.label,
				intervalWeeks: rule.intervalWeeks,
				description: rule.description ?? null
			}
		});
		if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
		else updated++;
	}

	console.log(`  ✓ ${MAINTENANCE_RULES.length} règles de maintenance (${created} créées, ${updated} mises à jour)`);
}

// ── Propriété démo ────────────────────────────────────────────────────────────

type TaskConfig = { ruleLabel: string; dueDate: Date };
type EquipmentConfig = {
	name: string;
	typeName: string;
	brand?: string;
	model?: string;
	installedAt: Date;
	tasks: TaskConfig[];
};

const DEMO_EQUIPMENT: EquipmentConfig[] = [
	{
		name: "Chaudière à gaz principale",
		typeName: "Chaudière à gaz",
		brand: "Viessmann",
		model: "Vitodens 100-W",
		installedAt: new Date("2023-01-15"),
		tasks: [
			{ ruleLabel: "Révision annuelle",    dueDate: new Date("2025-01-15") },
			{ ruleLabel: "Purge des radiateurs", dueDate: new Date("2025-01-15") }
		]
	},
	{
		name: "VMC double flux",
		typeName: "VMC double flux",
		installedAt: new Date("2024-06-01"),
		tasks: [
			{ ruleLabel: "Remplacement filtres G4", dueDate: new Date("2026-04-01") },
			{ ruleLabel: "Remplacement filtres F7", dueDate: new Date("2026-06-16") },
			{ ruleLabel: "Révision annuelle",       dueDate: new Date("2026-12-01") }
		]
	},
	{
		name: "Détecteurs de fumée",
		typeName: "Détecteurs de fumée",
		installedAt: new Date("2026-03-01"),
		tasks: [
			{ ruleLabel: "Test du déclenchement", dueDate: new Date("2026-06-01") }
		]
	}
];

async function seedDemoProperty() {
	const admin = await prisma.user.findFirst({ where: { email: "admin@homekeep.dev" } });
	if (!admin) {
		console.log("  ⚠ Admin non trouvé, skip propriété démo");
		return;
	}

	let property = await prisma.property.findFirst({
		where: { userId: admin.id, name: "Mon appartement de test" }
	});
	if (!property) {
		property = await prisma.property.create({
			data: {
				id: randomUUID(),
				userId: admin.id,
				name: "Mon appartement de test",
				address: "12 rue de la Paix, 75001 Paris"
			}
		});
	}

	for (const cfg of DEMO_EQUIPMENT) {
		const type = await prisma.equipmentType.findUnique({ where: { name: cfg.typeName } });
		if (!type) continue;

		let equipment = await prisma.equipment.findFirst({
			where: { propertyId: property.id, name: cfg.name }
		});
		if (!equipment) {
			equipment = await prisma.equipment.create({
				data: {
					id: randomUUID(),
					propertyId: property.id,
					equipmentTypeId: type.id,
					name: cfg.name,
					brand: cfg.brand ?? null,
					model: cfg.model ?? null,
					installedAt: cfg.installedAt
				}
			});
		}

		const plan = await prisma.maintenancePlan.upsert({
			where: { equipmentId: equipment.id },
			update: {},
			create: { id: randomUUID(), equipmentId: equipment.id }
		});

		await prisma.maintenanceTask.deleteMany({ where: { planId: plan.id, completedAt: null } });

		for (const taskCfg of cfg.tasks) {
			const rule = await prisma.maintenanceRule.findFirst({
				where: { equipmentTypeId: type.id, label: taskCfg.ruleLabel }
			});
			await prisma.maintenanceTask.create({
				data: {
					id: randomUUID(),
					planId: plan.id,
					ruleId: rule?.id ?? null,
					title: taskCfg.ruleLabel,
					dueDate: taskCfg.dueDate
				}
			});
		}
	}

	const overdueCount = DEMO_EQUIPMENT.flatMap(d => d.tasks).filter(t => t.dueDate < new Date()).length;
	const upcomingCount = DEMO_EQUIPMENT.flatMap(d => d.tasks).filter(t => t.dueDate >= new Date()).length;
	console.log(`  ✓ Propriété démo "${property.name}" (${overdueCount} tâches en retard, ${upcomingCount} à venir)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('🌱 Seed en cours…');
try {
	await seedAdmin();
	await seedEquipmentTypes();
	await seedMaintenanceRules();
	await seedDemoProperty();
	console.log('✅ Seed terminé.');
} finally {
	await prisma.$disconnect();
}
