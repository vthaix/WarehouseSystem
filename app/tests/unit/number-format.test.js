const test = require("node:test"), assert = require("node:assert/strict");
const N = require("../../public/js/number-format");
const { format } = require("../../public/js/presentation");

test("display: dấu . phân cách nghìn, dấu , thập phân, bỏ phần thập phân bằng 0", () => {
  for (const [value, text] of [["56.000", "56"], ["0.000", "0"], ["1500.500", "1.500,5"], ["1234567", "1.234.567"], ["0.2500", "0,25"],
    ["-1500.000", "-1.500"], [1500, "1.500"], ["100", "100"], ["abc", "abc"], [null, ""]])
    assert.equal(N.display(value), text);
});
test("parse: đọc số người dùng gõ, từ chối cách viết mơ hồ", () => {
  for (const [text, value] of [["56", "56"], ["1.500", "1500"], ["1.500,5", "1500.5"], ["1500,5", "1500.5"], ["0,25", "0.25"], ["1.234.567", "1234567"]])
    assert.equal(N.parse(text), value);
  for (const text of ["1.5", "0.250", "1,000.5", "1.50.000", "1e3", "-1", "", "1,,5", "12.3456"]) assert.throws(() => N.parse(text));
});
test("gõ lại đúng chữ đang hiện thì ra cùng một số", () => {
  for (const value of ["56.000", "1500.500", "1000000.001", "0.0001"]) assert.equal(Number(N.parse(N.display(value))), Number(value));
});
test("format trên màn hình: số nguyên của trường số lượng / tiền cũng có dấu phân cách, mã không bị đổi", () => {
  assert.equal(format("56.000", "quantity"), "56");
  assert.equal(format("1500", "quantity"), "1.500");
  assert.equal(format(12000, "unit_price"), "12.000");
  assert.equal(format("1500", "code"), "1500");
  assert.equal(format("DH-KHACHHANG-05", "code"), "DH-KHACHHANG-05");
  assert.equal(format("2500000.0000", "total_amount"), "2.500.000 ₫");
});
