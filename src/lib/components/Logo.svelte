<script lang="ts">
	let { class: className = 'w-7 h-7' }: { class?: string } = $props();
</script>

<!-- Logo maison HomeKeep — SVG custom, ne pas remplacer par une icône générique -->
<svg class={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M16 3L3 13V29H12V20H20V29H29V13L16 3Z" fill="currentColor" opacity="0.15" />
	<path d="M16 3L3 13V29H12V20H20V29H29V13L16 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
</svg>
