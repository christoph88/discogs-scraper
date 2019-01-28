const Discogs = require('disconnect').Client;
const jsonexport = require('jsonexport');
const fs = require('fs');
const config = require('../config');

const db = new Discogs({ userToken: config.discogs.usertoken }).database();

// count the number of requests
// limit them to one per second
let throttle = 0;

const getLabel = function (labelId) {
  return new Promise((resolve, reject) => {
    throttle++;
    setTimeout(() => {
      db.getLabel(labelId, (err, data) => {
        console.log(`Get label: ${data.name}`);
        if (err) {
          reject(err);
        }
        const label = data;
        resolve(label);
      });
    }, throttle * 1200);
  });
};

const getLabelRelease = function (label) {
  return new Promise((resolve, reject) => {
    throttle++;
    setTimeout(() => {
      console.log(`Get label releases for ${label.name}`);
      db.getLabelReleases(label.id, (err, data) => {
        if (err) {
          reject(err);
        }
        label.releases = data.releases;

        resolve(label);
      });
    }, throttle * 1200);
  });
};

const properFormat = function (release) {
  return release.format.match(config.formatRegEx);
};

const promiseRelease = function (release) {
  return new Promise((resolve, reject) => {
    throttle++;
    // releases of multiple labels have the same index, labels should add theirselves
    setTimeout(() => {
      db.getRelease(release.id, (err, data) => {
        if (err) {
          reject(err);
        }
        release.detail = data;
        console.log(release.title);
        // create a write stream and process text to csv
        resolve(release);
      });
    }, throttle * 1200);
  });
};

const getRelease = function (label) {
  return new Promise((resolve, reject) => {
    console.log(
      `Getting ${
        label.releases.filter(properFormat).length
      } releases for label ${label.name}.`,
    );
    Promise.all(label.releases.filter(properFormat).map(promiseRelease))
      .then((releases) => {
        label.releases = releases;
        resolve(label);
      })
      .catch((err) => {
        reject(`Get release error: ${err}`);
      });
  });
};

function fromRoman(str) {
    var result = 0;
    the result is now a number, not a string
    var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var roman = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    for (var i = 0; i <= decimal.length; i++) {
        while (str.indexOf(roman[i]) === 0) {
            result += decimal[i];
            str = str.replace(roman[i], '');
        }
    }
    return result;
}

function textToNumber(text) {
    if (text.match(/\b\d\d?\b/i)) {
        return Number(text.match(/\b\d\d?\b/i));
    }
    const numbers = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10
    };
    if (text.match(/\b(one|Two|three|four|five|six|seven|eight|nine|ten)\b/i)) {
        return Number(numbers[text.match(/\b(one|Two|three|four|five|six|seven|eight|nine|ten)\b/i)[0].toLowerCase()]);
    }
    if (text.match(/\b[MDCLXVI]+\b/)) {
        return fromRoman(text.match(/\b[MDCLXVI]+\b/)[0]);
    }
    return 1;
}

const pushTracklists = function (labels) {
  console.log('Push tracklist');
  return new Promise((resolve) => {
    const tracks = [];
    labels.forEach((label) => {
      label.releases.forEach((release) => {
        release.detail.tracklist.forEach((track, index) => {
          const exportTrack = {};
          exportTrack.labelName = label.name;
          exportTrack.labelId = label.id;
          exportTrack.releaseCatno = release.catno;
          exportTrack.releaseFormat = release.format;
          exportTrack.releaseYear = release.year;
          exportTrack.releaseDate = release.detail.released;
          exportTrack.releaseTitle = release.title;
          exportTrack.releaseArtist = release.artist;
          exportTrack.releaseId = release.id;
          exportTrack.order = index;
          exportTrack.position = track.position;
          exportTrack.duration = track.duration;
          exportTrack.title = track.title;
          if (track.artists instanceof Array) {
            exportTrack.artists = track.artists
              .map(artist => `${artist.name} ${artist.join}`)
              .join(' ');
          }
          exportTrack.releaseOrder = textToNumber(release.title);
          tracks.push(exportTrack);
        });
      });
    });
    resolve(tracks);
  });
};

const writeFile = function(path, file) {
  fs.writeFile(path, file, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved at ' + path + '!');
  });
};

module.exports = function (labelsToGet) {
  Promise.all(labelsToGet.map(getLabel))
    .then(labels => Promise.all(labels.map(getLabelRelease)))
    .then(labels => Promise.all(labels.map(getRelease)))
    .then((labels) => {
      console.log('Start writing export.json file.');
      writeFile('export.json', JSON.stringify(labels, null, 2));
      pushTracklists(labels)
        .then((tracks) => {
          console.log('Start writing export.csv file.');
          jsonexport(tracks, (err, csv) => {
            if (err) return console.log(err);
            writeFile('export.csv', csv);
          });
        })
        .catch(err => console.log(`Push tracklist error: ${err}`));
    })
    .catch((err) => {
      console.log('Get Label Error:', err);
    });
};
