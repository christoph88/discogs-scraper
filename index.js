var Discogs = require('disconnect').Client;

var db = new Discogs().database();
db.getRelease(24017, function(err, data){
    console.log(data);
});
