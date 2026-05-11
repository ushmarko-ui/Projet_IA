import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static est OBLIGATOIRE pour GitHub
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			// REMPLACE BIEN 'Projet_IA' par le nom exact de ton dépôt GitHub
			base: process.env.NODE_ENV === 'production' ? '/Projet_IA' : '',
		},
		prerender: {
			handleHttpError: 'warn' // Pour que les images manquantes ne bloquent plus le build !
		}
	}
};

export default config;