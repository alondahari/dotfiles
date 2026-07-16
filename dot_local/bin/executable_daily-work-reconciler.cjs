#!/usr/bin/env node

const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const GH = "/opt/homebrew/bin/gh";
const SQLITE = "/usr/bin/sqlite3";
const PROJECT_OWNER = "github";
const PROJECT_NUMBER = "25157";
const PROJECT_ID = "PVT_kwDNJr_OAXVwsA";
const DATABASE = path.join(os.homedir(), ".copilot", "data.db");
const LOCK_DIRECTORY = path.join(os.tmpdir(), "daily-work-reconciler.lock");
const SESSION_CACHE = path.join(
	os.homedir(),
	".cache",
	"daily-work-session-mappings.json",
);
const SESSION_HISTORY = path.join(
	os.homedir(),
	".cache",
	"daily-work-session-history.json",
);

const FIELDS = {
	sessionId: "PVTF_lADNJr_OAXVwsM4V-R_L",
	sessionStatus: "PVTSSF_lADNJr_OAXVwsM4V-R_M",
	prStatus: "PVTSSF_lADNJr_OAXVwsM4V-R_N",
	ciState: "PVTSSF_lADNJr_OAXVwsM4V-R_P",
	lastSynced: "PVTF_lADNJr_OAXVwsM4V-R_Q",
	sessionLink: "PVTF_lADNJr_OAXVwsM4V-V5d",
	reportBrokenCi: "PVTF_lADNJr_OAXVwsM4WAGTL",
};

const OPTIONS = {
	sessionStatus: {
		"No session": "d07881ec",
		"In progress": "505525bf",
		Idle: "0547eb33",
	},
	prStatus: {
		"No PR": "827cea6f",
		Draft: "70cfacc0",
		Conflicts: "16bda9b5",
		Approved: "8153bd94",
		"In queue": "096c61c5",
		Open: "8743423a",
		Merged: "46969447",
		Closed: "ada1c26d",
	},
	ciState: {
		"No PR": "2c099637",
		Pending: "f1414c4a",
		Passing: "6a9218ed",
		Failing: "a3020b51",
	},
};

const cleanEnvironment = { ...process.env };
delete cleanEnvironment.GH_TOKEN;
delete cleanEnvironment.GITHUB_TOKEN;

function run(file, args, acceptedStatuses = [0]) {
	const result = spawnSync(file, args, {
		encoding: "utf8",
		env: cleanEnvironment,
		maxBuffer: 20 * 1024 * 1024,
	});
	if (!acceptedStatuses.includes(result.status)) {
		const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`;
		throw new Error(`${path.basename(file)} ${args[0]} failed: ${detail}`);
	}
	return result.stdout;
}

function json(file, args, acceptedStatuses = [0]) {
	const output = run(file, args, acceptedStatuses).trim();
	return output ? JSON.parse(output) : null;
}

function gh(args, acceptedStatuses) {
	return json(GH, args, acceptedStatuses);
}

function sqlite(query) {
	return json(SQLITE, ["-readonly", "-json", DATABASE, query]) || [];
}

function projectValue(item, name) {
	const entry = Object.entries(item).find(
		([key]) => key.toLowerCase() === name.toLowerCase(),
	);
	return entry?.[1] ?? null;
}

function setProjectValue(item, name, value) {
	const key =
		Object.keys(item).find((candidate) => candidate.toLowerCase() === name.toLowerCase()) ||
		name;
	item[key] = value;
}

function validWorkspaceId(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
		value || "",
	);
}

function writeSessionMappings(items) {
	const mappings = items
		.map((item) => ({
			itemId: item.id,
			workspaceId: projectValue(item, "Session ID"),
			status: projectValue(item, "Session status"),
		}))
		.filter((mapping) => validWorkspaceId(mapping.workspaceId))
		.sort((left, right) => left.workspaceId.localeCompare(right.workspaceId));
	const content = `${JSON.stringify(mappings)}\n`;
	fs.mkdirSync(path.dirname(SESSION_CACHE), { recursive: true });
	if (fs.existsSync(SESSION_CACHE) && fs.readFileSync(SESSION_CACHE, "utf8") === content) {
		return;
	}
	const temporary = `${SESSION_CACHE}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, content);
	fs.renameSync(temporary, SESSION_CACHE);
}

function readSessionHistory() {
	if (!fs.existsSync(SESSION_HISTORY)) return new Map();
	const entries = JSON.parse(fs.readFileSync(SESSION_HISTORY, "utf8"));
	return new Map(entries.map((entry) => [entry.url, entry]));
}

function writeSessionHistory(items, history) {
	for (const item of items) {
		const workspaceId = projectValue(item, "Session ID");
		const url = item.content?.url;
		if (!url || !validWorkspaceId(workspaceId)) continue;
		history.set(url, { url, itemId: item.id, workspaceId });
	}
	const entries = [...history.values()].sort((left, right) =>
		left.url.localeCompare(right.url),
	);
	const content = `${JSON.stringify(entries)}\n`;
	fs.mkdirSync(path.dirname(SESSION_HISTORY), { recursive: true });
	if (fs.existsSync(SESSION_HISTORY) && fs.readFileSync(SESSION_HISTORY, "utf8") === content) {
		return;
	}
	const temporary = `${SESSION_HISTORY}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, content);
	fs.renameSync(temporary, SESSION_HISTORY);
}

function restoreSessionAssociation(item, history) {
	if (projectValue(item, "Session ID")) return false;
	const previous = history.get(item.content?.url);
	if (
		!previous ||
		previous.itemId === item.id ||
		!validWorkspaceId(previous.workspaceId)
	) {
		return false;
	}
	setText(item.id, FIELDS.sessionId, previous.workspaceId);
	setProjectValue(item, "Session ID", previous.workspaceId);
	return true;
}

function issueCoordinates(content) {
	if (content?.type !== "Issue" || !content.repository || !content.number) {
		return null;
	}
	return { repo: content.repository, number: content.number, url: content.url };
}

function pullRequestCoordinates(url) {
	const match = url.match(
		/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/,
	);
	if (!match) return null;
	return { owner: match[1], repo: match[2], number: Number(match[3]), url };
}

function today() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	}).format(new Date());
}

function editArgs(itemId, fieldId) {
	return [
		"project",
		"item-edit",
		"--id",
		itemId,
		"--project-id",
		PROJECT_ID,
		"--field-id",
		fieldId,
	];
}

function setSelect(itemId, fieldId, optionId) {
	run(GH, [...editArgs(itemId, fieldId), "--single-select-option-id", optionId]);
}

function setText(itemId, fieldId, value) {
	run(GH, [...editArgs(itemId, fieldId), "--text", value]);
}

function setDate(itemId, fieldId, value) {
	run(GH, [...editArgs(itemId, fieldId), "--date", value]);
}

function clearField(itemId, fieldId) {
	run(GH, [...editArgs(itemId, fieldId), "--clear"]);
}

function removeItem(itemId) {
	run(GH, [
		"project",
		"item-delete",
		PROJECT_NUMBER,
		"--owner",
		PROJECT_OWNER,
		"--id",
		itemId,
	]);
}

function sessionState(workspaceId) {
	if (!validWorkspaceId(workspaceId)) return null;
	const rows = sqlite(`
		SELECT
			w.id AS workspace_id,
			w.session_id,
			COALESCE(s.is_running, 0) AS is_running,
			COALESCE(s.was_interrupted, 0) AS was_interrupted,
			s.updated_at,
			(
				SELECT MAX(a.created_at)
				FROM activity_items a
				WHERE a.workspace_id = w.id
					AND a.session_id = w.session_id
					AND a.activity_type IN ('agent_idle', 'agent_asking')
			) AS terminal_at
		FROM workspaces w
		LEFT JOIN sessions s ON s.id = w.session_id
		WHERE w.id = '${workspaceId}'
		LIMIT 1
	`);
	if (rows.length === 0 || !rows[0].session_id) return { exists: false };
	return {
		exists: true,
		isRunning: rows[0].is_running === 1,
		interrupted: rows[0].was_interrupted === 1,
		terminalAt: rows[0].terminal_at,
		status:
			rows[0].is_running === 1 ||
			(rows[0].terminal_at && rows[0].updated_at > rows[0].terminal_at)
				? "In progress"
				: rows[0].was_interrupted === 1
					? "Idle"
					: null,
	};
}

function mergeQueueEntry(pr) {
	const data = gh([
		"api",
		"graphql",
		"-F",
		`owner=${pr.owner}`,
		"-F",
		`name=${pr.repo}`,
		"-F",
		`number=${pr.number}`,
		"-f",
		"query=query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){mergeQueueEntry{id}}}}",
	]);
	return data.data.repository.pullRequest.mergeQueueEntry;
}

function pullRequestDetails(pr) {
	const details = gh([
		"pr",
		"view",
		String(pr.number),
		"--repo",
		`${pr.owner}/${pr.repo}`,
		"--json",
		"state,isDraft,reviewDecision,mergeable,mergeStateStatus,url,updatedAt,mergedAt",
	]);
	return {
		...pr,
		...details,
		inQueue: details.state === "OPEN" && Boolean(mergeQueueEntry(pr)),
	};
}

function prRank(pr) {
	if (pr.state === "MERGED") return 6;
	if (pr.inQueue) return 5;
	if (pr.mergeable === "CONFLICTING" || pr.mergeStateStatus === "DIRTY") return 4;
	if (!pr.isDraft && pr.reviewDecision === "APPROVED") return 3;
	if (pr.state === "OPEN") return 2;
	return 1;
}

function selectPullRequest(urls) {
	const unique = [...new Set(urls)]
		.map(pullRequestCoordinates)
		.filter(Boolean)
		.map(pullRequestDetails);
	return unique.sort((left, right) => {
		const rank = prRank(right) - prRank(left);
		return rank || right.updatedAt.localeCompare(left.updatedAt);
	})[0];
}

function prStatus(pr) {
	if (!pr) return "No PR";
	if (pr.state === "MERGED") return "Merged";
	if (pr.inQueue) return "In queue";
	if (pr.state === "CLOSED") return "Closed";
	if (pr.mergeable === "CONFLICTING" || pr.mergeStateStatus === "DIRTY") {
		return "Conflicts";
	}
	if (pr.isDraft) return "Draft";
	if (pr.reviewDecision === "APPROVED") return "Approved";
	return "Open";
}

function ciState(pr) {
	if (!pr || pr.state !== "OPEN") return "No PR";
	const checks =
		gh(
			[
				"pr",
				"checks",
				String(pr.number),
				"--repo",
				`${pr.owner}/${pr.repo}`,
				"--json",
				"bucket,name,state",
			],
			[0, 1],
		) || [];
	const buckets = checks.map((check) => check.bucket);
	if (buckets.includes("fail")) return "Failing";
	if (
		checks.length === 0 ||
		buckets.includes("pending") ||
		buckets.includes("cancel")
	) {
		return "Pending";
	}
	if (
		buckets.includes("pass") &&
		buckets.every((bucket) => bucket === "pass" || bucket === "skipping")
	) {
		return "Passing";
	}
	return "Pending";
}

function updateSelect(item, fieldName, target, fieldId, options) {
	if (projectValue(item, fieldName) === target) return false;
	setSelect(item.id, fieldId, options[target]);
	setProjectValue(item, fieldName, target);
	return true;
}

function reconcileSession(item) {
	const workspaceId = projectValue(item, "Session ID");
	const currentStatus = projectValue(item, "Session status");
	if (!workspaceId) {
		let changed = false;
		if (projectValue(item, "Report broken CI")) {
			clearField(item.id, FIELDS.reportBrokenCi);
			setProjectValue(item, "Report broken CI", null);
			changed = true;
		}
		return { changed, status: currentStatus };
	}
	const state = sessionState(workspaceId);
	if (!state) return { changed: false, status: currentStatus };

	let changed = false;
	if (!state.exists) {
		changed =
			updateSelect(
				item,
				"Session status",
				"No session",
				FIELDS.sessionStatus,
				OPTIONS.sessionStatus,
			) || changed;
		if (projectValue(item, "Session ID")) {
			clearField(item.id, FIELDS.sessionId);
			changed = true;
		}
		if (projectValue(item, "Session link")) {
			clearField(item.id, FIELDS.sessionLink);
			changed = true;
		}
		if (projectValue(item, "Report broken CI")) {
			clearField(item.id, FIELDS.reportBrokenCi);
			setProjectValue(item, "Report broken CI", null);
			changed = true;
		}
		return { changed, status: "No session" };
	}

	if (state.status) {
		changed =
			updateSelect(
				item,
				"Session status",
				state.status,
				FIELDS.sessionStatus,
				OPTIONS.sessionStatus,
			) || changed;
	}
	const expectedLink = `http://127.0.0.1:43119/sessions/${workspaceId}`;
	if (projectValue(item, "Session link") !== expectedLink) {
		setText(item.id, FIELDS.sessionLink, expectedLink);
		changed = true;
	}
	if (projectValue(item, "Report broken CI") !== expectedLink) {
		setText(item.id, FIELDS.reportBrokenCi, expectedLink);
		setProjectValue(item, "Report broken CI", expectedLink);
		changed = true;
	}
	return { changed, status: state.status || currentStatus };
}

function reconcileItem(item) {
	const issue = issueCoordinates(item.content);
	if (!issue) return { outcome: "unchanged" };

	const issueData = gh([
		"issue",
		"view",
		String(issue.number),
		"--repo",
		issue.repo,
		"--json",
		"state,closedByPullRequestsReferences,url",
	]);
	if (issueData.state === "CLOSED") {
		removeItem(item.id);
		return { outcome: "removed", url: issue.url };
	}

	const sessionResult = reconcileSession(item);
	let changed = sessionResult.changed;
	const linked = projectValue(item, "Linked pull requests") || [];
	const closedBy = issueData.closedByPullRequestsReferences.map((pr) => pr.url);
	const selectedPr = selectPullRequest([...linked, ...closedBy]);
	const targetPrStatus = prStatus(selectedPr);
	const targetCiState = ciState(selectedPr);

	changed =
		updateSelect(
			item,
			"PR status",
			targetPrStatus,
			FIELDS.prStatus,
			OPTIONS.prStatus,
		) || changed;
	changed =
		updateSelect(
			item,
			"CI state",
			targetCiState,
			FIELDS.ciState,
			OPTIONS.ciState,
		) || changed;

	const syncDate = today();
	if (projectValue(item, "Last synced") !== syncDate) {
		setDate(item.id, FIELDS.lastSynced, syncDate);
		changed = true;
	}

	return {
		outcome: changed ? "changed" : "unchanged",
		url: issue.url,
		sessionStatus: sessionResult.status,
		prStatus: targetPrStatus,
		ciState: targetCiState,
	};
}

function reconcilePullRequestItem(item) {
	const coordinates = pullRequestCoordinates(item.content?.url || "");
	if (!coordinates) return { outcome: "unchanged" };

	const pullRequest = pullRequestDetails(coordinates);
	if (pullRequest.state === "MERGED" || pullRequest.state === "CLOSED") {
		removeItem(item.id);
		return { outcome: "removed", url: pullRequest.url };
	}

	const sessionResult = reconcileSession(item);
	let changed = sessionResult.changed;
	const targetPrStatus = prStatus(pullRequest);
	const targetCiState = ciState(pullRequest);

	changed =
		updateSelect(
			item,
			"PR status",
			targetPrStatus,
			FIELDS.prStatus,
			OPTIONS.prStatus,
		) || changed;
	changed =
		updateSelect(
			item,
			"CI state",
			targetCiState,
			FIELDS.ciState,
			OPTIONS.ciState,
		) || changed;

	const syncDate = today();
	if (projectValue(item, "Last synced") !== syncDate) {
		setDate(item.id, FIELDS.lastSynced, syncDate);
		changed = true;
	}

	return {
		outcome: changed ? "changed" : "unchanged",
		url: pullRequest.url,
		sessionStatus: sessionResult.status,
		prStatus: targetPrStatus,
		ciState: targetCiState,
	};
}

function sessionStates(workspaceIds) {
	const ids = workspaceIds.filter(validWorkspaceId);
	if (ids.length === 0) return new Map();
	const quoted = ids.map((id) => `'${id}'`).join(",");
	const rows = sqlite(`
		SELECT
			w.id AS workspace_id,
			w.session_id,
			COALESCE(s.is_running, 0) AS is_running,
			COALESCE(s.was_interrupted, 0) AS was_interrupted,
			s.updated_at,
			(
				SELECT MAX(a.created_at)
				FROM activity_items a
				WHERE a.workspace_id = w.id
					AND a.session_id = w.session_id
					AND a.activity_type IN ('agent_idle', 'agent_asking')
			) AS terminal_at
		FROM workspaces w
		LEFT JOIN sessions s ON s.id = w.session_id
		WHERE w.id IN (${quoted})
	`);
	const states = new Map(ids.map((id) => [id, { exists: false }]));
	for (const row of rows) {
		states.set(
			row.workspace_id,
			row.session_id
				? {
						exists: true,
						isRunning: row.is_running === 1,
						interrupted: row.was_interrupted === 1,
						updatedAt: row.updated_at,
						terminalAt: row.terminal_at,
					}
				: { exists: false },
		);
	}
	return states;
}

function watchSessionStatuses() {
	let cacheContent = "";
	let tracked = new Map();

	function refreshMappings() {
		if (!fs.existsSync(SESSION_CACHE)) return;
		const content = fs.readFileSync(SESSION_CACHE, "utf8");
		if (content === cacheContent) return;
		const mappings = JSON.parse(content);
		const next = new Map();
		for (const mapping of mappings) {
			if (!validWorkspaceId(mapping.workspaceId) || !mapping.itemId) continue;
			const previous = tracked.get(mapping.workspaceId);
			next.set(mapping.workspaceId, {
				...mapping,
				status:
					previous?.itemId === mapping.itemId ? previous.status : mapping.status,
				activeSince:
					previous?.itemId === mapping.itemId ? previous.activeSince : null,
				terminalBaseline:
					previous?.itemId === mapping.itemId
						? previous.terminalBaseline
						: null,
				updatedAtBaseline:
					previous?.itemId === mapping.itemId
						? previous.updatedAtBaseline
						: null,
				lastAssertedAt:
					previous?.itemId === mapping.itemId
						? previous.lastAssertedAt
						: null,
			});
		}
		tracked = next;
		cacheContent = content;
	}

	function reconcileTransitions() {
		try {
			refreshMappings();
			if (tracked.size === 0 || fs.existsSync(LOCK_DIRECTORY)) return;
			const states = sessionStates([...tracked.keys()]);
			for (const [workspaceId, mapping] of tracked) {
				const state = states.get(workspaceId);
				let target = mapping.status;
				if (!state?.exists) {
					target = "No session";
					mapping.activeSince = null;
				} else {
					const updatedSinceLastTick =
						mapping.updatedAtBaseline &&
						state.updatedAt !== mapping.updatedAtBaseline;
					const startedAfterTerminal =
						state.terminalAt && state.updatedAt > state.terminalAt;
					mapping.updatedAtBaseline = state.updatedAt;
					if (
						state.isRunning ||
						startedAfterTerminal ||
						(updatedSinceLastTick && !state.terminalAt)
					) {
						if (!mapping.activeSince) {
							mapping.activeSince = new Date().toISOString();
							mapping.terminalBaseline = state.terminalAt;
						}
						target = "In progress";
					} else if (state.interrupted) {
						target = "Idle";
						mapping.activeSince = null;
					} else if (mapping.activeSince) {
						if (
							state.terminalAt &&
							state.terminalAt !== mapping.terminalBaseline
						) {
							target = "Idle";
							mapping.activeSince = null;
						} else {
							target = "In progress";
						}
					}
				}
				const now = Date.now();
				const shouldHeartbeat =
					target === "In progress" &&
					state?.isRunning &&
					(!mapping.lastAssertedAt || now - mapping.lastAssertedAt >= 10000);
				if (mapping.status === target && !shouldHeartbeat) continue;
				try {
					setSelect(
						mapping.itemId,
						FIELDS.sessionStatus,
						OPTIONS.sessionStatus[target],
					);
					mapping.status = target;
					mapping.lastAssertedAt = now;
					console.log(
						JSON.stringify({
							timestamp: new Date().toISOString(),
							workspaceId,
							itemId: mapping.itemId,
							sessionStatus: target,
						}),
					);
				} catch (error) {
					console.error(
						JSON.stringify({
							timestamp: new Date().toISOString(),
							workspaceId,
							itemId: mapping.itemId,
							error: error.message,
						}),
					);
				}
			}
		} catch (error) {
			console.error(JSON.stringify({ error: error.message }));
		}
	}

	reconcileTransitions();
	const interval = setInterval(reconcileTransitions, 1000);
	for (const signal of ["SIGINT", "SIGTERM"]) {
		process.on(signal, () => {
			clearInterval(interval);
			process.exit(0);
		});
	}
}

function main() {
	try {
		fs.mkdirSync(LOCK_DIRECTORY);
	} catch (error) {
		if (error.code === "EEXIST") {
			console.log(JSON.stringify({ skipped: "previous run still active" }));
			return;
		}
		throw error;
	}

	const summary = {
		scanned: 0,
		removed: [],
		changed: [],
		unchanged: 0,
		failed: [],
	};
	try {
		const project = gh([
			"project",
			"item-list",
			PROJECT_NUMBER,
			"--owner",
			PROJECT_OWNER,
			"--format",
			"json",
			"--limit",
			"100",
		]);
		const retainedItems = [];
		const sessionHistory = readSessionHistory();
		for (const item of project.items) {
			if (!["Issue", "PullRequest"].includes(item.content?.type)) continue;
			summary.scanned += 1;
			try {
				const restoredSession = restoreSessionAssociation(item, sessionHistory);
				const result =
					item.content.type === "PullRequest"
						? reconcilePullRequestItem(item)
						: reconcileItem(item);
				if (restoredSession && result.outcome === "unchanged") {
					result.outcome = "changed";
				}
				if (result.outcome === "removed") {
					summary.removed.push(result.url);
				} else {
					retainedItems.push(item);
					if (result.outcome === "changed") summary.changed.push(result);
					else summary.unchanged += 1;
				}
			} catch (error) {
				retainedItems.push(item);
				summary.failed.push({
					url: item.content?.url || item.id,
					error: error.message,
				});
			}
		}
		writeSessionMappings(retainedItems);
		writeSessionHistory(retainedItems, sessionHistory);
		console.log(JSON.stringify(summary));
		if (summary.failed.length > 0) process.exitCode = 1;
	} finally {
		fs.rmSync(LOCK_DIRECTORY, { recursive: true, force: true });
	}
}

if (process.argv.includes("--watch-sessions")) {
	watchSessionStatuses();
} else {
	main();
}
