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
