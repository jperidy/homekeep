<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	const lastUpdated = '17 mai 2026';
</script>

<div class="min-h-screen bg-white">
	<header class="border-b border-slate-100">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
				<Logo class="w-6 h-6" />
				<span class="text-lg font-bold tracking-tight text-slate-900">HomeKeep</span>
			</a>
			<a href="/login" class="text-sm text-slate-500 hover:text-slate-700 transition-colors">
				Se connecter
			</a>
		</div>
	</header>

	<main class="max-w-3xl mx-auto px-4 sm:px-6 py-16">
		<div class="mb-10">
			<h1 class="text-3xl font-bold text-slate-900 mb-2">Conditions d'utilisation</h1>
			<p class="text-sm text-slate-400">Dernière mise à jour : {lastUpdated}</p>
		</div>

		<div class="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">1. Objet</h2>
				<p>
					HomeKeep est une application de gestion de la maintenance résidentielle. Les présentes
					conditions d'utilisation régissent l'accès et l'utilisation du service proposé par HomeKeep.
					En créant un compte, vous acceptez ces conditions dans leur intégralité.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">2. Accès au service</h2>
				<p>
					L'accès à HomeKeep est réservé aux personnes majeures. Vous êtes responsable de la
					confidentialité de vos identifiants de connexion et de toutes les activités réalisées
					depuis votre compte.
				</p>
				<p class="mt-3">
					Vous vous engagez à fournir des informations exactes lors de votre inscription et à les
					maintenir à jour.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">3. Utilisation acceptable</h2>
				<p>Vous vous engagez à ne pas :</p>
				<ul class="list-disc list-inside mt-2 space-y-1 text-sm">
					<li>utiliser le service à des fins illicites ou frauduleuses ;</li>
					<li>tenter d'accéder aux données d'autres utilisateurs ;</li>
					<li>perturber ou surcharger les infrastructures du service ;</li>
					<li>reproduire ou distribuer le contenu du service sans autorisation.</li>
				</ul>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">4. Données personnelles</h2>
				<p>
					HomeKeep collecte et traite vos données personnelles (nom, email, données de votre
					logement) dans le seul but de vous fournir le service. Vos données ne sont jamais
					vendues à des tiers.
				</p>
				<p class="mt-3">
					Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
					suppression de vos données. Pour exercer ces droits, contactez-nous à
					<a href="mailto:privacy@homekeep.app" class="text-blue-600 hover:underline">privacy@homekeep.app</a>.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">5. Propriété intellectuelle</h2>
				<p>
					L'ensemble du contenu de HomeKeep (interface, textes, logo, code) est la propriété
					exclusive de HomeKeep et est protégé par les lois en vigueur sur la propriété
					intellectuelle. Toute reproduction partielle ou totale est interdite sans autorisation
					préalable.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">6. Limitation de responsabilité</h2>
				<p>
					HomeKeep fournit des informations de maintenance à titre indicatif. Ces informations ne
					se substituent pas aux recommandations de professionnels qualifiés. HomeKeep ne saurait
					être tenu responsable des conséquences d'une intervention réalisée sur la base des
					informations fournies.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">7. Modifications</h2>
				<p>
					HomeKeep se réserve le droit de modifier les présentes conditions à tout moment. Les
					utilisateurs seront notifiés par email en cas de modification substantielle. La
					poursuite de l'utilisation du service après notification vaut acceptation des nouvelles
					conditions.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-800 mb-3">8. Droit applicable</h2>
				<p>
					Les présentes conditions sont soumises au droit français. Tout litige relatif à leur
					interprétation ou exécution sera soumis aux tribunaux compétents de Paris.
				</p>
			</section>
		</div>

		<div class="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-400 flex gap-4">
			<a href="/" class="hover:text-slate-600 transition-colors">Accueil</a>
			<a href="/login" class="hover:text-slate-600 transition-colors">Se connecter</a>
			<a href="/register" class="hover:text-slate-600 transition-colors">Créer un compte</a>
		</div>
	</main>
</div>
