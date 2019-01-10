var Discogs = require('disconnect').Client;
var jsonexport = require('jsonexport');
const fs = require('fs');



var db = new Discogs().database();

var labels =[365719,265687];

var exportArray = []

// LABEL

getMultipleLabels(labels,function(row, index){
  //console.log("print row");
  //console.log(row);
  exportArray[index] = row;
  console.log();
  console.log("print array length");
  console.log();
  console.log(exportArray.length);

  //// start export
  //jsonexport(exportArray, function(err, csv) {
      //if (err) return console.log(err);
      ////console.log(csv);
      //fs.writeFile('export.csv', csv, (err) => {
          //// throws an error, you could also catch it here
          //if (err) throw err;

          //// success case, the file was saved
          //console.log('Export saved!');
      //});
  //});
  //// end export
});


function getMultipleLabels(id_array, callback){

  id_array.forEach(function(id, index){
    getLabel(id, function (label) {
      label.releases.forEach(function(release,index) {
        release.tracklist.forEach(function(track, index) {
        row = {};
        row['labelid'] = label.id;
        row['label.name'] = label.name;
        row['order'] = release.order;
        row['release.id'] = release.id;
        row['release.catno'] = release.catno;
        row['release.year'] = release.year;
        row['release.title'] = release.title;
        row['track.order'] = track.order;
        row['track.position'] = track.position;
        row['track.title'] = track.title;
        row['track.artists'] = track.artists;
        if(callback) callback(row, index)
        });
      });
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
