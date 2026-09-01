export default async function handler(req, res) {
  try {
    const mod = await import("../dist/index.js");
    const serverHandler = mod.default || mod.appPromise;
    if (typeof serverHandler === "function") {
      return serverHandler(req, res);
    }
    const app = await serverHandler;
    if (app) return app(req, res);
    res.status(500).send("App handler not found");
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
