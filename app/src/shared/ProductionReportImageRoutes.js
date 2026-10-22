const express = require("express"),
  crypto = require("node:crypto"),
  fs = require("node:fs/promises"),
  path = require("node:path");
const { csrf } = require("../middlewares/csrf.middleware"),
  { requireApiAuth } = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware"),
  C = require("../services/domain/core"),
  { ok } = require("../utils/response");
const images = require("../config/category-images"),
  reports = require("../config/production-report-images");
module.exports = (runtime) => {
  const router = express.Router();
  router.post(
    "/api/v1/production-report-images",
    csrf,
    requireApiAuth,
    role(["WORKSHOP_OWNER"]),
    express.json({ limit: "8mb" }),
    async (req, res) => {
      const { bytes, extension } = images.decode(req.body),
        name = crypto.randomUUID() + "." + extension;
      await fs.mkdir(reports.directory(), { recursive: true });
      await fs.writeFile(path.join(reports.directory(), name), bytes, {
        flag: "wx",
      });
      await fs.writeFile(
        path.join(reports.directory(), name + ".json"),
        JSON.stringify({ uploader_id: req.user.id }),
        { flag: "wx" },
      );
      ok(req, res, { image_path: "/images/production-reports/" + name }, 201);
    },
  );
  router.get(
    "/api/v1/production-reports/:id/images/:file",
    requireApiAuth,
    async (req, res) => {
      C.fail(
        !images.validName(req.params.file),
        "NOT_FOUND",
        "Không tìm thấy ảnh.",
        404,
      );
      const report = await runtime.productionReports.get(
        req.user,
        req.params.id,
      );
      C.fail(
        !reports.links(report.note).includes(req.params.file),
        "NOT_FOUND",
        "Ảnh không thuộc báo cáo.",
        404,
      );
      res.set("Cache-Control", "private, no-store");
      res.sendFile(req.params.file, {
        root: reports.directory(),
        dotfiles: "deny",
      });
    },
  );
  return router;
};
