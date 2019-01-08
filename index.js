var Discogs = require('disconnect').Client;

// TRACKLIST

getMultipleTracklists([147876,164603]);

function getMultipleTracklists(id_array){
  id_array.forEach(function(id, index){
    getTracklist(id, function (release) {
      console.log();
      console.log();
      console.log("getTrackList with id "+id);
      console.log();
      console.log(release);
    });
  });
}

function getTracklist(releaseId, callback) {
  var release = {};

  var db = new Discogs().database();
  db.getRelease(releaseId, function(err, data){
      //console.log(JSON.stringify(data, null, 2));

      release['title'] = data.title;
      release['uri'] = data.uri;
      release['catno'] = data.labels[0].catno;
      release['tracklist'] = [];
      tracklist = data.tracklist;

      tracklist.forEach(function(track, index) {
        release['tracklist'][index] = {};
        release['tracklist'][index].position = track.position;
        release['tracklist'][index].title = track.title;

        var artists = [];
        track.artists.forEach(function(artist, index) {
          artists[index] = artist.name;
        })
        release['tracklist'][index].artists = artists.join(" & ");

      })
      callback(release);
  });
}

// HELPERS
function pretty(obj) {
    // pretty print objects
    console.log(JSON.stringify(obj, null, 2));
}
