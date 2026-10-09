const mysql = require("mysql2/promise");
const { wrapSql } = require("./vietnamese-sql");
let pool;
function getPool() {
  if (!process.env.DB_NAME || !process.env.DB_USER)
    throw new Error("Đặt DB_NAME và DB_USER trước khi kết nối MySQL.");
  return (pool ||= wrapSql(mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: false,
    timezone: "Z",
    connectTimeout: 5000,
  })));
}
async function withTransaction(work) {
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
async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
module.exports = { getPool, withTransaction, closePool };
