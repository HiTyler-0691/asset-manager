var CACHE_NAME = 'asset-manager-v3';
var CACHED_URLS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CACHED_URLS);
    }).catch(function(err){ console.log('Cache failed:', err); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('alphavantage.co') || e.request.url.includes('supabase.co')){
    e.respondWith(fetch(e.request).catch(function(){ return new Response('', {status: 503}); }));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(response){
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, clone); });
        return response;
      })
      .catch(function(){
        return caches.match(e.request);
      })
  );
});
