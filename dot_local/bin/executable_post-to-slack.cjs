#!/usr/bin/env -S NODE_VERSION=default /Users/alondahari/.nvm/nvm-exec node
"use strict";

const { spawnSync } = require("node:child_process");

const TEAM = "github";
const DEFAULT_CHANNEL = "C0ASY8L0CQ3";

function die(message) {
  console.error(message);
  process.exit(1);
}

function slackApi(path, body) {
  const result = spawnSync(
    "gh",
    ["slack", "api", "post", path, "-t", TEAM, "-b", JSON.stringify(body)],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    die(result.stderr.trim() || result.stdout.trim() || `gh slack exited ${result.status}`);
  }
  const response = JSON.parse(result.stdout);
  if (!response.ok) die(response.error || `Slack API ${path} failed`);
  return response;
}

function usage() {
  console.log(`Usage:
  post-to-slack.cjs "<mrkdwn>" [channel_id]
  post-to-slack.cjs --dm <user_id> "<mrkdwn>"
  post-to-slack.cjs --dry-run "<mrkdwn>" [channel_id]

Defaults to channel ${DEFAULT_CHANNEL} in the ${TEAM} Slack team.`);
}

function parseArgs(argv) {
  const args = [...argv];
  const dryRunIndex = args.indexOf("--dry-run");
  const dryRun = dryRunIndex !== -1;
  if (dryRun) args.splice(dryRunIndex, 1);

  if (args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }

  let dmUser;
  const dmIndex = args.indexOf("--dm");
  if (dmIndex !== -1) {
    dmUser = args[dmIndex + 1];
    if (!dmUser) die("--dm requires a Slack user ID");
    args.splice(dmIndex, 2);
  }

  const [text, channel = DEFAULT_CHANNEL, ...extra] = args;
  if (!text || extra.length > 0) {
    usage();
    process.exit(1);
  }
  if (dmUser && channel !== DEFAULT_CHANNEL) {
    die("Do not pass a channel ID together with --dm");
  }
  return { channel, dmUser, dryRun, text };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  let channel = options.channel;
  if (options.dmUser) {
    if (!/^U[A-Z0-9]+$/.test(options.dmUser)) {
      die("--dm must be a Slack user ID beginning with U");
    }
    if (!options.dryRun) {
      channel = slackApi("conversations.open", { users: options.dmUser }).channel.id;
    } else {
      channel = `<DM:${options.dmUser}>`;
    }
  } else if (!/^[CDG][A-Z0-9]+$/.test(channel)) {
    die("channel_id must be a Slack channel ID beginning with C, D, or G");
  }

  const body = {
    channel,
    text: options.text,
    unfurl_links: false,
    unfurl_media: false,
  };
  if (options.dryRun) {
    console.log(JSON.stringify({ team: TEAM, method: "chat.postMessage", body }, null, 2));
    return;
  }

  const response = slackApi("chat.postMessage", body);
  console.log(JSON.stringify({ channel: response.channel, ts: response.ts }));
}

main();
