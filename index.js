const discogs = require('./discogs/index');

// get labels by inputting ids
const urls = `https://www.discogs.com/label/265687-Lords-Of-Hardcore
  https://www.discogs.com/label/365719-Hardcore-To-The-Bone`;

const urlIdsArr = urls.split('\n').map(url => url.match(/\d+/g)[0]);
const labelsToGet = [16705, 265687, 345291];
 //const labelsToGet = [265687];
// const labelsToGet = [16705];

// always push labelids to promise
discogs(labelsToGet);
