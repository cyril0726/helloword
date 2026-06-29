import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// ✅ CORS middleware officiel Hono
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// --- ROUTES ---
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Helloword API is running 🚀"
  });
});

app.get("/api/health", async (c) => {
  const start = Date.now();

  try {
    // test DB léger et SAFE (lecture sans impact)
    const dbTest = await c.env.DB
      .prepare("SELECT 1 as ok")
      .first();

    const latency = Date.now() - start;

    return c.json({
      api: "ok",
      db: dbTest?.ok === 1 ? "ok" : "error",
      latencyMs: latency,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    const latency = Date.now() - start;

    return c.json(
      {
        api: "ok",
        db: "error",
        latencyMs: latency,
        error: String(err)
      },
      500
    );
  }
});

app.get("/api/messages", async (c) => {
  const { results } = await c.env.DB
    .prepare("SELECT * FROM messages ORDER BY created_at DESC")
    .all();

  return c.json(results);
});

app.post("/api/messages", async (c) => {
  const body = await c.req.json();

  await c.env.DB
    .prepare("INSERT INTO messages (text) VALUES (?)")
    .bind(body.text)
    .run();

  return c.json({ success: true });
});

app.delete("/api/messages", async (c) => {
  await c.env.DB
    .prepare("DELETE FROM messages")
    .run();

  return c.json({ success: true });
});

export default app;