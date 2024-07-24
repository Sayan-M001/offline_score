// var version = "0.0.3";
// var cacheName = `sb-gf-offline-${version}`;
// self.addEventListener("install", (e) => {
//   var timeStamp = Date.now();
//   e.waitUntil(
//     caches.open(cacheName).then((cache) => {
//       return cache
//         .addAll([
//           `/offline-gravity-form/`,
//           `/offline-gravity-form/index.html?timestamp=${timeStamp}`,
//           `/offline-gravity-form/styles/main.css?timestamp=${timeStamp}`,
//           `/offline-gravity-form/styles/offline-chrome.css?timestamp=${timeStamp}`,
//           `/offline-gravity-form/scripts/offline.min.js?timestamp=${timeStamp}`,
//           `/offline-gravity-form/scripts/main.js?timestamp=${timeStamp}`,
//         ])
//         .then(() => self.skipWaiting());
//     }),
//   );
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(self.clients.claim());
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches
//       .open(cacheName)
//       .then((cache) => cache.match(event.request, { ignoreSearch: true }))
//       .then((response) => {
//         return response || fetch(event.request);
//       }),
//   );
// });

// var version = "0.0.3";
// var cacheName = `sb-gf-offline-${version}`;

// self.addEventListener("install", (e) => {
//   e.waitUntil(
//     caches.open(cacheName).then((cache) => {
//       console.log("Caching assets:", urlsToCache);
//       return Promise.all(
//         urlsToCache.map((url) => {
//           return cache.add(url).catch((error) => {
//             console.error(`Failed to cache ${url}:`, error);
//           });
//         }),
//       ).then(() => self.skipWaiting());
//     }),
//   );
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cache) => {
//           if (cache !== cacheName) {
//             console.log("Deleting old cache:", cache);
//             return caches.delete(cache);
//           }
//         }),
//       )
//         .then(() => {
//           console.log("Activation completed");
//           return self.clients.claim();
//         })
//         .catch((error) => {
//           console.error("Activation failed:", error);
//         });
//     }),
//   );
// });

// self.addEventListener("fetch", (event) => {
//   console.log("Fetching:", event.request.url);
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then((response) => {
//         if (response) {
//           console.log("Serving from cache:", event.request.url);
//           return response;
//         }
//         return fetch(event.request).catch(() => {
//           console.log(
//             "Network request failed, serving fallback:",
//             event.request.url,
//           );
//           return caches.match("/offline-gravity-form/");
//         });
//       })
//       .catch((error) => {
//         console.error("Fetch failed:", error);
//       }),
//   );
// });

const cacheName = "my-app-cache-v2";
var urlsToCache = [
  "/",
  "/styles/main.css",
  "/styles/offline-chrome.css",
  "/scripts/offline.min.js",
  "/scripts/main.js",
  // Add any other essential static assets here
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());
      })
      .catch((error) => {
        console.error("Failed to cache", error);
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        }),
      ).then(() => self.clients.claim());
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.protocol === "chrome-extension:") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Serve from cache
      }
      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Handle errors or return a fallback page
        });
    }),
  );
});
