var Discogs = require('disconnect').Client;

var db = new Discogs().database();

var releases = [];

function pretty(obj) {
    // pretty print objects
    console.log(JSON.stringify(obj, null, 2));
}

function getTracklist(releaseId) {
  var release = {};

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


  });

  return release;
}

var test = getTracklist(186895);
pretty(test);
