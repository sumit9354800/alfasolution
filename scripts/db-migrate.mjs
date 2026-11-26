// Applies every SQL file in database/migrations that has not been applied yet.
// Usage: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { connect } from "./lib/db.mjs";

const dir = path.join(process.cwd(), "database", "migrations");

async function main() {
  const connection = await connect({ multipleStatements: true });
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(120) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    const [rows] = await connection.query("SELECT version FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.version));
    const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();

    let count = 0;
    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      if (applied.has(version)) continue;
      const sql = await readFile(path.join(dir, file), "utf8");
      process.stdout.write(`Applying ${file} … `);
      await connection.query(sql);
      await connection.query("INSERT IGNORE INTO schema_migrations (version) VALUES (?)", [version]);
      console.log("done");
      count += 1;
    }
    console.log(count ? `Applied ${count} migration(s).` : "Database is up to date.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
