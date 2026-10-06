const recentRequests = new Map();

function actionUrl(value) {
	let url;
	try {
		url = new URL(value);
	} catch {
		return null;
	}
	if (
		url.origin !== "http://127.0.0.1:43119" ||
		url.pathname !== "/slack-review" &&
		!/^\/report-ci\/[0-9a-f-]+$/i.test(url.pathname)
	) {
		return null;
	}
	return url;
}

function openAction(value) {
	const url = actionUrl(value);
	if (!url) return Promise.resolve(false);
	const now = Date.now();
	const previous = recentRequests.get(url.toString()) || 0;
	if (now - previous < 2000) return Promise.resolve(true);
	recentRequests.set(url.toString(), now);
	return fetch(url, { cache: "no-store" })
		.then((response) => response.ok)
		.catch(() => false);
}

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
	if (message?.action !== "openLocalAction") return;
	openAction(message.url)
		.then((ok) => respond({ ok }))
		.catch(() => respond({ ok: false }));
	return true;
});

chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
	if (!actionUrl(details.url)) return;
	chrome.tabs.get(details.sourceTabId, (sourceTab) => {
		if (!sourceTab?.url?.startsWith("https://github.com/")) return;
		chrome.tabs.remove(details.tabId);
		openAction(details.url);
	});
});
