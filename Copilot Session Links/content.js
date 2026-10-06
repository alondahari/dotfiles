const sessionPath = /^\/sessions\/([0-9a-f-]+)$/i;
const sessionId =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const interceptedReviews = new WeakSet();

function intercept(event) {
		if (!(event.target instanceof Element)) return;

		const anchor = event.target.closest("a[href]");
		if (!anchor) return;
		if (interceptedReviews.has(anchor)) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}

		let url;
		try {
			url = new URL(anchor.href);
		} catch {
			return;
		}

		const match = url.pathname.match(sessionPath);
		if (
			url.protocol !== "http:" ||
			url.hostname !== "127.0.0.1" ||
			url.port !== "43119"
		) {
			return;
		}

		if (
			url.pathname === "/slack-review" ||
			/^\/report-ci\/[0-9a-f-]+$/i.test(url.pathname)
		) {
			event.preventDefault();
			event.stopImmediatePropagation();
			if (!interceptedReviews.has(anchor)) {
				interceptedReviews.add(anchor);
				chrome.runtime.sendMessage({
					action: "openLocalAction",
					url: url.toString(),
				});
				setTimeout(() => {
					interceptedReviews.delete(anchor);
				}, 1000);
			}
			return;
		}

		if (!match || !sessionId.test(match[1])) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		window.location.assign(`ghapp://sessions/${match[1]}`);
}

window.addEventListener("pointerdown", intercept, true);
window.addEventListener("mousedown", intercept, true);
window.addEventListener("click", intercept, true);
