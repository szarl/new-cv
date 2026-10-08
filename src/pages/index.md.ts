import type { APIRoute } from 'astro';
import { homeMarkdown } from '../lib/agent-content';

// Markdown version of the homepage. Served at / for `Accept: text/markdown` (see integrations/agent-markdown.mjs).
export const prerender = true;

export const GET: APIRoute = () =>
	new Response(homeMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
