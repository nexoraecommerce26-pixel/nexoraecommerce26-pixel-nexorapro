// src/app/api/supabase/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

function cleanDatabaseUrl(url: string): string {
  try {
    const parts = url.split("@");
    if (parts.length > 1) {
      const authPart = parts[0];
      const lastColonIndex = authPart.lastIndexOf(":");
      if (lastColonIndex !== -1) {
        const protocolAndUser = authPart.substring(0, lastColonIndex);
        let password = authPart.substring(lastColonIndex + 1);
        if (password.startsWith("[") && password.endsWith("]")) {
          password = password.substring(1, password.length - 1);
          return `${protocolAndUser}:${password}@${parts.slice(1).join("@")}`;
        }
      }
    }
  } catch (err) {
    console.error("Failed parsing URL with cleanDatabaseUrl:", err);
  }
  return url;
}

export async function POST(req: NextRequest) {
  const connectionUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionUrl) {
    return NextResponse.json(
      { error: "Supabase connection URL is not configured on the server environment." },
      { status: 503 }
    );
  }

  let client: Client | null = null;

  try {
    const { action, tableName, filters = [], data, orderCol, orderAsc, isSingle } = await req.json();

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const connectionString = cleanDatabaseUrl(connectionUrl.trim());
    client = new Client({
      connectionString,
      ssl: connectionString.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
    });

    await client.connect();

    // ─── SELECT ──────────────────────────────────────────────────────────────
    if (action === "select") {
      let sql = `SELECT * FROM "${tableName}"`;
      const params: any[] = [];
      const whereClauses: string[] = [];

      filters.forEach((f: any) => {
        whereClauses.push(`"${f.col}" = $${params.length + 1}`);
        params.push(f.val);
      });

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      if (orderCol) {
        sql += ` ORDER BY "${orderCol}" ${orderAsc !== false ? "ASC" : "DESC"}`;
      }

      const res = await client.query(sql, params);
      const rows = res.rows;

      if (isSingle) {
        return NextResponse.json({ data: rows[0] || null, error: null });
      }
      return NextResponse.json({ data: rows, error: null });
    }

    // ─── INSERT (UPSERT) ─────────────────────────────────────────────────────
    if (action === "insert") {
      const rowsToInsert = Array.isArray(data) ? data : [data];
      const inserted: any[] = [];

      for (const row of rowsToInsert) {
        const item = {
          id: row.id || `row-${Math.random().toString(36).substr(2, 9)}`,
          created_at: row.created_at || new Date().toISOString(),
          ...row
        };

        const keys = Object.keys(item);
        const values = Object.values(item);
        const columns = keys.map(k => `"${k}"`).join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

        const updates = keys
          .filter(k => k !== "id" && k !== "created_at")
          .map(k => `"${k}" = EXCLUDED."${k}"`)
          .join(", ");

        let sql = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`;
        if (updates.length > 0) {
          sql += ` ON CONFLICT ("id") DO UPDATE SET ${updates}`;
        } else {
          sql += ` ON CONFLICT ("id") DO NOTHING`;
        }
        sql += ` RETURNING *`;

        const res = await client.query(sql, values);
        inserted.push(res.rows[0]);
      }

      return NextResponse.json({
        data: Array.isArray(data) ? inserted : inserted[0],
        error: null
      });
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────
    if (action === "update") {
      const params: any[] = [];
      const setClauses: string[] = [];

      Object.entries(data).forEach(([col, val]) => {
        setClauses.push(`"${col}" = $${params.length + 1}`);
        params.push(val);
      });

      let sql = `UPDATE "${tableName}" SET ${setClauses.join(", ")}`;
      const whereClauses: string[] = [];

      filters.forEach((f: any) => {
        whereClauses.push(`"${f.col}" = $${params.length + 1}`);
        params.push(f.val);
      });

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }
      sql += " RETURNING *";

      const res = await client.query(sql, params);
      return NextResponse.json({ data: res.rows, error: null });
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────
    if (action === "delete") {
      let sql = `DELETE FROM "${tableName}"`;
      const params: any[] = [];
      const whereClauses: string[] = [];

      filters.forEach((f: any) => {
        whereClauses.push(`"${f.col}" = $${params.length + 1}`);
        params.push(f.val);
      });

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      await client.query(sql, params);
      return NextResponse.json({ data: null, error: null });
    }

    return NextResponse.json({ error: "Unsupported query action" }, { status: 400 });

  } catch (error: any) {
    console.error("Error executing proxy query:", error);
    return NextResponse.json({ error: error.message || "Query execution failed" }, { status: 500 });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error("Error closing client:", closeErr);
      }
    }
  }
}
