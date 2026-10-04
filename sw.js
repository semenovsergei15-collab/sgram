/* S!GRAM Service Worker — офлайн-режим */
var CACHE_NAME = 'sgram-v1';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

/* Установка — кэшируем файлы */
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE).catch(function(err){
        console.log('Не удалось закэшировать:', err);
      });
    })
  );
  self.skipWaiting();
});

/* Активация — чистим старые кэши */
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
          .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

/* Перехват запросов — сначала кэш, потом сеть */
self.addEventListener('fetch', function(event){
  /* Пропускаем не-GET и внешние запросы */
  if(event.request.method !== 'GET') return;
  if(!event.request.url.startsWith(self.location.origin) &&
     !event.request.url.includes('cdnjs.cloudflare.com')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;

      return fetch(event.request).then(function(response){
        /* Не кэшируем неудачные ответы */
        if(!response || response.status !== 200) return response;

        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function(){
        /* Если офлайн и нет в кэше — отдаём index.html */
        if(event.request.mode === 'navigate'){
          return caches.match('./index.html');
        }
      });
    })
  );
});