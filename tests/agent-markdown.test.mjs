import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addAgentRoutes, MARKDOWN_ACCEPT } from '../integrations/agent-markdown.mjs';

// The routes @astrojs/vercel writes for this site.
const adapterConfig = {
	version: 3,
	routes: [
		{ src: '^/_astro/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
		{ handle: 'filesystem' },
		{ src: '^\\/contact\\/?$', dest: '_render' },
		{ src: '/.*', dest: '/404.html', status: 404 },
	],
};

test('homepage routes go before the filesystem so they win over index.html', () => {
	const { routes } = addAgentRoutes(adapterConfig);
	const filesystem = routes.findIndex((r) => r.handle === 'filesystem');
	const markdown = routes.findIndex((r) => r.dest === '/index.md');
	const vary = routes.findIndex((r) => r.src === '^/$' && r.continue);
	assert.ok(vary < markdown && markdown < filesystem);
	assert.deepEqual(routes[markdown].has, [{ type: 'header', key: 'accept', value: MARKDOWN_ACCEPT }]);
	assert.equal(routes[markdown].headers['content-type'], 'text/markdown; charset=utf-8');
	assert.equal(routes[markdown].headers.vary, 'Accept');
	assert.equal(routes[vary].headers.vary, 'Accept');
});

test('Markdown 404 goes after function routes and right before the HTML 404', () => {
	const { routes } = addAgentRoutes(adapterConfig);
	const contact = routes.findIndex((r) => r.dest === '_render');
	const markdown404 = routes.findIndex((r) => r.dest === '/404.md');
	const html404 = routes.findIndex((r) => r.dest === '/404.html');
	assert.ok(contact < markdown404 && markdown404 === html404 - 1);
	assert.equal(routes[markdown404].status, 404);
	assert.equal(routes[markdown404].headers['content-type'], 'text/markdown; charset=utf-8');
});

test('leaves the input untouched and keeps every adapter route', () => {
	const before = JSON.stringify(adapterConfig);
	const { routes } = addAgentRoutes(adapterConfig);
	assert.equal(JSON.stringify(adapterConfig), before);
	for (const route of adapterConfig.routes) assert.ok(routes.includes(route));
});

test('accept matcher only fires for Markdown requests', () => {
	const re = new RegExp(`^(?:${MARKDOWN_ACCEPT})$`);
	assert.ok(re.test('text/markdown'));
	assert.ok(re.test('text/markdown, text/html;q=0.9'));
	assert.ok(!re.test('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'));
	assert.ok(!re.test('*/*'));
});

test('fails loudly if the adapter output changes shape', () => {
	assert.throws(() => addAgentRoutes({ version: 3, routes: [] }), /filesystem/);
});
