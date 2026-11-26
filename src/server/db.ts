import "server-only";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { getDatabaseConfig } from "./env";

/**
 * MySQL/MariaDB access layer.
 * - One shared pool per process (kept on globalThis so dev hot-reloads don't leak).
 * - Every query uses placeholders (`?`) — values are never concatenated into SQL.
 * - Sessions run in UTC.
 */

type Param = string | number | boolean | Date | null | Buffer;
export type Params = Param[] | Record<string, Param>;

const globalForDb = globalThis as unknown as { __alfaPool?: Pool };

function createPool(): Pool {
  const pool = mysql.createPool({
    ...getDatabaseConfig(),
    charset: "utf8mb4",
    timezone: "Z",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
    maxIdle: 5,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: false,
  });
  pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
  });
  return pool;
}

export function getPool(): Pool {
  if (!globalForDb.__alfaPool) globalForDb.__alfaPool = createPool();
  return globalForDb.__alfaPool;
}

type Executor = Pool | PoolConnection;

export async function query<T = RowDataPacket>(sql: string, params: Params = [], executor: Executor = getPool()): Promise<T[]> {
  const [rows] = await executor.query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function queryOne<T = RowDataPacket>(sql: string, params: Params = [], executor: Executor = getPool()): Promise<T | null> {
  const rows = await query<T>(sql, params, executor);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: Params = [], executor: Executor = getPool()): Promise<ResultSetHeader> {
  const [result] = await executor.query<ResultSetHeader>(sql, params);
  return result;
}

/** Runs `work` inside a transaction; commits on success, rolls back on any error. */
export async function transaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/** Parses a JSON column (stored as LONGTEXT for MySQL/MariaDB compatibility). */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJson(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value);
}

/** Builds `col = ?` pairs for UPDATE statements from a partial object. */
export function buildUpdate(fields: Record<string, Param | undefined>) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined) as [string, Param][];
  return {
    sql: entries.map(([column]) => `\`${column}\` = ?`).join(", "),
    params: entries.map(([, value]) => value),
  };
}
