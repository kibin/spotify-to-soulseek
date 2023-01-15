require('colors');

const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const dotenv = require('dotenv').config();
const {downloadSong, setupSlsk} = require('./downloadSong');
const { TrackCounter } = require('./util')

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SLSK_USER = process.env.SLSK_USER;
const SLSK_PASS = process.env.SLSK_PASS;
const REDIRECT_URI = 'http://localhost:3000/auth';

let playlistId = process.argv.slice(2)[0];

try {
    const url = new URL(playlistId)

    playlistId = url.pathname.split('/').pop()
} catch(e) {
  // it’s actual id, we can work with it
}

const app = express();

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

const downloadSongs = async (songs, playlistName, counter) => {
    try {
        await Promise.all(songs.map(downloadSong(playlistName, counter)));
    } catch (error) {
        console.log('download failed: '.red, error);
    }
}

const getPlaylistSongs = async () => {
    const [playlist, tracks] = await Promise.all([
        spotifyApi.getPlaylist(playlistId),
        spotifyApi.getPlaylistTracks(playlistId),
    ])
    const name = playlist.body.name;
    const amount = tracks.body.total;
    // console.log('playlist', playlist.body, '\ntracks', tracks.body)
    const counter = TrackCounter(amount);
    const songs = tracks.body.items
        .map(({track}) => `${track.artists[0].name} ${track.name}`)

    console.log('\n')
    console.log(`Playlist ${name} found.`.blue)
    console.log(`We will try and download ${amount} song${amount === 1 ? '' : 's'}:`.blue);
    console.log(songs.map((name, id) => `${id + 1}. ${name}`).join('\n').white);
    console.log('\n')

    downloadSongs(songs, name, counter);
}

const setAccessToken = async (code) => {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
    console.log("Authenticated!");
    getPlaylistSongs();
  } catch (err) {
    console.log("authorization failed: ", err);
  }
}

app.get("/auth", (req, res, next) => {
  setAccessToken(req.query.code);
  res.send("You have been authenticated and can close this tab!");
})

app.listen(3000, async () => {
  console.log("listening on port 3000");
  const authorizeURL = spotifyApi.createAuthorizeURL([], "state");
  await setupSlsk(SLSK_USER, SLSK_PASS);
  console.log("Please click this link: ", authorizeURL);
})
