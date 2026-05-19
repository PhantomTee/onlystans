import postgres from "postgres";

const globalDb = globalThis as typeof globalThis & { __onlystansSql?: postgres.Sql };

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) return null;
  globalDb.__onlystansSql ??= postgres(process.env.DATABASE_URL, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: "require",
  });
  return globalDb.__onlystansSql;
}
