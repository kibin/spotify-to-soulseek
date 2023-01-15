const findSongName = (fileName) => {
    let backSlashIndex = 0;

    for (let i = fileName.length - 1; i > 0; i--) {
        if (fileName[i] === `\\`[0]) {
            backSlashIndex = i;
            break;
        };
    }

    return fileName.slice(backSlashIndex + 1);
}

const findHighQualityMp3 = (results, songName) => {
    for (song of results) {
        if(song.bitrate === 320) return song;
    }
    console.log("No good bitrate found for: ", songName);
    return results[0];
}

const TrackCounter = (amount) => {
    const map = {
        fail: 0,
        success: 0,
        left: amount,
    }
    const check = type => {
        map.left -= 1;
        map[type] += 1;

        if (map.left <= 0) {
            console.log('\n')
            console.log('\n')
            console.log(`Downloaded: ${map.success}`.green);
            console.log(`Failed: ${map.fail}`.red);
            console.log('\n')
            console.log('All done!'.rainbow);
            process.exit();
        } else {
            console.log(`Tracks left: ${map.left}`.yellow);
        }
    }

    return {
        fail: () => check('fail'),
        success: () => check('success'),
    }
}

module.exports = {
    findSongName,
    findHighQualityMp3,
    TrackCounter,
};
