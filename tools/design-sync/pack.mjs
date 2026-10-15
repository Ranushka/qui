// usage: node pack.mjs <file> <name>  -> prints an execute_code snippet that stores the gzipped file in globalThis.__files[name]
// Fallback for when Cloudflare challenges the plugin's fetch of /qui-tmp (the plugin sandbox has no clearance cookie).
import fs from "node:fs";
import zlib from "node:zlib";
const [file, name] = process.argv.slice(2);
const b64 = zlib.gzipSync(fs.readFileSync(file), { level: 9 }).toString("base64");
process.stdout.write(`const b=Uint8Array.from(atob(${JSON.stringify(b64)}),c=>c.charCodeAt(0));` +
  `const t=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).text();` +
  `(globalThis.__files=globalThis.__files||{})[${JSON.stringify(name)}]=t;return {name:${JSON.stringify(name)},chars:t.length};`);
