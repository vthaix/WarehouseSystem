const assert = require("node:assert/strict");
module.exports = async ({
  pool,
  client,
  workshop,
  planner,
  director,
  planId,
}) => {
  const ids = [];
  const expect = (r, s) => {
    assert.equal(r.status, s, JSON.stringify(r));
    return r.data;
  };
  try {
    expect(
      await workshop.call("/api/v1/production-reports", "POST", {
        production_plan_id: planId,
        report_purpose: "TIEN_DO",
        progress_percentage: "100",
        note: "Not completed",
      }),
      422,
    );
    for (const purpose of ["TIEN_DO", "SU_CO", "TIEN_DO"]) {
      const shared = ids.length === 2;
      let report = expect(
        await workshop.call("/api/v1/production-reports", "POST", {
          production_plan_id: planId,
          report_purpose: purpose,
          progress_percentage: "35.50",
          note:
            purpose === "SU_CO"
              ? "Packaging machine stopped"
              : "Production progress",
          send_to_planner: shared,
        }),
        201,
      );
      ids.push(report.id);
      assert.deepEqual(report.lines, []);
      assert.equal(report.send_to_planner, shared);
      report = expect(
        await workshop.call(
          "/api/v1/production-reports/" + report.id,
          "PATCH",
          {
            version: report.version,
            note: "Updated progress / incident",
            progress_percentage: "40.00",
          },
        ),
        200,
      );
      report = expect(
        await workshop.call(
          "/api/v1/production-reports/" + report.id + "/submit",
          "POST",
          { version: report.version },
        ),
        200,
      );
      expect(
        await director.call("/api/v1/production-reports/" + report.id),
        200,
      );
      expect(
        await planner.call("/api/v1/production-reports/" + report.id),
        shared ? 200 : 404,
      );
      const [recipients] = await pool.execute(
        "SELECT r.code FROM notifications n JOIN user_roles ur ON ur.user_id=n.user_id JOIN roles r ON r.id=ur.role_id WHERE n.resource_type='production-reports' AND n.resource_id=?",
        [report.id],
      );
      assert.ok(recipients.some((r) => r.code === "DIRECTOR"));
      assert.equal(
        recipients.some((r) => r.code === "PLANNER"),
        shared,
      );
      expect(
        await workshop.call(
          "/api/v1/production-reports/" + report.id,
          "PATCH",
          { version: report.version, note: "Changed after send" },
        ),
        409,
      );
    }
    const lookup = expect(
      await workshop.call("/api/v1/lookup/production-reports"),
      200,
    );
    assert.ok(ids.every((id) => !lookup.some((r) => r.id === id)));
    const purchaser = client();
    await purchaser.login("purchaser");
    const buy = expect(
      await purchaser.call("/api/v1/source-imports/purchase-report-options"),
      200,
    );
    assert.ok(ids.every((id) => !buy.some((r) => r.id === id)));
    const [[physical]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM production_report_headers WHERE id IN (" +
        ids.map(() => "?").join(",") +
        ") AND report_kind='SAN_XUAT'",
      ids,
    );
    assert.equal(Number(physical.total), 3);
    console.log(
      "PRODUCTION REPORT PASS: multiple progress/incident reports, no mandatory materials, director delivery, optional planner access, immutable submissions and excluded purchasing sources",
    );
  } finally {
    for (const id of ids) {
      await pool.execute(
        "DELETE FROM notifications WHERE resource_type='production-reports' AND resource_id=?",
        [id],
      );
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='production-reports' AND resource_id=?",
        [id],
      );
      await pool.execute("DELETE FROM production_reports WHERE id=?", [id]);
    }
  }
};
