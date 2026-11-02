/*
  ============================================================
  TRACE PLAYLIST — edit this list to change the music player
  ============================================================

  Each song needs a title and an artist, plus ONE of these:

  1. A Spotify link (copy it from Spotify: Share, then Copy Song Link)
       { title: "Song name", artist: "Artist", spotify: "https://open.spotify.com/track/..." }
     Plays through Spotify's official player, which appears under the
     mini player while the song is on.

  2. An audio file you have the right to use (royalty-free or your own),
     saved in the public/audio folder:
       { title: "Song name", artist: "Artist", src: "audio/my-song.mp3" }

  Optional: cover: "covers/my-cover.jpg" (saved in public/covers).

  Please don't add files downloaded from YouTube or other "to MP3" sites:
  that is the piracy part. Spotify links and royalty-free files are fine.

  The two placeholder tones below were generated for TRACE. Replace them
  with your own songs whenever you like.
*/

export const playlist = [
  { title: "signal drift", artist: "trace · placeholder tone", src: "audio/placeholder-signal-drift.mp3" },
  { title: "low carrier", artist: "trace · placeholder tone", src: "audio/placeholder-low-carrier.mp3" },
];
