import { Hono } from "hono";
import { cors } from "hono/cors";

// Import des différents modules de routes
import tictactoe from "./routes/tictactoe";
import quickdraw from "./routes/quickdraw";

// Import du Durable Object.
// L'export en fin de fichier est obligatoire pour que Wrangler puisse l'enregistrer.
import { QuickdrawRoom } from "./durable-objects/QuickdrawRoom";

// Définition des bindings injectés par Cloudflare.
// Ils correspondent au wrangler.jsonc.
type Env = {
  DB: D1Database;                         // Base de données D1
  QUICKDRAW_ROOM: DurableObjectNamespace<QuickdrawRoom>; // Namespace permettant de créer/récupérer des Durable Objects
};

// Création de l'application Hono.
// Le type Bindings permet d'accéder à c.env avec un typage TypeScript.
const app = new Hono<{ Bindings: Env }>();

// Middleware CORS : autorise les appels du frontend vers l'API.
// ⚠️ origin: "*" est volontairement permissif pour le développement.
// À restreindre au domaine de prod avant une mise en ligne définitive
// (voir Roadmap Phase 4 — nettoyage) : n'importe quel site peut actuellement
// appeler cette API depuis un navigateur.
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"]
  })
);


// Sous-route : /api/tictactoe/* — jeu multi tour par tour (D1 + polling côté client)
// Toute la logique est dans routes/tictactoe.ts
app.route("/api/tictactoe", tictactoe);

// Sous-route : /api/quickdraw/* — jeu multi temps réel (Durable Object + WebSocket)
// Toute la logique est dans routes/quickdraw.ts
app.route("/api/quickdraw", quickdraw);

// Route racine : permet simplement de vérifier que l'API répond
// (utile pour un ping rapide, sans dépendance à la base D1).
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Helloword API is running 🚀"
  });
});

// Healthcheck : vérifie que le Worker répond ET que D1 est accessible.
// "api: ok" reste toujours renvoyé même si D1 échoue, pour distinguer
// "le Worker est down" (pas de réponse du tout) de "le Worker tourne
// mais la DB a un souci" (db: "error" dans la réponse).
app.get("/api/health", async (c) => {
  const start = Date.now();

  try {
    // Requête volontairement triviale (SELECT 1) : sert uniquement à vérifier
    // la connectivité D1, sans lire de vraie donnée ni impacter les tables.
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

// --- Routes /api/messages : table de test uniquement (guestbook expérimental,
// utilisé pour valider la connectivité D1 depuis le Dashboard). Pas de lien
// avec les jeux du Lab.

// Retourne tous les messages de la base.
app.get("/api/messages", async (c) => {
  const { results } = await c.env.DB
    .prepare("SELECT * FROM messages ORDER BY created_at DESC")
    .all();

  return c.json(results);
});

// Ajoute un nouveau message.
// ⚠️ Aucune validation sur body.text (peut être vide, undefined, ou d'un type
// inattendu) — acceptable pour une table de test, mais à ne pas reproduire
// tel quel sur une route qui gérerait de vraies données utilisateur.
app.post("/api/messages", async (c) => {
  const body = await c.req.json();

  await c.env.DB
    .prepare("INSERT INTO messages (text) VALUES (?)")
    .bind(body.text)
    .run();

  return c.json({ success: true });
});

// Supprime tous les messages.
// ⚠️ Aucune authentification : n'importe qui connaissant l'URL peut vider
// la table. Sans conséquence ici (données de test), mais à garder en tête
// si cette route sert un jour de modèle pour une route plus sensible.
app.delete("/api/messages", async (c) => {
  await c.env.DB
    .prepare("DELETE FROM messages")
    .run();

  return c.json({ success: true });
});

// Obligatoire : Wrangler doit voir la classe exportée depuis l'entrypoint
// pour la lier correctement au binding déclaré dans wrangler.jsonc,
// même si la classe est définie dans un autre fichier.
export { QuickdrawRoom };

// Point d'entrée de l'application Hono.
export default app;