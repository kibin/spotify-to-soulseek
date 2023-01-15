const EXTENSIONS =
    (process.env.EXTENSIONS || ['']).split(',').map(ext => ext.trim())
const REs = EXTENSIONS.map(ext => new RegExp(`\.${ext}$`, 'i'))

const isHQMP3 = track => /\.mp3$/i.test(track.file) && track.bitrate === 320

const isHighQualityTrack = track => REs.some(re => re.test(track.file)) || isHQMP3(track)

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

const findHighQualityTrack = (results, songName) => {
    if (!results.length) {
        console.log('No results for:'.red, songName);
        return null;
    }
    // sorting by size, as higher quality tracks tend to size more
    const sortedBySize = results.sort((s1, s2) => s2.size - s1.size)

    for (track of sortedBySize) {
        if (isHighQualityTrack(track)) return track;
    }

    console.log('No quality results for:'.red, songName);

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
    findHighQualityTrack,
    TrackCounter,
};
