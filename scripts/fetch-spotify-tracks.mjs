#!/usr/bin/env node
/*
  Fetch Amma's top Spotify tracks and save only their public details
  (song, artists, album art, link) to src/data/tracks.json.

  Runs in GitHub Actions (see .github/workflows/spotify-tracks.yml) with three
  secrets passed in as environment variables. Nothing secret is ever written
  to disk or printed:

    SPOTIFY_CLIENT_ID
    SPOTIFY_CLIENT_SECRET
    SPOTIFY_REFRESH_TOKEN   (created once with scripts/get-spotify-refresh-token.mjs)

  Optional:
    SPOTIFY_TIME_RANGE   short_term | medium_term | long_term   (default long_term)
    SPOTIFY_LIMIT        1-20                                    (default 5)

  If anything fails, the existing tracks.json is left untouched and the
  script exits with an error, so the site never loses its last good list.
*/
import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "tracks.json");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
const TIME_RANGE = ["short_term", "medium_term", "long_term"].includes(process.env.SPOTIFY_TIME_RANGE)
  ? process.env.SPOTIFY_TIME_RANGE
  : "long_term";
const LIMIT = Math.min(20, Math.max(1, Number.parseInt(process.env.SPOTIFY_LIMIT || "5", 10) || 5));

function fail(message) {
  console.error(`Spotify sync failed: ${message}`);
  process.exit(1);
}

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  fail("missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET or SPOTIFY_REFRESH_TOKEN. Add them as repository secrets.");
}

async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
  });
  if (!res.ok) fail(`token request returned ${res.status}. The refresh token may have been revoked; create a new one.`);
  const json = await res.json();
  if (!json.access_token) fail("token response had no access_token.");
  return json.access_token;
}

async function getTopTracks(accessToken) {
  const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${TIME_RANGE}&limit=${LIMIT}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) fail(`top tracks request returned ${res.status}.`);
  const json = await res.json();
  return Array.isArray(json.items) ? json.items : [];
}

// Pick the album image closest to 300px wide: sharp in the player, still small.
function pickImage(images = []) {
  if (!images.length) return null;
  return [...images].sort((a, b) => Math.abs((a.width || 0) - 300) - Math.abs((b.width || 0) - 300))[0].url;
}

const token = await getAccessToken();
const items = await getTopTracks(token);
if (!items.length) fail("Spotify returned no top tracks. Listen a little more, or try a shorter time range.");

const tracks = items.map((t) => ({
  id: t.id,
  name: t.name,
  artists: (t.artists || []).map((a) => a.name),
  album: t.album?.name || "",
  image: pickImage(t.album?.images),
  url: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
  durationMs: t.duration_ms || 0,
}));

const next = { source: "spotify", timeRange: TIME_RANGE, tracks };

// Only rewrite the file (and so only create a commit) when the list changed.
let previous = null;
try { previous = JSON.parse(await readFile(OUT, "utf8")); } catch { /* first run */ }
if (previous && JSON.stringify(previous.tracks) === JSON.stringify(tracks) && previous.timeRange === TIME_RANGE) {
  console.log("Top tracks unchanged.");
  process.exit(0);
}

await writeFile(OUT, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`Saved ${tracks.length} top tracks (${TIME_RANGE}).`);
