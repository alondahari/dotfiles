const sessionPath = /^\/sessions\/([0-9a-f-]+)$/i;
const sessionId =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

document.addEventListener(
	"click",
	(event) => {
		if (!(event.target instanceof Element)) return;

		const anchor = event.target.closest("a[href]");
		if (!anchor) return;

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
			url.port !== "43119" ||
			!match ||
			!sessionId.test(match[1])
		) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();
		window.location.assign(`ghapp://sessions/${match[1]}`);
	},
	true,
);
