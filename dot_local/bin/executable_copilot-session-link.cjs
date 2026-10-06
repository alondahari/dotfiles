#!/usr/bin/env node

const http = require("node:http");
const { spawn } = require("node:child_process");

const host = "127.0.0.1";
const port = 43119;
const recentCopilotDrafts = new Map();
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slackChannel = "plan-track-agentic-toolkit";
const slackChannelUrl =
	"slack://channel?team=E01DLHH5JM6&id=C0ASY8L0CQ3&host=slack.com";

function reviewRequestMessage(title, pullRequestUrl, size) {
	const sizeMarker = size ? ` (${size})` : "";
	return `:review:${sizeMarker} [${title}](${pullRequestUrl})`;
}

function openSlackReviewDraft(title, pullRequestUrl, size) {
	const message = reviewRequestMessage(title, pullRequestUrl, size);
	const script = `
on run argv
	set theMessage to item 1 of argv
	set the clipboard to theMessage
	open location "${slackChannelUrl}"
	delay 2
	tell application "Slack" to activate
	delay 0.8
	tell application "System Events"
		keystroke "v" using command down
	end tell
end run`;
	const child = spawn("/usr/bin/osascript", ["-e", script, message], {
		detached: true,
		stdio: "ignore",
	});
	child.unref();
	return message;
}

function openCopilotDraft(sessionId) {
	const message = "CI is broken—investigate and fix it.";
	const now = Date.now();
	const previous = recentCopilotDrafts.get(sessionId) || 0;
	if (now - previous < 10000) return message;
	recentCopilotDrafts.set(sessionId, now);
	const target = `ghapp://sessions/${encodeURIComponent(sessionId)}`;
	const script = `
on run argv
	set theMessage to item 1 of argv
	set the clipboard to theMessage
	open location "${target}"
	delay 0.5
	tell application id "com.github.githubapp" to activate
	delay 0.1
	tell application "System Events"
		tell process "github"
			keystroke "v" using command down
		end tell
	end tell
end run`;
	const child = spawn("/usr/bin/osascript", ["-e", script, message], {
		detached: true,
		stdio: "ignore",
	});
	child.unref();
	return message;
}

const server = http.createServer((request, response) => {
	const url = new URL(request.url, `http://${host}:${port}`);
	const ciMatch = url.pathname.match(/^\/report-ci\/([^/]+)$/);
	const ciSessionId = ciMatch ? decodeURIComponent(ciMatch[1]) : "";
	if (ciMatch) {
		if (
			!["GET", "HEAD"].includes(request.method) ||
			!sessionPattern.test(ciSessionId)
		) {
			response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("CI report link not found.\n");
			return;
		}
		const message =
			request.method === "GET"
				? openCopilotDraft(ciSessionId)
				: "CI is broken—investigate and fix it.";
		response.writeHead(200, {
			"Cache-Control": "no-store",
			"Content-Type": "text/plain; charset=utf-8",
			"X-Content-Type-Options": "nosniff",
		});
		response.end(request.method === "HEAD" ? undefined : `${message}\n`);
		return;
	}
	const reviewRoute = url.pathname === "/slack-review";
	if (reviewRoute) {
		const title = url.searchParams.get("title")?.trim() || "";
		const pullRequestUrl = url.searchParams.get("url") || "";
		const size = (url.searchParams.get("size")?.trim() || "").toUpperCase();
		const validPullRequestUrl =
			/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(pullRequestUrl);
		if (
			!["GET", "HEAD"].includes(request.method) ||
			!title ||
			title.length > 300 ||
			(size && !/^(?:XS|S|M|L|XL|XXL)$/.test(size)) ||
			!validPullRequestUrl
		) {
			response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("Review request link not found.\n");
			return;
		}
		const message =
			request.method === "GET"
				? openSlackReviewDraft(title, pullRequestUrl, size)
				: reviewRequestMessage(title, pullRequestUrl, size);
		const body = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Slack review draft</title></head>
<body><p>Opening an unsent draft in #${slackChannel}:</p><pre>${message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre></body>
</html>`;
		response.writeHead(200, {
			"Cache-Control": "no-store",
			"Content-Length": Buffer.byteLength(body),
			"Content-Type": "text/html; charset=utf-8",
			"X-Content-Type-Options": "nosniff",
		});
		response.end(request.method === "HEAD" ? undefined : body);
		return;
	}
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
