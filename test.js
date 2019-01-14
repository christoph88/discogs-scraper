const ok = false;

new Promise(function(resolve, reject) {
  if (ok == true) { resolve("this is true")} else { err("promise is rejected")};
      

});

Promise.all(console.log("promise eval true")).catch(console.log(err)).then(console.log("promise val false"));
