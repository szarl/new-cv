import type { APIRoute } from 'astro';
import { notFoundMarkdown } from '../lib/agent-content';

// Markdown 404 body. Served with status 404 for unknown paths requested with `Accept: text/markdown`.
export const prerender = true;

export const GET: APIRoute = () =>
	new Response(notFoundMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
