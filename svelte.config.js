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
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		// AJOUTE CE BLOC ICI JUSTE APRÈS ADAPTER
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// On ignore les erreurs 404 (images manquantes) pour ne pas bloquer le déploiement
				if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg')) {
					return;
				}
				throw new Error(message);
			}
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/Projet_IA' : '',
		}
	}
};

export default config;