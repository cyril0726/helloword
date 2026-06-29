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

app.get("/api/hello", (c) => {
  return c.json({ message: "Hello World 🚀" });
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