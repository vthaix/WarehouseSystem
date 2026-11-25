const test = require("node:test"), assert = require("node:assert/strict");
const R = require("../../src/modules/customer-orders/recipient");

test("số điện thoại được đưa về dạng 0xxxxxxxxx", () => {
  for (const text of ["0901234567", "090 123 4567", "090.123.4567", "+84901234567", "84901234567"]) assert.equal(R.phone(text), "0901234567");
  for (const text of ["", "12345", "901234567", "09012345678901", "abc", undefined]) assert.throws(() => R.phone(text));
});
test("đặt hàng: cần đủ tên và số điện thoại; không gửi trường nào thì trả null", () => {
  assert.equal(R.read({}), null);
  assert.deepEqual(R.read({ recipient_name: "  Nguyễn  Văn An ", recipient_phone: "0901 234 567" }), { name: "Nguyễn Văn An", phone: "0901234567" });
  assert.throws(() => R.read({ recipient_name: "An" }));
  assert.throws(() => R.read({ recipient_name: " ", recipient_phone: "0901234567" }));
});
test("hồ sơ: lần đầu tự lưu; lần sau chỉ lưu khi khách đồng ý và có thay đổi", () => {
  const an = { name: "An", phone: "0901234567" }, binh = { name: "Bình", phone: "0901234567" };
  assert.equal(R.fromProfile({ TenNguoiNhan: null, phone: "0901234567" }), null);
  assert.deepEqual(R.fromProfile({ TenNguoiNhan: "An", phone: "0901234567" }), an);
  assert.equal(R.shouldSaveProfile(null, an, undefined), true);
  assert.equal(R.shouldSaveProfile(an, binh, false), false);
  assert.equal(R.shouldSaveProfile(an, binh, true), true);
  assert.equal(R.shouldSaveProfile(an, an, true), false);
  assert.equal(R.shouldSaveProfile(null, null, true), false);
});
