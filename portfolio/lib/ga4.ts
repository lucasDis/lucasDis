import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache } from "next/cache";

/**
 * GA4 Data API client. Credentials are read lazily (inside the function,
 * not at module top-level) so builds don't crash when the env vars aren't
 * set yet — same pattern as `lib/db.ts`.
 */
function getClient(): BetaAnalyticsDataClient {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "GA_CLIENT_EMAIL / GA_PRIVATE_KEY are not set. Add them to .env.local."
    );
  }

  return new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
}

export type GaOverview = {
  activeUsers: number;
  pageViews: number;
  sessions: number;
  avgSessionDurationSeconds: number;
  topPages: { path: string; views: number }[];
};

async function fetchGaOverview(propertyId: string): Promise<GaOverview> {
  const client = getClient();
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];

  const [summary] = await client.runReport({
    property,
    dateRanges,
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "averageSessionDuration" },
    ],
  });

  const [topPages] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  });

  const values = summary.rows?.[0]?.metricValues ?? [];

  return {
    activeUsers: Number(values[0]?.value ?? 0),
    pageViews: Number(values[1]?.value ?? 0),
    sessions: Number(values[2]?.value ?? 0),
    avgSessionDurationSeconds: Number(values[3]?.value ?? 0),
    topPages: (topPages.rows ?? []).map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "",
      views: Number(r.metricValues?.[0]?.value ?? 0),
    })),
  };
}

const getCachedGaOverview = unstable_cache(
  (propertyId: string) => fetchGaOverview(propertyId),
  ["ga4-overview"],
  { revalidate: 900 } // 15 min — stays well under the Data API's daily quota
);

/**
 * Returns `null` when GA isn't configured yet or the API call fails,
 * so the dashboard can render a "not connected" state instead of crashing.
 */
export async function getGaOverview(): Promise<GaOverview | null> {
  const propertyId = process.env.GA_PROPERTY_ID;
  if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
    return null;
  }

  try {
    return await getCachedGaOverview(propertyId);
  } catch (error) {
    console.error("[ga4] Failed to fetch overview:", error);
    return null;
  }
}
