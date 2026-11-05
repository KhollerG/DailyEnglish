// Guarda la app en el teléfono para que abra sin internet.
// Con internet trae siempre la versión más nueva; sin internet usa la copia guardada.
const CACHE="ruta-ingles-v20";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("ruta-ingles-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const url=new URL(r.url);
  if(url.host.includes("fonts.googleapis.com")||url.host.includes("fonts.gstatic.com")){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit))));return}
  if(url.origin!==location.origin||!url.pathname.startsWith(new URL("./",self.registration.scope).pathname)) return;
  const fresh=new Request(r.url,{cache:"no-cache",credentials:"same-origin"});
  e.respondWith(fetch(fresh).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})
    .catch(()=>caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>hit||c.match("index.html")))));
});
