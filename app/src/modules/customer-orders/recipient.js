// =============================================================================
// NGƯỜI NHẬN HÀNG (UC-02 đặt hàng, UC-03.1 sửa đơn)
//   Đơn hàng lưu tên + số điện thoại người nhận của riêng đơn đó.
//   Hồ sơ khách hàng lưu người nhận mặc định để điền sẵn cho lần đặt sau:
//     - Hồ sơ chưa có đủ tên và số điện thoại: lưu luôn từ đơn đang đặt.
//     - Hồ sơ đã có và khách nhập khác: chỉ cập nhật khi khách đồng ý (update_profile = true).
// =============================================================================
const C = require("../../services/domain/core");

const FIELDS = ["recipient_name", "recipient_phone"];

/** Số điện thoại Việt Nam về dạng 0xxxxxxxxx (10–11 số); chấp nhận khoảng trắng, dấu chấm, gạch và +84. */
function phone(value) {
  C.fail(typeof value !== "string" || !value.trim(), "VALIDATION_ERROR", "Vui lòng nhập số điện thoại người nhận.", 422, { recipient_phone: ["Bắt buộc nhập"] });
  const digits = value.trim().replace(/[\s.\-()]/g, "").replace(/^\+?84(?=\d{9,10}$)/, "0");
  C.fail(!/^0\d{9,10}$/.test(digits), "VALIDATION_ERROR", "Số điện thoại người nhận không hợp lệ (10–11 số, bắt đầu bằng 0).", 422, { recipient_phone: ["Ví dụ 0901234567"] });
  return digits;
}

/** Người nhận gửi lên khi đặt / sửa đơn; null nếu không gửi trường nào. */
function read(body) {
  if (!FIELDS.some((key) => Object.hasOwn(body, key))) return null;
  const name = C.text(body.recipient_name, "recipient_name", 150).trim().replace(/\s+/g, " ");
  return { name, phone: phone(body.recipient_phone) };
}

/** Người nhận trong hồ sơ (dòng bảng customers); null nếu hồ sơ chưa có đủ tên và số điện thoại. */
function fromProfile(customer) {
  return customer?.TenNguoiNhan && customer?.phone ? { name: customer.TenNguoiNhan, phone: customer.phone } : null;
}

/** Có cần ghi người nhận của đơn vào hồ sơ không. */
function shouldSaveProfile(saved, recipient, updateProfile) {
  if (!recipient) return false;
  if (!saved) return true; // lần đặt đầu tiên
  return updateProfile === true && (saved.name !== recipient.name || saved.phone !== recipient.phone);
}

module.exports = { FIELDS, read, phone, fromProfile, shouldSaveProfile };
