// @ts-check
import { readFile, writeFile } from 'node:fs/promises';

// Markdown content negotiation on Vercel.
//
// Prerendered pages are served straight from Vercel's filesystem, so Astro middleware never sees them.
// Instead this integration adds Build Output API routes to .vercel/output/config.json (written by
// @astrojs/vercel, which always runs its hooks first):
//   - GET / with `Accept: text/markdown` serves /index.md, everything else on / gets `Vary: Accept`;
//   - an unknown path with `Accept: text/markdown` gets /404.md with status 404 instead of /404.html.
// https://vercel.com/docs/build-output-api/v3/configuration#routes

export const MARKDOWN_ACCEPT = '.*text/markdown.*';
const acceptsMarkdown = [{ type: 'header', key: 'accept', value: MARKDOWN_ACCEPT }];
const markdownHeaders = { 'content-type': 'text/markdown; charset=utf-8', vary: 'Accept' };

/** @param {{ version: number, routes?: any[] }} config */
export function addAgentRoutes(config) {
	const routes = [...(config.routes ?? [])];
	const filesystem = routes.findIndex((route) => route.handle === 'filesystem');
	if (filesystem === -1) throw new Error('agent-markdown: no `handle: filesystem` route in Vercel config');

	const homepage = [
		{ src: '^/$', headers: { vary: 'Accept' }, continue: true },
		{ src: '^/$', has: acceptsMarkdown, dest: '/index.md', headers: markdownHeaders },
	];
	routes.splice(filesystem, 0, ...homepage);

	// The adapter's catch-all 404 is the last route; the Markdown variant goes right before it.
	const notFound = routes.findIndex((route, i) => i > filesystem && route.status === 404);
	const markdownNotFound = { src: '/.*', has: acceptsMarkdown, dest: '/404.md', status: 404, headers: markdownHeaders };
	routes.splice(notFound === -1 ? routes.length : notFound, 0, markdownNotFound);

	return { ...config, routes };
}

/** @returns {import('astro').AstroIntegration} */
export default function agentMarkdown() {
	/** @type {URL} */
	let root;
	return {
		name: 'agent-markdown',
		hooks: {
			'astro:config:done': ({ config }) => {
				root = config.root;
			},
			'astro:build:done': async ({ logger }) => {
				const configUrl = new URL('./.vercel/output/config.json', root);
				let config;
				try {
					config = JSON.parse(await readFile(configUrl, 'utf8'));
				} catch {
					logger.warn('No .vercel/output/config.json found, skipping Markdown routes.');
					return;
				}
				await writeFile(configUrl, JSON.stringify(addAgentRoutes(config), null, '\t'));
				logger.info('Added Markdown negotiation routes for / and 404s.');
			},
		},
	};
}
