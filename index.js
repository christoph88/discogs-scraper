const Discogs = require('disconnect').Client;
const jsonexport = require('jsonexport');
const fs = require('fs');

const db = new Discogs().database();

// const labelsToGet = [365719, 265687];
// const labelsToGet = [365719];
const labelsToGet = [];

// process command line arguments
process.argv.forEach((val, index, array) => {
  console.log(`${index}: ${val}`);
  if (index > 1) {
    if (Array.isArray(val)) {
      labelsToGet.concat(val);
    } else {
      labelsToGet.push(val);
    }
  }
});

const getLabel = function (labelId) {
  return new Promise((resolve, reject) => {
    db.getLabel(labelId, (err, data) => {
      const label = {};
      if (err) {
        reject(err);
      } else {
        label.id = data.id;
        label.name = data.name;
        resolve(label);
      }
    });
  });
};

const getLabelRelease = function (label) {
  return new Promise((resolve, reject) => {
    label.releases = [];
    db.getLabelReleases(label.id, (err, data) => {
      const release = {};
      if (err) {
        reject(err);
      } else {
        data.releases.forEach((data2) => {
          release.id = data2.id;
          release.catno = data2.catno;
          release.format = data2.format;
          release.year = data2.year;
          release.title = data2.title;
          release.artist = data2.artist;
          label.releases.push(release);
        });
      }
      resolve(label);
    });
  });
};

const getTracklist = function (release) {
  return new Promise((resolve, reject) => {
    db.getRelease(release.id, (err, data) => {
      if (err) {
        reject(err);
      }
      release.tracklist = data.tracklist;
      resolve(release);
    });
  });
};
const getRelease = function (label) {
  return new Promise((resolve, reject) => {
    const promiseTracklist = Promise.all(label.releases.map(getTracklist))
      .then((promiseTracklist) => {
        // modify tracklist to add label and release info
        promiseTracklist.forEach((release) => {
          release.tracklist.forEach((track) => {
            track.labelname = label.name;
            track.releasetitle = release.title;
            track.releaseid = release.id;
            track.releasecatno = release.catno;
            track.releaseformat = release.format;
            track.releaseyear = release.year;
            track.releasetitle = release.title;
            track.releaseartist = release.artist;
          });
        });
        label.releases = promiseTracklist;
        return label;
      })
      .then(label => resolve(label))
      .catch(err => reject(err));
  });
};

// needed flat format for json export
const mergeTracklists = function (labels) {
  const mergedTracklist = [];
  labels.forEach((label) => {
    label.releases.forEach((release) => {
      release.tracklist.forEach((track) => {
        mergedTracklist.push(track);
      });
    });
  });
  return mergedTracklist;
};

Promise.all(labelsToGet.map(getLabel))
  .then(labels => Promise.all(labels.map(getLabelRelease)))
  .then(labels => Promise.all(labels.map(getRelease)))
  .then((labels) => {
    jsonexport(mergeTracklists(labels), (err, csv) => {
      if (err) return console.log(err);
      fs.writeFile('export.csv', csv, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log('The file was saved!');
      });
    });
  })
  .catch((err) => {
    console.log('Failed:', err);
  });
