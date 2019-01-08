var Discogs = require('disconnect').Client;
var db = new Discogs().database();


// LABEL

//getMultipleLabels([365719,265687]);
getMultipleLabels([265687]);


function getMultipleLabels(id_array){

  id_array.forEach(function(id, index){

    getLabel(id, function (label) {
      console.log();
      console.log();
      console.log("getLabel with id "+id);
      console.log();
      console.log(label);
      //label.releases.forEach(function(release, index) {
        //console.log(release.title);
        //console.log(release.tracklist);
      
      //});
    });

  });

}

function getLabel(labelId, callback) {
  var label = {};

  db.getLabel(labelId, function(err, data){
      //console.log(JSON.stringify(data, null, 2));
      label['id'] = data.id;
      label['name'] = data.name;

      //console.log(pretty(label));
      getLabelReleases(label, callback);
  });
}

function getLabelReleases(label, callback) {
  label['releases'] = [];

  db.getLabelReleases(label.id, function(err, data){
      //console.log(JSON.stringify(data, null, 2));

      data.releases.forEach(function(release, index) {
        //console.log(pretty(release));

        getTracklist(release.id, function (tracklist) {
          label['releases'][index]= {};

          label['releases'][index]['order']=index+1;
          label['releases'][index]['id']=release.id;
          label['releases'][index]['catno']=release.catno;
          label['releases'][index]['year']=release.year;
          label['releases'][index]['title']=release.title;
          label['releases'][index]['tracklist']=tracklist;

          if(callback) callback(label);
        });

         
      });
  });
}


// TRACKLIST

function getTracklist(releaseId, callback) {
  var tracklist = [];

  db.getRelease(releaseId, function(err, data){

      //console.log(JSON.stringify(data, null, 2));
      //console.log('get tracklist for '+releaseId)

      var discogsTracklist = data.tracklist || [];

      discogsTracklist.forEach(function(track, index) {
        //console.log(track.title);
        tracklist[index] = {};
        tracklist[index].order = index+1;
        tracklist[index].position = track.position;
        tracklist[index].title = track.title;

        var artists = [];
        track.artists && track.artists.forEach(function(artist, index) {
          artists[index] = artist.name;
        })
        tracklist[index].artists = artists.join(" & ");

      })

      //console.log(tracklist);
      if(callback) callback(tracklist);
  });

}

// HELPERS
function pretty(obj) {
    // pretty print objects
    console.log(JSON.stringify(obj, null, 2));
}
