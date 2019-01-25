const fs = require('fs');
const discogs = require('./discogs/index');
const filepath = process.argv[2];

const parseIds = function (text) {
  return text.match(/\d+/g)[0];
};

const removeEmpty = function (item) {
  return item !== null && item !== '';
};

function readContent(callback) {
  fs.readFile(filepath, 'utf8', (err, content) => {
    if (err) return callback(err);
    callback(null, content);
  });
}

// read and progres content
readContent((err, content) => {
  const labelsToGet = content.split('\n').filter(removeEmpty).map(parseIds);
  console.log(labelsToGet);
  // discogs(labelsToGet.filter(removeEmpty));
});
