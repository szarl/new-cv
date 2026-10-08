// Checks the real build output (run `npm run build` first; `npm test` does both).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createRouter } from './vercel-router.mjs';

const output = new URL('../.vercel/output/', import.meta.url).pathname;
const request = createRouter(output);
const HTML = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

test('homepage serves Markdown for Accept: text/markdown', () => {
	const res = request('/', { Accept: 'text/markdown' });
	assert.equal(res.status, 200);
	assert.match(res.headers['content-type'], /^text\/markdown/);
	assert.equal(res.headers.vary, 'Accept');
	assert.match(res.body, /^# Karol Rutkowski - AI Engineer/);
	assert.match(res.body, /\(https:\/\/karol-rutkowski\.com\/llms\.txt\)/);
});

test('homepage still serves HTML to browsers, with Vary: Accept', () => {
	for (const accept of [HTML, 'text/html', undefined]) {
		const res = request('/', accept ? { Accept: accept } : {});
		assert.equal(res.status, 200);
		assert.match(res.headers['content-type'], /^text\/html/);
		assert.equal(res.headers.vary, 'Accept');
		assert.match(res.body, /^<!DOCTYPE html>/i);
	}
});

test('unknown paths return 404 with a Markdown body for Markdown requests', () => {
	const res = request('/__ora-404-probe-nply79co', { Accept: 'text/markdown' });
	assert.equal(res.status, 404);
	assert.match(res.headers['content-type'], /^text\/markdown/);
	assert.ok(res.body.length >= 20);
	assert.match(res.body, /\(https:\/\/karol-rutkowski\.com\/(llms\.txt|sitemap-index\.xml)\)/);
});

test('unknown paths still return the HTML 404 page to browsers', () => {
	const res = request('/__ora-404-probe-nply79co', { Accept: HTML });
	assert.equal(res.status, 404);
	assert.match(res.body, /404 - Page Not Found/);
	assert.match(res.body, /^<!DOCTYPE html>/i);
});

test('other pages and the contact function are unaffected', () => {
	assert.match(request('/projects', { Accept: HTML }).body, /<title>Projects/);
	assert.equal(request('/contact', { Accept: 'text/markdown' }).function, '_render');
});

test('llms.txt follows the llmstxt.org layout and has when-to-use guidance', () => {
	const res = request('/llms.txt');
	assert.equal(res.status, 200);
	const lines = res.body.split('\n');
	assert.match(lines[0], /^# Karol Rutkowski$/);
	assert.match(lines[2], /^> /);
	const firstH2 = lines.findIndex((l) => l.startsWith('## '));
	assert.equal(lines[firstH2], '## When to use this site');
	assert.ok(!lines.slice(1, firstH2).some((l) => l.startsWith('#')), 'no headings between the summary and the first H2');
	// Every item in an H2 section is a "- [name](url): notes" link.
	const items = lines.slice(firstH2).filter((l) => l.startsWith('- '));
	assert.ok(items.length >= 5);
	for (const item of items) assert.match(item, /^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/);
	const whenToUse = lines.slice(firstH2 + 1, lines.findIndex((l, i) => i > firstH2 && l.startsWith('## ')));
	assert.ok(whenToUse.filter((l) => /^- \[.+\]\(.+\): Use when /.test(l)).length >= 4);
});

test('homepage JSON-LD has a complete Organization', () => {
	const html = readFileSync(`${output}static/index.html`, 'utf8');
	const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
	const graph = JSON.parse(json)['@graph'];
	const org = graph.find((node) => node['@id'] === 'https://karol-rutkowski.com/#organization');
	assert.equal(org['@type'], 'Organization');
	assert.equal(org.contactPoint['@type'], 'ContactPoint');
	assert.equal(org.contactPoint.email, 'karol.rutkowski.a@gmail.com');
	assert.ok(org.contactPoint.telephone && org.contactPoint.contactType);
	assert.deepEqual(org.address, { '@type': 'PostalAddress', addressLocality: 'Wrocław', addressCountry: 'PL' });
	assert.match(html, /<link rel="alternate" type="text\/markdown" href="\/index.md">/);
});

test('sitemap lists only HTML pages, not the agent files', () => {
	const sitemap = readFileSync(`${output}static/sitemap-0.xml`, 'utf8');
	assert.doesNotMatch(sitemap, /index\.md|404\.md|llms\.txt/);
});
