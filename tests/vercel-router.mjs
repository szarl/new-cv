// Minimal model of Vercel's Build Output API routing (routes before/after `handle: filesystem`,
// `has` header conditions, `continue`, `headers`, `status`), used to check .vercel/output/config.json
// against requests the way an agent would send them. https://vercel.com/docs/build-output-api/v3/configuration#routes
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function staticFile(staticDir, path) {
	const candidates = [path, `${path}.html`, join(path, 'index.html')];
	for (const candidate of candidates) {
		const file = join(staticDir, candidate);
		if (existsSync(file) && statSync(file).isFile()) return file;
	}
	return null;
}

const matches = (route, path, headers) =>
	new RegExp(route.src).test(path) &&
	(route.has ?? []).every((cond) => {
		const value = headers[cond.key.toLowerCase()];
		return value !== undefined && (cond.value === undefined || new RegExp(`^(?:${cond.value})$`).test(value));
	});

export function createRouter(outputDir) {
	const config = JSON.parse(readFileSync(join(outputDir, 'config.json'), 'utf8'));
	const staticDir = join(outputDir, 'static');
	const filesystem = config.routes.findIndex((route) => route.handle === 'filesystem');

	return function request(path, requestHeaders = {}) {
		const headers = Object.fromEntries(Object.entries(requestHeaders).map(([k, v]) => [k.toLowerCase(), v]));
		const responseHeaders = {};
		const serve = (file, status, extra = {}) => {
			const result = { status, headers: { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', ...responseHeaders, ...extra } };
			result.body = readFileSync(file, 'utf8');
			return result;
		};
		const apply = (route) => {
			if (!matches(route, path, headers)) return undefined;
			Object.assign(responseHeaders, route.headers ?? {});
			if (route.continue || !route.dest) return undefined;
			const file = staticFile(staticDir, route.dest);
			if (file) return serve(file, route.status ?? 200);
			return { status: route.status ?? 200, function: route.dest, headers: { ...responseHeaders } };
		};

		for (const route of config.routes.slice(0, filesystem)) {
			const result = apply(route);
			if (result) return result;
		}
		const file = staticFile(staticDir, path);
		if (file) return serve(file, 200);
		for (const route of config.routes.slice(filesystem + 1)) {
			const result = apply(route);
			if (result) return result;
		}
		return { status: 404, headers: responseHeaders };
	};
}
