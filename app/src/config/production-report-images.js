const path = require("node:path"),
  fs = require("node:fs");
const C = require("../services/domain/core"),
  images = require("./category-images");
const directory = () => path.resolve(__dirname, "../images/production-reports");
const links = (note) =>
  [
    ...(note || "").matchAll(
      /\/images\/production-reports\/([a-f0-9-]{36}\.(?:png|jpg|webp))/g,
    ),
  ].map((m) => m[1]);
function validate(user, note, previous = "") {
  const names = [...new Set(links(note))];
  C.fail(
    names.length > 6,
    "VALIDATION_ERROR",
    "Tối đa 6 ảnh trong một báo cáo.",
  );
  for (const name of names) {
    C.fail(
      !images.validName(name) || !fs.existsSync(path.join(directory(), name)),
      "VALIDATION_ERROR",
      "Ảnh báo cáo không tồn tại.",
    );
    const metaFile = path.join(directory(), name + ".json");
    C.fail(
      !fs.existsSync(metaFile),
      "VALIDATION_ERROR",
      "Ảnh báo cáo không hợp lệ.",
    );
    const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    C.fail(
      String(meta.uploader_id) !== String(user.id) &&
        !links(previous).includes(name),
      "FORBIDDEN",
      "Ảnh không thuộc người lập báo cáo.",
      403,
    );
  }
}
module.exports = { directory, links, validate };
