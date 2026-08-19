import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist", "server");
const textAssets = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/styles.css", "styles.css", "text/css; charset=utf-8"],
  ["/app.js", "app.js", "text/javascript; charset=utf-8"],
  ["/README.md", "README.md", "text/markdown; charset=utf-8"],
  ["/.nojekyll", ".nojekyll", "text/plain; charset=utf-8"]
];

const assets = {};
for (const [route, filename, type] of textAssets) {
  assets[route] = { type, encoding: "text", body: await readFile(resolve(root, filename), "utf8") };
}
assets["/og.png"] = {
  type: "image/png",
  encoding: "base64",
  body: (await readFile(resolve(root, "og.png"))).toString("base64")
};

const worker = `const ASSETS=${JSON.stringify(assets)};
const SYNC_CODE=/^[A-Za-z0-9_-]{20,80}$/;
function decodeBase64(value){const binary=atob(value);const bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);return bytes;}
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});}
async function ensureSchema(db){await db.prepare("CREATE TABLE IF NOT EXISTS sync_documents (sync_code TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL)").run();}
async function sync(request,url,env){if(!env.DB)return json({error:"Sincronização indisponível"},503);const code=decodeURIComponent(url.pathname.slice("/api/sync/".length));if(!SYNC_CODE.test(code))return json({error:"Código inválido"},400);await ensureSchema(env.DB);if(request.method==="GET"){const row=await env.DB.prepare("SELECT payload, updated_at FROM sync_documents WHERE sync_code = ?").bind(code).first();if(!row)return json({error:"Código não encontrado"},404);return json({state:JSON.parse(row.payload),updatedAt:row.updated_at});}if(request.method==="PUT"){const raw=await request.text();if(raw.length>1000000)return json({error:"Dados muito grandes"},413);let body;try{body=JSON.parse(raw);}catch{return json({error:"Dados inválidos"},400);}if(!body?.state?.items||!body?.state?.months)return json({error:"Estado inválido"},400);const payload=JSON.stringify(body.state),updatedAt=new Date().toISOString();await env.DB.prepare("INSERT INTO sync_documents (sync_code, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(sync_code) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind(code,payload,updatedAt).run();return json({updatedAt});}return json({error:"Método não permitido"},405);}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith("/api/sync/"))return sync(request,url,env);const asset=ASSETS[url.pathname];if(!asset)return new Response("Página não encontrada",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});const body=asset.encoding==="base64"?decodeBase64(asset.body):asset.body;const cache=url.pathname==="/"||url.pathname==="/index.html"?"no-cache":"public, max-age=3600";return new Response(body,{headers:{"content-type":asset.type,"cache-control":cache,"x-content-type-options":"nosniff"}});}};
`;

await rm(resolve(root, "dist"), { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, "index.js"), worker);
console.log("Site preparado para publicação.");
