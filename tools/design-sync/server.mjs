import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const dir = path.dirname(new URL(import.meta.url).pathname);
const store = {};
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Private-Network": "true" };
http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  const u = new URL(req.url, "http://x");
  if (req.method === "POST" && u.pathname.startsWith("/put/")) {
    let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { store[u.pathname.slice(5)] = b; fs.writeFileSync(path.join(dir, "store-" + u.pathname.slice(5) + ".json"), b); res.writeHead(200, cors); res.end("ok " + b.length); });
    return;
  }
  if (u.pathname.startsWith("/get/")) { const v = store[u.pathname.slice(5)]; res.writeHead(v ? 200 : 404, { ...cors, "Content-Type": "application/json" }); return res.end(v ?? "null"); }
  if (u.pathname.startsWith("/js/")) { const f = path.join(dir, path.basename(u.pathname)); if (fs.existsSync(f)) { res.writeHead(200, { ...cors, "Content-Type": "text/javascript", "Cache-Control": "no-store" }); return res.end(fs.readFileSync(f)); } }
  res.writeHead(404, cors); res.end("nf");
}).listen(8777, "127.0.0.1", () => console.log("relay up"));
