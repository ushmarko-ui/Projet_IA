import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto ne fonctionne pas pour GitHub Pages, on utilise adapter-static
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // Important pour que les rafraîchissements de page ne fassent pas d'erreur
			precompress: false,
			strict: true
		}),
		paths: {
			// REMPLACE 'Projet_IA' par le nom exact de ton dépôt sur GitHub si c'est différent
			base: process.env.NODE_ENV === 'production' ? '/Projet_IA' : '',
		}
	}
};

export default config;