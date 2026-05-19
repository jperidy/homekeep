<script lang="ts">
	interface Props {
		message: string;
		class?: string;
	}

	let { message, class: className = '' }: Props = $props();
</script>

<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 {className}">{message}</p>
