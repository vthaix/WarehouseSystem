const fs = require("node:fs");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const { hashPassword, verifyPassword } = require("../src/services/domain/core");

async function main() {
  const password = process.env.NEW_LOGIN_PASSWORD;
  if (!password || password.length < 6)
    throw new Error("NEW_LOGIN_PASSWORD phải có ít nhất 6 ký tự.");
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query("SELECT id FROM users FOR UPDATE");
    for (const user of users)
      await connection.execute(
        "UPDATE users SET password_hash=?,failed_login_count=0,session_version=session_version+1,version=version+1 WHERE id=?",
        [hashPassword(password), user.id],
      );
    await connection.query("DELETE FROM login_attempts");
    const [rows] = await connection.query("SELECT password_hash FROM users");
    if (!rows.every((row) => verifyPassword(password, row.password_hash)))
      throw new Error("Kiểm tra mật khẩu thất bại.");
    // Run using the setup service so its secret volume is writable.
    fs.writeFileSync("/var/lib/warehouse-app-secrets/demo_password", password, { mode: 0o600 });
    await connection.commit();
    console.log(`Đã đổi và kiểm tra mật khẩu cho ${users.length} tài khoản.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(closePool);
