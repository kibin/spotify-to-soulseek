# Spotify to Soulseek

A Nodejs script that will allow you to automatically download entire spotify playlists through soulseek. Boycotting spotify were never easier (but support the artists please).

## Setup

Go to https://developer.spotify.com/dashboard/login and make a new Spotify App. 

In your App settings, add the following redirect url: `http://localhost:3000/auth`

Create a new .env file like this:
```
# required
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
SLSK_USER=your_soulseek_username
SLSK_PASS=your_soulseek_password

# optional
DOWNLOAD_TO=path_to_folder_to_download_to
# mp3 320kbps by default
EXTENSIONS="list,of,file,extensions,comma-separated"
PORT=your_server_port
```

Usage:
```
npm install

node index.js spotify_playlist_url
```

Both links and playlist ids work.

## Roadmap

[ ] bogus file creation in script root folder bug.
[ ] handling errors from spotify and soulseek clients.
[ ] huge (3k+ songs) playlists support. for now they kill soulseek servers.
[ ] DX
[ ] progress bars, it’s such a mess rn.
[ ] all the playlists downloading feature, maybe?
[ ] g. u. i. with links for where to buy digital version of every track maybe?

## Disclaimer

The authors of this project are in no way responsible for any copyright infringements caused by using this code or software using this project. There are many legitimate use-cases for this code outside of piracy. This project was written with the intention to be used for such legal purposes.
