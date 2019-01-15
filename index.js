var Discogs = require('disconnect').Client;
var jsonexport = require('jsonexport');
const fs = require('fs');



var db = new Discogs().database();

//var labels =[365719,265687];
var exportArray = [];

// PROMISE TEST

let labelReleases = [];
var labelIds = ['http://www.api.com/items/1234',
    'http://www.api.com/items/4567',
    'xfail'
];


let getLabels = function(message) {
    return new Promise((resolve, reject) => {
      console.log("do a promise" + message)
        if (message !== "fail") {
            resolve("this is resolved: " + message);
        } else {
            reject("this is rejected: " + message);
        }
    })
}

let getLabelRelease = function(label) {
    return new Promise((resolve, reject) => {
      console.log("getting label releases")
        if (true) {
            resolve("resolved labelrelease " + label);
        } else {
            reject("rejected labelrelease" + label);
        }
    })
}

let PromiseLabelReleases = function(result) {
    return Promise.all(result)
          .then((result) => console.log(result))
          .catch((err) => console.log(err))

}
    
let labelPromises = labelIds.map(getLabels);

let promiseLabels = Promise.all(labelPromises)
.then((results) => {
  let newArray = [];
  console.log(results);
  newArray.push(results);

  return newArray.map(getLabelRelease);
})
.then((results) => {
  PromiseLabelReleases(results);
})
.catch(function(err) {
    // Will catch failure of first failed promise
    console.log("Failed:", err);
});




















// oldcode
// LABEL

//function getMultipleLabels(id_array, callback){
  //Promise.all(id_array.map(function(id, index){
    //getLabel(id, function (label) {
      //label.releases.forEach(function(release,index) {
        //release.tracklist.forEach(function(track, index) {
        //exportArray[index] = {};
        //exportArray[index]['labelid'] = label.id;
        //exportArray[index]['label.name'] = label.name;
        //exportArray[index]['order'] = release.order;
        //exportArray[index]['release.id'] = release.id;
        //exportArray[index]['release.catno'] = release.catno;
        //exportArray[index]['release.year'] = release.year;
        //exportArray[index]['release.title'] = release.title;
        //exportArray[index]['track.order'] = track.order;
        //exportArray[index]['track.position'] = track.position;
        //exportArray[index]['track.title'] = track.title;
        //exportArray[index]['track.artists'] = track.artists;
        //});
      //});
    //});
  //})
  //).then(() => {
    //if (callback) callback()
  
  //});

//}

//function getLabel(labelId, callback) {
  //var label = {};

  //db.getLabel(labelId, function(err, data){
      ////console.log(JSON.stringify(data, null, 2));
      //label['id'] = data.id;
      //label['name'] = data.name;

      ////console.log(pretty(label));
      //getLabelReleases(label, callback);
  //});
//}

//function getLabelReleases(label, callback) {
  //label['releases'] = [];

  //db.getLabelReleases(label.id, function(err, data){
      ////console.log(JSON.stringify(data, null, 2));

      //data.releases.forEach(function(release, index) {
        ////console.log(pretty(release));

        //getTracklist(release.id, function (tracklist) {
          //label['releases'][index]= {};

          //label['releases'][index]['order']=index+1;
          //label['releases'][index]['id']=release.id;
          //label['releases'][index]['catno']=release.catno;
          //label['releases'][index]['year']=release.year;
          //label['releases'][index]['title']=release.title;
          //label['releases'][index]['tracklist']=tracklist;

          //if(callback) callback(label);
        //});

         
      //});
  //});
//}


//// TRACKLIST

//function getTracklist(releaseId) {
    //var tracklist = [];
    //var db = new Discogs().database();
    //return new Promise((resolve, reject) => {
        //db.getRelease(releaseId, function(err, data) {
            //if (err) {
                //return reject(err);
            //}
            ////console.log(JSON.stringify(data, null, 2));
            ////console.log('get tracklist for ' + releaseId)
            //discogsTracklist = data.tracklist;
            //discogsTracklist.forEach(function(track, index) {
                ////console.log(track.title);
                //tracklist[index] = {};
                //tracklist[index].order = index + 1;
                //tracklist[index].position = track.position;
                //tracklist[index].title = track.title;
                //var artists = [];
                //track.artists && track.artists.forEach(function(artist, index) {
                    //artists[index] = artist.name;
                //})
                //tracklist[index].artists = artists.join(" & ");
            //})
            ////console.log(tracklist);
            //resolve(tracklist);
        //});
    //});

//}

//// HELPERS
//function pretty(obj) {
    //// pretty print objects
    //console.log(JSON.stringify(obj, null, 2));
//}
