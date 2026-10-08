const { loadEnv } = require("../src/config/env");
loadEnv();
if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true") {
  console.error(
    "Demo credentials are only available with SEED_DEMO=true outside production.",
  );
  process.exitCode = 1;
} else {
  console.log(
    "Demo users: customer, customer2, planner, purchaser, manager, staff, staff2, qc, stocktaker, workshop, director",
  );
  console.log("Password: " + process.env.DEMO_PASSWORD);
  console.log(
    "Adminer: server=mysql, database=" +
      process.env.DB_NAME +
      ", user=" +
      process.env.DB_USER,
  );
  console.log("Database password: " + process.env.DB_PASSWORD);
}
