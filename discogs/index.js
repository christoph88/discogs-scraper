const Discogs = require('disconnect').Client;
const jsonexport = require('jsonexport');
const fs = require('fs');
const config = require('../config');

const db = new Discogs({ userToken: config.discogs.usertoken }).database();

const getLabel = function (labelId) {
  return new Promise((resolve, reject) => {
    db.getLabel(labelId, (err, data) => {
      if (err) {
        reject(err);
      }
      const label = data;
      resolve(label);
    });
  });
};

const getLabelRelease = function (label) {
  return new Promise((resolve, reject) => {
    db.getLabelReleases(label.id, (err, data) => {
      if (err) {
        reject(err);
      }
      label.releases = data.releases;

      resolve(label);
    });
  });
};

const promiseRelease = function (release) {
  return new Promise((resolve, reject) => {
    db.getRelease(release.id, (err, data, rateLimit) => {
      if (err) {
        reject(err);
      }
      release.detail = data;
      console.log(rateLimit.remaining + 'remaining')
      setTimeout(() => { resolve(release); }, 2000);
    });
  });
};

const properFormat = function (release) {
  return release.format.match(config.formatRegEx);
};

const getRelease = function (label) {
  return new Promise((resolve, reject) => {
    console.log(`Getting label ${label.name} with ${label.releases.length} releases.`);
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

module.exports = function (labelsToGet) {
  Promise.all(labelsToGet.map(getLabel))
    .then(labels => Promise.all(labels.map(getLabelRelease)))
    .then(labels => Promise.all(labels.map(getRelease)))
    .then((labels) => {
      pushTracklists(labels)
        .then((tracks) => {
          console.log('Start writing export.csv file.');
          jsonexport(tracks, (err, csv) => {
            if (err) return console.log(err);
            fs.writeFile('export.csv', csv, (err) => {
              if (err) {
                return console.log(err);
              }
              console.log('The file was saved!');
            });
          });
        })
        .catch(err => console.log(`Push tracklist  error: ${err}`));
    })
    .catch((err) => {
      console.log('Get Label Error:', err);
    });
};
