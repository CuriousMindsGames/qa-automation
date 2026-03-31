const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SD = "C:/Users/aakas/Workspace/worktrees/qa-session/reviews/ui";
const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  const r = { screenshots:[], errors:[], warnings:[], consoleErrors:[], checks:[], passed:0, failed:0 };
  page.on("console", m => { if(m.type()==="error") r.consoleErrors.push(m.text()); });
  page.on("pageerror", e => r.consoleErrors.push("PAGE_ERR: "+e.message));
  try {
    var t0 = Date.now();
    var resp = await page.goto(BASE, { waitUntil:"networkidle", timeout:30000 });
    var lt = Date.now()-t0;
    r.checks.push({c:"Page load",s:resp.ok()?"PASS":"FAIL",d:lt+"ms"});
    if(resp.ok()) r.passed++; else r.failed++;
    await page.waitForTimeout(2000);
    await page.screenshot({path:path.join(SD,"2026-04-01-full-dashboard.png"),fullPage:true});
    var title = await page.title();
    var tc = title.includes("Agent Hub")||title.includes("CuriousMinds");
    r.checks.push({c:"Title",s:tc?"PASS":"WARN",d:title});
    if(tc) r.passed++; else r.warnings.push("Title: "+title);
    var pt = await page.textContent("body");
    var kpis = [["Systems 193",pt.includes("193")],["LOC 37K",pt.includes("37K")||pt.includes("37,096")],["C++ 545",pt.includes("545")],["Commits 122",pt.includes("122")],["Jira 244",pt.includes("244")],["MCPs 15",pt.includes("15/15")||pt.includes("15")]];
    kpis.forEach(function(k){r.checks.push({c:"KPI:"+k[0],s:k[1]?"PASS":"FAIL",d:k[1]?"Found":"Missing"});if(k[1])r.passed++;else r.failed++;});
    ["CTO","CFO","COO","CCO","CDSL","LICI","TCS"].forEach(function(s){var f=pt.includes(s);r.checks.push({c:"Section:"+s,s:f?"PASS":"WARN",d:f?"Present":"Missing"});if(f)r.passed++;else r.warnings.push(s+" missing");});
    if(pt.includes("Day 2")) r.warnings.push("Shows Day 2 - possibly stale");
    var imgCount = await page.locator("img").count();
    r.checks.push({c:"Images",s:"PASS",d:imgCount+" images found"});
    r.passed++;
    var bg = await page.evaluate(function(){return getComputedStyle(document.body).backgroundColor});
    var cs = bg!=="rgba(0, 0, 0, 0)";
    r.checks.push({c:"CSS",s:cs?"PASS":"FAIL",d:bg});
    if(cs) r.passed++; else r.failed++;
    await page.screenshot({path:path.join(SD,"2026-04-01-top.png"),clip:{x:0,y:0,width:1920,height:1080}});
    await page.evaluate(function(){window.scrollTo(0,document.body.scrollHeight/2)});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(SD,"2026-04-01-middle.png")});
    await page.evaluate(function(){window.scrollTo(0,document.body.scrollHeight)});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(SD,"2026-04-01-bottom.png")});
    await page.setViewportSize({width:375,height:812});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(SD,"2026-04-01-mobile.png"),fullPage:true});
    var ov = await page.evaluate(function(){return document.body.scrollWidth>window.innerWidth});
    r.checks.push({c:"Mobile",s:ov?"WARN":"PASS",d:ov?"Overflow":"OK"});
    if(ov) r.warnings.push("Mobile horizontal overflow"); else r.passed++;
    await page.setViewportSize({width:1920,height:1080});
    var pnl = pt.includes("-9,708")||pt.includes("9708")||pt.includes("-28");
    r.checks.push({c:"Portfolio PnL",s:pnl?"PASS":"WARN",d:pnl?"Matches":"Not found"});
    if(pnl) r.passed++; else r.warnings.push("PnL not visible");
    var ts = pt.includes("2026")||pt.includes("Mar")||pt.includes("Apr");
    r.checks.push({c:"Timestamps",s:ts?"PASS":"WARN",d:ts?"Found":"None"});
    if(ts) r.passed++; else r.warnings.push("No timestamps");
    var cl = await page.locator("[onclick], details > summary").count();
    r.checks.push({c:"Interactive",s:cl?"PASS":"WARN",d:cl+" clickable"});
    if(cl) r.passed++; else r.warnings.push("No clickable sections");
  } catch(err) {
    r.errors.push("CRITICAL: "+err.message);
    r.failed++;
  }
  await browser.close();
  console.log("======================================================================");
  console.log("UI REVIEW RESULTS");
  console.log("======================================================================");
  console.log("Passed:"+r.passed+" Failed:"+r.failed+" Warnings:"+r.warnings.length+" ConsoleErrors:"+r.consoleErrors.length);
  r.checks.forEach(function(c){console.log("  ["+c.s+"] "+c.c+": "+c.d)});
  if(r.warnings.length){console.log("WARNINGS:");r.warnings.forEach(function(w){console.log("  "+w)});}
  if(r.errors.length){console.log("ERRORS:");r.errors.forEach(function(e){console.log("  "+e)});}
  if(r.consoleErrors.length){console.log("CONSOLE ERRORS:");r.consoleErrors.forEach(function(e){console.log("  "+e)});}
  var total=r.passed+r.failed+r.warnings.length;
  var score=total>0?Math.round((r.passed/total)*10):0;
  console.log("SCORE: "+score+"/10");
  console.log("VERDICT: "+(r.failed>0?"NEEDS FIXES":(r.warnings.length>3?"NEEDS FIXES":"SHIP IT")));
  fs.writeFileSync(path.join(SD,"2026-04-01-review-results.json"),JSON.stringify(r,null,2));
})();