// src/app/api/supabase/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import {
  DEFAULT_SHOPS,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_ORDERS,
  DEFAULT_BUYERS,
  DEFAULT_SELLERS,
  DEFAULT_SUBSCRIPTIONS,
  DEFAULT_USER_ROLES,
  DEFAULT_PENDING_CONFIRMATIONS,
  DEFAULT_PLATFORM_SETTINGS
} from "@/app/lib/supabase";

const TABLES_DDL = [
  {
    name: "user_roles",
    sql: `
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        role VARCHAR(255) NOT NULL
      );
    `
  },
  {
    name: "shops",
    sql: `
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        seller_id VARCHAR(255) NOT NULL,
        shop_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        rating NUMERIC(3, 2),
        total_reviews INTEGER DEFAULT 0,
        plan VARCHAR(255) NOT NULL,
        delivery_inside_city INTEGER DEFAULT 0,
        delivery_outside_city INTEGER DEFAULT 0,
        banner_url VARCHAR(2000),
        logo_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "categories",
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        image_url VARCHAR(1000)
      );
    `
  },
  {
    name: "products",
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        shop_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        selling_price INTEGER NOT NULL,
        cost_price INTEGER,
        stock INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        image_url VARCHAR(2000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "orders",
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        shop_id VARCHAR(255) NOT NULL,
        buyer_id VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(255) NOT NULL,
        customer_address TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        delivery_charge INTEGER DEFAULT 0,
        status VARCHAR(255) NOT NULL,
        payment_method VARCHAR(255) NOT NULL,
        payment_status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "buyers",
    sql: `
      CREATE TABLE IF NOT EXISTS buyers (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        city VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "sellers",
    sql: `
      CREATE TABLE IF NOT EXISTS sellers (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "subscriptions",
    sql: `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        shop_id VARCHAR(255) NOT NULL,
        package VARCHAR(255) NOT NULL,
        amount_paid INTEGER NOT NULL,
        payment_method VARCHAR(255) NOT NULL,
        expiry_date VARCHAR(255),
        status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "pending_confirmations",
    sql: `
      CREATE TABLE IF NOT EXISTS pending_confirmations (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        shop_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        package VARCHAR(255) NOT NULL,
        transaction_id VARCHAR(255) NOT NULL,
        payment_method VARCHAR(255) NOT NULL,
        amount_paid INTEGER NOT NULL,
        seller_user_id VARCHAR(255) NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "platform_settings",
    sql: `
      CREATE TABLE IF NOT EXISTS platform_settings (
        id VARCHAR(255) PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        label VARCHAR(255)
      );
    `
  }
];

const SEEDS_MAP: Record<string, any[]> = {
  user_roles: DEFAULT_USER_ROLES,
  shops: DEFAULT_SHOPS,
  categories: DEFAULT_CATEGORIES,
  products: DEFAULT_PRODUCTS,
  orders: DEFAULT_ORDERS,
  buyers: DEFAULT_BUYERS,
  sellers: DEFAULT_SELLERS,
  subscriptions: DEFAULT_SUBSCRIPTIONS,
  pending_confirmations: DEFAULT_PENDING_CONFIRMATIONS,
  platform_settings: DEFAULT_PLATFORM_SETTINGS
};

function cleanDatabaseUrl(url: string): string {
  // Strip password square brackets (common error where users paste placeholder brackets like [password])
  try {
    const parts = url.split("@");
    if (parts.length > 1) {
      const authPart = parts[0]; // e.g. postgresql://postgres:[password]
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

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrlConfigured: !!process.env.SUPABASE_DATABASE_URL,
    defaultDatabaseUrlPlaceholder: "postgresql://postgres:password@db.supabase.co:5432/postgres"
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const logs: string[] = [];
  const addLog = (msg: string) => {
    console.log(`[Supabase Setup] ${msg}`);
    logs.push(msg);
  };

  const report = {
    databaseResolved: "none" as "connected" | "failed",
    tablesCreated: 0,
    tablesExisted: 0,
    documentsSeeded: 0,
    documentsSkipped: 0,
    executionTimeMs: 0,
    hasErrors: false,
    errorMessage: null as string | null
  };

  let client: Client | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    
    // Secure URL priority: Server env -> Request body -> Fallback
    const rawConnectionUrl = process.env.SUPABASE_DATABASE_URL || body.connectionUrl;
    
    if (!rawConnectionUrl) {
      return NextResponse.json(
        { error: "A Supabase PostgreSQL connection URL is required." },
        { status: 400 }
      );
    }

    const connectionString = cleanDatabaseUrl(rawConnectionUrl.trim());
    addLog("Step 0: Initializing PostgreSQL Connection client...");

    // Connect to PostgreSQL
    client = new Client({
      connectionString,
      ssl: connectionString.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
    });

    try {
      await client.connect();
      report.databaseResolved = "connected";
      addLog("✓ Successfully connected to Supabase PostgreSQL database!");
    } catch (connErr: any) {
      report.databaseResolved = "failed";
      report.hasErrors = true;
      report.errorMessage = connErr.message;
      addLog(`❌ Connection failed: ${connErr.message}`);
      return NextResponse.json(
        {
          error: `Could not connect to the Supabase database. Verify connection string & firewall. Error: ${connErr.message}`,
          logs,
          report
        },
        { status: 400 }
      );
    }

    // ─── Step 1: Create Tables ────────────────────────────────────────────────
    addLog("Step 1: Creating database schemas...");
    for (const table of TABLES_DDL) {
      addLog(`Configuring Table: '${table.name}'...`);
      try {
        // Check if table exists
        const checkRes = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table.name]);

        const exists = checkRes.rows[0].exists;

        if (exists) {
          report.tablesExisted++;
          addLog(`✓ Table '${table.name}' already exists.`);
        } else {
          await client.query(table.sql);
          report.tablesCreated++;
          addLog(`✓ Table '${table.name}' created successfully.`);
        }
      } catch (tableErr: any) {
        report.hasErrors = true;
        addLog(`❌ Error creating table '${table.name}': ${tableErr.message}`);
      }
    }

    // ─── Step 1.5: Enable RLS and create permissive policies ──────────────────
    addLog("Step 1.5: Enabling RLS and creating permissive policies...");
    for (const table of TABLES_DDL) {
      try {
        await client.query(`ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Enable all operations for all users" ON ${table.name};`);
        await client.query(`
          CREATE POLICY "Enable all operations for all users" 
          ON ${table.name} 
          FOR ALL 
          USING (true) 
          WITH CHECK (true);
        `);
        addLog(`✓ RLS enabled and policy added for '${table.name}'.`);
      } catch (rlsErr: any) {
        report.hasErrors = true;
        addLog(`❌ Error enabling RLS for '${table.name}': ${rlsErr.message}`);
      }
    }

    // ─── Step 2: Seed Data Idempotently ───────────────────────────────────────
    addLog("Step 2: Seed default records into tables...");
    for (const [tableName, seedData] of Object.entries(SEEDS_MAP)) {
      addLog(`Seeding table '${tableName}'...`);
      try {
        // Check row count
        const countRes = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = parseInt(countRes.rows[0].count, 10);

        if (count > 0) {
          addLog(`- Seeding skipped: Table '${tableName}' already contains ${count} record(s).`);
          report.documentsSkipped += seedData.length;
          continue;
        }

        addLog(`Deploying ${seedData.length} mock records to '${tableName}'...`);
        let seededInTable = 0;

        for (const item of seedData) {
          const keys = Object.keys(item);
          const values = Object.values(item);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
          const columns = keys.map(k => `"${k}"`).join(", "); // wrapped in quotes to prevent reserved keyword collisions

          await client.query(
            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
            values
          );
          seededInTable++;
        }

        report.documentsSeeded += seededInTable;
        addLog(`✓ Successfully seeded ${seededInTable} records into '${tableName}'.`);
      } catch (seedErr: any) {
        report.hasErrors = true;
        addLog(`❌ Seeding failed for table '${tableName}': ${seedErr.message}`);
      }
    }

    addLog("--------------------------------------------------");
    addLog("Supabase PostgreSQL schemas fully deployed and seeded! 🚀");
    report.executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: !report.hasErrors,
      logs,
      report
    });

  } catch (error: any) {
    report.executionTimeMs = Date.now() - startTime;
    report.hasErrors = true;
    report.errorMessage = error.message;
    addLog(`❌ Unhandled exception: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs, report }, { status: 500 });
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
