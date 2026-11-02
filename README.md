# amma-kwarteng-trace
A personal cybersecurity and technology portfolio showcasing technical projects, cybersecurity exploration, IT skills, certifications, and digital design through an interactive editorial website experience. 

## Run it locally

```bash
npm install
npm run dev      # local preview at http://localhost:5173
npm run build    # production build in dist/
```

## Build stages

1. Hero and navigation ✓
2. Photographic artifacts and cursor interaction (hunt ✓, photos pending)
3. Music player ← current
4. Portfolio sections and project case studies
5. Responsive design, accessibility and final polish

## Assets to supply

Placeholders on the site are labelled "Photo needed" until the real files arrive.

- Artifact photos (6 to 10): access card, USB drive, Ethernet cable, keyboard, notebook, network diagram print, floppy disk
- Music you have permission to use, plus album art
- Résumé (PDF), LinkedIn link, project screenshots, design work

## Spotify top tracks (music player)

The player shows Amma's real Spotify top tracks. Credentials never reach the browser:
a daily GitHub Action (`.github/workflows/spotify-tracks.yml`) uses repository secrets to
fetch the list and commits only public details (song, artists, album art, link) to
`src/data/tracks.json`. Playback uses Spotify's official embed, loaded only after a
visitor presses play.

One-time setup:

1. Create an app at https://developer.spotify.com/dashboard. Add the redirect URI
   `http://127.0.0.1:8888/callback` and tick "Web API".
2. On your own computer, in this repository:
   `SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/get-spotify-refresh-token.mjs`
   and approve access in the browser. The terminal prints a refresh token once.
3. In GitHub: Settings → Secrets and variables → Actions → New repository secret. Add
   `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN`.
4. Actions → "Sync Spotify top tracks" → Run workflow. (Scheduled runs start once the
   workflow is on `main`.)

Never paste these values into code, issues, chat or screenshots.
