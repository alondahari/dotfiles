#!/usr/bin/env node

const http = require("node:http");

const host = "127.0.0.1";
const port = 43119;
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const server = http.createServer((request, response) => {
	const url = new URL(request.url, `http://${host}:${port}`);
	const match = url.pathname.match(/^\/sessions\/([^/]+)$/);
	const sessionId = match ? decodeURIComponent(match[1]) : "";

	if (!["GET", "HEAD"].includes(request.method) || !sessionPattern.test(sessionId)) {
		response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Session link not found.\n");
		return;
	}

	const target = `ghapp://sessions/${encodeURIComponent(sessionId)}`;
	const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Open Copilot session</title>
<style>
body { font: 16px system-ui; margin: 3rem; color: #1f2328; }
a { display: inline-block; padding: .6rem 1rem; border-radius: .4rem; color: white; background: #0969da; text-decoration: none; }
</style>
</head>
<body>
<p>Opening the GitHub Copilot session…</p>
<p><a href="${target}">Open session</a></p>
<script>window.location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

	response.writeHead(200, {
		"Cache-Control": "no-store",
		"Content-Length": Buffer.byteLength(body),
		"Content-Type": "text/html; charset=utf-8",
		"X-Content-Type-Options": "nosniff",
	});
	response.end(request.method === "HEAD" ? undefined : body);
});

server.listen(port, host);
