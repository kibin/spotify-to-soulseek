const path = require('path');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const slsk = require('slsk-client');
const {
    findSongName,
    findHighQualityTrack,
} = require('./util');
const connect = promisify(slsk.connect);

const defaultDownloadPath = path.resolve(__dirname, 'downloads');
const DOWNLOAD_TO = process.env.DOWNLOAD_TO || defaultDownloadPath;

let client;
let search;
let download;

let folderExists = false
const getDownloadPath = async (name, folderName) => {
    let folderPath = DOWNLOAD_TO[0] === '~'
        ? path.join(os.homedir(), ...DOWNLOAD_TO.split(path.sep).slice(1))
        : path.resolve(DOWNLOAD_TO)

    folderPath = path.join(folderPath, path.normalize(folderName))

    if (folderExists) {
        return path.join(folderPath, name)
    }

    try {
        fs.readDirSync(folderPath)
        folderExists = true
    } catch(readErr) {
        try {
            fs.mkdirSync(folderPath, { recursive: true })
            folderExists = true
        } catch(writeErr) {
            folderExists = false

            try {
                console.log('Can’t create specified folder!'.red)
                console.log(`Using default path: ${defaultDownloadPath}`.yellow)

                fs.readdirSync(defaultDownloadPath)
                return path.join(defaultDownloadPath, name)
            } catch(readDefErr) {
                try {
                    fs.mkdirSync(defaultDownloadPath, { recursive: true })
                } catch(writeDefErr) {
                    console.log('ERROR: can’t write to disk'.red)

                    throw writeDefErr
                }
            }
        }
    }

    return path.join(folderPath, name)
}

const setupSlsk = async (username, password) => {
    console.log("setting up Soulseek...");
    try {
        client = await connect({
            user: username,
            pass: password
        });
        search = promisify(client.search);
        download = promisify(client.download);
    } catch (err) {
        console.error(err);
    }
    console.log("Soulseek Setup done.")
    return Promise.resolve();
}

const downloadSong = (folderName, trackCounter) => async (songName) => {
    try {
        console.log("searching for ", songName);
        const searchResults = await search.call(client, ({ req: songName, timeout: 5000 }));
        console.log("search done!");
        const songToDownload = findHighQualityTrack(searchResults, songName);
        if(songToDownload) {
            console.log("downloading: ", songName);
            const fileName = songToDownload.file;
            const downloadPath = await getDownloadPath(findSongName(fileName), folderName)
            const params = {
                file: songToDownload,
                path: downloadPath,
            }

            await download(params);

            console.log(`${songName} downloaded to: ${params.path}`.green);
            trackCounter.success();
        } else {
            trackCounter.fail();
        }
        return Promise.resolve();
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

module.exports = {downloadSong, setupSlsk};
