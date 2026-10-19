import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {analyzeProximity} from "../lib/proximity.ts";
import {GET,POST} from "../app/api/ai-briefing/route.ts";
const data=JSON.parse(readFileSync(new URL("../data/hotspots.json",import.meta.url),"utf8"));
assert.equal(data.features.length,53);
assert.equal(data.features.filter(f=>f.properties.kind==="truck").length,15);
const pairs=analyzeProximity(data);assert.equal(pairs.length,570);
assert.deepEqual([100,300,500].map(d=>pairs.filter(c=>c.distanceM<=d).length),[7,10,14]);
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if([".git","node_modules",".next",".vercel"].includes(e.name))return [];const path=`${dir}/${e.name}`;return e.isDirectory()?walk(path):[path];});}
const files=walk(".");
assert.ok(!files.some(p=>/\.pdf$|traffic[-_]sites\.json|source-pages\.json|clauses\.json|\.env|legacy-mvp|screenshots/.test(p)));
assert.deepEqual(readdirSync("data"),["hotspots.json"]);
globalThis.fetch=()=>{throw new Error("External AI requests are forbidden in this demo test");};
process.env.GEMINI_API_KEY="demo-test-only";
assert.deepEqual(await GET().json(),{enabled:false,reason:"public_demo"});
assert.equal(POST().status,403);
assert.deepEqual(await POST().json(),{error:"public_demo"});
console.log("53 records, 570 pairs, 7/10/14 thresholds verified; restricted source files absent.");
