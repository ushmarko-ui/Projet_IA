import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			// LE BOUTON MAGIQUE : On ignore les erreurs de liens
			handleHttpError: 'ignore',
            handleMissingId: 'ignore'
		}
	}
};

export default config;