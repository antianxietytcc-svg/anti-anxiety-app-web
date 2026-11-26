const { createHash } = require("node:crypto");
const { readFileSync, readdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const dist = path.resolve(__dirname, "../dist");
function listar(dir) {
  return readdirSync(path.join(dist, dir), { withFileTypes: true }).flatMap((item) => {
    const nome = path.posix.join(dir, item.name);
    return item.isDirectory() ? listar(nome) : [nome];
  });
}
const arquivos = ["index.html", "favicon.ico", ...listar("_expo/static"), ...listar("assets")].sort();
const som = arquivos.find((nome) => /\/sounds\/Default\.[^/]+\.mp3$/i.test(nome));
if (!som) throw new Error("Som padrão ausente na exportação Expo.");
const pagina = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Anti-Anxiety offline</title><style>body{font:1rem/1.55 system-ui;margin:0;background:#f0f9ff;color:#0c4a6e}main{max-width:32rem;margin:auto;padding:2rem 1.25rem}audio{width:100%}a{display:inline-block;margin-top:1rem}</style><main><h1>Anti-Anxiety offline</h1><p>Você pode ouvir o som de apoio salvo neste dispositivo. Para acessar sua conta, conversas ou agenda, conecte-se à internet.</p><h2>Som de apoio</h2><audio controls preload="none" src="/' + som + '"></audio><p><a href="/">Tentar reconectar</a></p></main></html>';
const modelo = readFileSync(path.join(__dirname, "service-worker.js"), "utf8");
const hash = createHash("sha256").update(modelo).update(pagina);
for (const nome of arquivos) hash.update(nome).update(readFileSync(path.join(dist, nome)));
const versao = hash.digest("hex").slice(0, 16);
writeFileSync(path.join(dist, "offline.html"), pagina);
writeFileSync(path.join(dist, "service-worker.js"), modelo
  .replace("__VERSAO_DO_CACHE__", versao)
  .replace("__ARQUIVOS_OFFLINE__", JSON.stringify([...arquivos, "offline.html"].map((nome) => "/" + nome))));

