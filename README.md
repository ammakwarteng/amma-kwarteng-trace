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
3. Music player ✓ (mini player, editable playlist)
4. Portfolio sections and project case studies
5. Responsive design, accessibility and final polish

## Assets to supply

Placeholders on the site are labelled "Photo needed" until the real files arrive.

- Artifact photos (6 to 10): access card, USB drive, Ethernet cable, keyboard, notebook, network diagram print, floppy disk
- Music you have permission to use, plus album art
- Résumé (PDF), LinkedIn link, project screenshots, design work

## Music player

Edit `src/data/playlist.js`. Each song is a title, an artist and either a Spotify
track link or an audio file you have the right to use, saved in `public/audio/`.
Spotify songs play through Spotify's official embed. Don't add files ripped from
YouTube or "to MP3" sites.
