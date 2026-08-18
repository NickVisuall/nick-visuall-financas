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
function decodeBase64(value){const binary=atob(value);const bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);return bytes;}
export default {async fetch(request){const url=new URL(request.url);const asset=ASSETS[url.pathname];if(!asset)return new Response("Página não encontrada",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});const body=asset.encoding==="base64"?decodeBase64(asset.body):asset.body;const cache=url.pathname==="/"||url.pathname==="/index.html"?"no-cache":"public, max-age=3600";return new Response(body,{headers:{"content-type":asset.type,"cache-control":cache,"x-content-type-options":"nosniff"}});}};
`;

await rm(resolve(root, "dist"), { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, "index.js"), worker);
console.log("Site preparado para publicação.");
