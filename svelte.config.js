import adapter from '@sveltejs/adapter-auto'; // On repasse en auto pour Vercel
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		// On supprime les réglages "paths" et "base" qui causaient l'erreur
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;