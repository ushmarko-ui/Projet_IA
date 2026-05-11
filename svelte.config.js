import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		// PRERENDER DOIT ÊTRE ICI, DANS KIT
		prerender: {
			handleHttpError: 'warn' // C'est encore plus simple : ça transforme les erreurs en simples avertissements
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/Projet_IA' : '',
		}
	}
};

export default config;