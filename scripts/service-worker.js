const prefixo = "anti-anxiety-expo-";
const versao = prefixo + "__VERSAO_DO_CACHE__";
const arquivos = new Set(__ARQUIVOS_OFFLINE__);

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(versao).then((cache) => cache.addAll([...arquivos])));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(caches.keys().then((ids) => Promise.all(
    ids.filter((id) => id.startsWith(prefixo) && id !== versao).map((id) => caches.delete(id))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  const url = new URL(requisicao.url);
  if (requisicao.method !== "GET" || url.origin !== self.location.origin) return;

  if (requisicao.mode === "navigate") {
    evento.respondWith(fetch(requisicao).catch(() => caches.open(versao).then((cache) => cache.match("/offline.html"))));
    return;
  }

  if (url.search || !arquivos.has(url.pathname)) return;
  evento.respondWith(caches.open(versao).then(async (cache) => {
    const salvo = await cache.match(url.pathname);
    if (!salvo) return fetch(requisicao);

    const range = requisicao.headers.get("range");
    if (!range) return salvo;
    const partida = /^bytes=(\d+)-(\d*)$/.exec(range);
    const bytes = await salvo.arrayBuffer();
    const total = bytes.byteLength;
    const inicio = partida ? Number(partida[1]) : total;
    const fim = partida?.[2] ? Math.min(Number(partida[2]), total - 1) : total - 1;
    if (inicio >= total || fim < inicio) {
      return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total } });
    }
    return new Response(bytes.slice(inicio, fim + 1), { status: 206, headers: {
      "Content-Type": salvo.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": "bytes " + inicio + "-" + fim + "/" + total,
      "Content-Length": String(fim - inicio + 1),
      "Accept-Ranges": "bytes",
    } });
  }));
});

