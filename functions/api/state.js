const ALLOWED_KEYS = new Set(["catalogs", "programs", "exercises"]);

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    if (!db) return json({ ok: false, error: "Binding D1 DB no disponible." }, 500);

    await ensureSchema(db);
    const result = await db.prepare("SELECT key, value, updated_at FROM app_state").all();
    const data = { catalogs: {}, programs: [], exercises: [] };
    const updated = {};

    for (const row of result.results || []) {
      if (!ALLOWED_KEYS.has(row.key)) continue;
      try { data[row.key] = JSON.parse(row.value); } catch (_) {}
      updated[row.key] = row.updated_at;
    }

    return json({ ok: true, data, updated });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Error al leer D1." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    if (!db) return json({ ok: false, error: "Binding D1 DB no disponible." }, 500);

    await ensureSchema(db);
    const body = await context.request.json();
    const key = body?.key;
    const value = body?.value;

    if (!ALLOWED_KEYS.has(key)) {
      return json({ ok: false, error: "Clave de almacenamiento no permitida." }, 400);
    }

    const serialized = JSON.stringify(value ?? null);
    await db.prepare(`
      INSERT INTO app_state (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `).bind(key, serialized).run();

    return json({ ok: true, key });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Error al guardar en D1." }, 500);
  }
}
