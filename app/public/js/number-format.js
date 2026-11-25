// =============================================================================
// CHUẨN SỐ DÙNG CHUNG (trình duyệt và máy chủ)
//   Dấu .  phân cách hàng nghìn, triệu…      Dấu ,  phần thập phân
//   Phần thập phân bằng 0 thì bỏ: 56.000 trong CSDL hiện là "56", 1500.500 hiện là "1.500,5".
//   "Số máy" (canonical) là dạng CSDL/API dùng: 1500.500 — không có dấu phân cách nghìn.
// =============================================================================
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.warehouseNumber = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const HINT = "Nhập số hợp lệ: dấu . phân cách hàng nghìn, dấu , là phần thập phân. Ví dụ 1.250 hoặc 1,25.";
  // Các trường luôn là số, kể cả khi giá trị là số nguyên ("1500" → "1.500").
  const NUMERIC_KEY = /(quantity|price|amount|percentage|difference)$|^total$/;

  /** Số máy → chữ hiển thị. Giá trị không phải số được trả lại nguyên vẹn. */
  function display(value) {
    if (value === null || value === undefined) return "";
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(value));
    if (!match) return String(value);
    const whole = match[2].replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+$)/g, ".");
    const fraction = (match[3] || "").replace(/0+$/, "");
    return match[1] + whole + (fraction ? "," + fraction : "");
  }

  /** Chữ người dùng gõ → số máy. Báo lỗi nếu sai chuẩn (ví dụ 1.5 hoặc 1,000.5). */
  function parse(text) {
    const raw = String(text).trim();
    if (!/^(\d+|[1-9]\d{0,2}(\.\d{3})+)(,\d+)?$/.test(raw)) throw Error(HINT);
    return raw.replaceAll(".", "").replace(",", ".");
  }

  const isCanonical = (value) => /^\d+(\.\d+)?$/.test(String(value));
  const isNumericKey = (key) => NUMERIC_KEY.test(key);

  return { display, parse, isCanonical, isNumericKey, HINT };
});
