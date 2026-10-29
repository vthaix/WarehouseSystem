const Product = require("../models/Product");
const C = require("../services/domain/core");
module.exports = function productBody(body, editing = false) {
  C.fields(body, [
    "_csrf",
    "_key",
    ...(editing ? ["version", ...Product.editFields] : Product.createFields),
  ]);
  const result = {};
  for (const k of editing ? Product.editFields : Product.createFields)
    if (body[k] !== undefined) result[k] = body[k];
  for (const k of ["is_sample", "is_published", "is_active"])
    result[k] = body[k] === "true";
  if (editing) result.version = Number(body.version);
  return result;
};
