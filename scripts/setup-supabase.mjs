import fs from "node:fs";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

const sqlText = fs.readFileSync("supabase.sql", "utf8");
const sql = postgres(databaseUrl, {
  max: 1,
  ssl: "require",
  prepare: false,
});

try {
  await sql.unsafe(sqlText);
  console.log("Supabase schema applied successfully.");
} finally {
  await sql.end();
}
