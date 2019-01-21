const Discogs = require('disconnect').Client;
const jsonexport = require('jsonexport');
const fs = require('fs');

const db = new Discogs().database();

// get labels by inputting ids
const urls = `https://www.discogs.com/label/265687-Lords-Of-Hardcore
  https://www.discogs.com/label/365719-Hardcore-To-The-Bone`;

const urlIdsArr = urls.split('\n').map(url => url.match(/\d+/g)[0]);
// const labelsToGet = [16705, 265687]; // .concat(urlIdsArr);
const labelsToGet = [265687]; // .concat(urlIdsArr);
// const labelsToGet = [16705]; // .concat(urlIdsArr);

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
    db.getRelease(release.id, (err, data) => {
      if (err) {
        reject(err);
      }
      release.detail = data;
      resolve(release);
    });
  });
};

const getRelease = function (label) {
  return new Promise((resolve, reject) => {
    Promise.all(label.releases.map(promiseRelease)).then((releases) => {
      label.releases = releases;
      resolve(label);
    });
  });
};

const pushTracklists = function (labels) {
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

// TODO some releases do not have a tracklist
// use conditional promises to exlude these release
// TODO add order number to release
// TODO add playlist limit to releases, by amount of releases?
Promise.all(labelsToGet.map(getLabel))
  .then(labels => Promise.all(labels.map(getLabelRelease)))
  .then(labels => Promise.all(labels.map(getRelease)))
  .then((labels) => {
    pushTracklists(labels).then((tracks) => {
      jsonexport(tracks, (err, csv) => {
        if (err) return console.log(err);
        fs.writeFile('export.csv', csv, (err) => {
          if (err) {
            return console.log(err);
          }
          console.log('The file was saved!');
        });
      });
    });
  })
  .catch((err) => {
    console.log('Failed:', err);
  });
