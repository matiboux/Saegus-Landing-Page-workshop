import { defineConfig } from 'astro/config'

import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
	vite: {
		server: {
			watch: {
				usePolling: true,
			},
		},
	},
	integrations: [
		svelte(),
	]
})
