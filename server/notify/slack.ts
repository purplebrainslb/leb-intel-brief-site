type SlackBlock = Record<string, unknown>;

const SITE_URL = "https://leb-intel-brief.vercel.app";
const DASHBOARD_URL = "https://vercel.com/purplebrains/leb-intel-brief";

export async function notifySlack(
  fallbackText: string,
  blocks: SlackBlock[]
): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn("[slack] SLACK_WEBHOOK_URL not configured; skipping alert");
    return;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: fallbackText, blocks }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[slack] webhook ${res.status} ${res.statusText} ${body.slice(0, 200)}`
      );
    }
  } catch (err) {
    console.error("[slack] webhook post failed:", err);
  }
}

export function buildFailureBlocks(args: {
  errorMessage: string;
  durationMs: number;
  startedAt: Date;
}): SlackBlock[] {
  const dur = Math.round(args.durationMs / 1000);
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 Lebanon Brief — daily build failed",
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Error:*\n\`${args.errorMessage.replace(/`/g, "ʼ").slice(0, 300)}\``,
        },
        { type: "mrkdwn", text: `*Duration:* ${dur}s` },
        { type: "mrkdwn", text: `*Started:* ${args.startedAt.toISOString()}` },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${SITE_URL}|site> · <${DASHBOARD_URL}|dashboard> · previous brief stays live`,
        },
      ],
    },
  ];
}

export function staleBriefBlocks(args: {
  lastSuccessAt: Date | null;
  ageHours: number | null;
  recentStatus: string | null;
}): SlackBlock[] {
  const headerEmoji = args.ageHours && args.ageHours > 48 ? "🚨" : "⚠️";
  const lastSeen = args.lastSuccessAt
    ? args.lastSuccessAt.toISOString()
    : "never";
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${headerEmoji} Lebanon Brief — daily update is stale`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Last successful build:*\n${lastSeen}`,
        },
        {
          type: "mrkdwn",
          text: `*Hours stale:*\n${args.ageHours != null ? args.ageHours.toFixed(1) : "n/a"}h`,
        },
        {
          type: "mrkdwn",
          text: `*Latest run status:*\n${args.recentStatus ?? "no runs"}`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${SITE_URL}|site> · <${DASHBOARD_URL}/logs|logs> · trigger a manual run from Vercel → Crons → Run Now`,
        },
      ],
    },
  ];
}
