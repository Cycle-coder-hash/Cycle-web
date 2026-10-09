import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const userDir = path.resolve("scratch/chrome_profile");
  
  if (!fs.existsSync("scratch")) {
    fs.mkdirSync("scratch", { recursive: true });
  }

  const chromeProc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${userDir}`,
    "--window-size=1280,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank",
  ]);

  console.log("Waiting for Chrome DevTools...");
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error("Failed to connect to Chrome CDP");
    chromeProc.kill();
    return;
  }

  console.log("Connected to Chrome:", wsUrl);

  const newTabRes = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" });
  const newTab = await newTabRes.json();
  const pageWsUrl = newTab.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");

  console.log("Navigating to http://localhost:3000/");
  await send("Page.navigate", { url: "http://localhost:3000/" });
  await sleep(1500);

  console.log("Setting mock auth session in localStorage...");
  await send("Runtime.evaluate", {
    expression: `
      localStorage.setItem('cycle_session_token', 'test_valid_session');
      localStorage.setItem('manus-runtime-user-info', JSON.stringify({
        id: 1,
        openId: 'trader_demo',
        name: 'Demo Trader',
        email: 'trader@cycleofchart.com'
      }));
    `,
  });

  console.log("Navigating to Leaderboard page...");
  await send("Page.navigate", { url: "http://localhost:3000/leaderboard" });
  await sleep(3000);

  // 1. Desktop Standard Screenshot
  console.log("Capturing Desktop screenshot...");
  const snap1 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("scratch/leaderboard_desktop.png", Buffer.from(snap1.result.data, "base64"));

  // 2. Reduced Motion Screenshot
  console.log("Testing Reduced Motion emulation...");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await sleep(1000);
  const snap2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("scratch/leaderboard_reduced_motion.png", Buffer.from(snap2.result.data, "base64"));

  // Reset reduced motion
  await send("Emulation.setEmulatedMedia", { features: [] });

  // 3. Mobile Viewport Screenshot (iPhone 14/15 size: 390x844)
  console.log("Testing Mobile Viewport...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);
  const snap3 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("scratch/leaderboard_mobile.png", Buffer.from(snap3.result.data, "base64"));

  console.log("All screenshots captured successfully!");

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
