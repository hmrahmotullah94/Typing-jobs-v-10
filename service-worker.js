/* =====================================
   Typing Jobs Pro v10.0
   SERVICE WORKER
   Made by Rahmotullah
===================================== */


const CACHE_NAME = "typing-jobs-pro-v10";



const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./offline.html",

    "./icon-192.png",

    "./icon-512.png"

];





// ===============================
// INSTALL
// ===============================

self.addEventListener(
"install",
event=>{


event.waitUntil(

caches.open(CACHE_NAME)

.then(
cache=>{


return cache.addAll(
FILES_TO_CACHE
);


})

);


self.skipWaiting();


});








// ===============================
// ACTIVATE
// ===============================


self.addEventListener(
"activate",
event=>{


event.waitUntil(

caches.keys()

.then(
keys=>{


return Promise.all(

keys.map(

key=>{


if(
key !== CACHE_NAME
){


return caches.delete(key);


}


})


);


})

);



self.clients.claim();


});








// ===============================
// FETCH
// ===============================


self.addEventListener(
"fetch",
event=>{


event.respondWith(


caches.match(
event.request
)

.then(
response=>{


if(response){

return response;

}



return fetch(
event.request
)

.catch(()=>{


return caches.match(
"./offline.html"
);


});


})


);



});








// ===============================
// UPDATE MESSAGE
// ===============================


self.addEventListener(
"message",
event=>{


if(
event.data === "SKIP_WAITING"
){


self.skipWaiting();


}


});
