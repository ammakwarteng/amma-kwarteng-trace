#!/usr/bin/env node
/*
  ONE-TIME helper: run this on your own computer to connect your Spotify
  account and get a refresh token for GitHub Actions.

    SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-refresh-token.mjs

  1. It prints a Spotify sign-in link. Open it and approve access.
  2. Spotify sends you back to http://127.0.0.1:8888/callback on your machine.
  3. The script prints your refresh token ONCE in the terminal.

  Copy the token straight into GitHub (Settings → Secrets and variables →
  Actions → New repository secret → SPOTIFY_REFRESH_TOKEN). Do not paste it
  into code, chat, notes or screenshots, and close the terminal afterwards.

  Only the "user-top-read" permission is requested: the token can read your
  top artists and tracks and nothing else.
*/
import http from "node:http";
import crypto from "node:crypto";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPE = "user-top-read";

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first (see the comment at the top of this file).");
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex"); // protects the sign-in round trip
const authorizeUrl = "https://accounts.spotify.com/authorize?" + new URLSearchParams({
  response_type: "code",
  client_id: SPOTIFY_CLIENT_ID,
  scope: SCOPE,
  redirect_uri: REDIRECT_URI,
  state,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") { res.writeHead(404).end(); return; }

  const done = (status, message) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    server.close();
  };

  if (url.searchParams.get("state") !== state) return done(400, "State mismatch. Run the script again.");
  if (url.searchParams.get("error")) return done(400, `Spotify said: ${url.searchParams.get("error")}`);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: REDIRECT_URI }),
  });
  const json = await tokenRes.json();
  if (!json.refresh_token) {
    done(500, "No refresh token returned. Check the redirect URI in your Spotify app settings.");
    console.error("Token exchange failed:", json.error_description || json.error || tokenRes.status);
    return;
  }

  done(200, "Connected. You can close this tab and go back to the terminal.");
  console.log("\nYour refresh token (add it to GitHub as SPOTIFY_REFRESH_TOKEN, then close this terminal):\n");
  console.log(json.refresh_token + "\n");
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this link, sign in to Spotify and approve access:\n");
  console.log(authorizeUrl + "\n");
});
