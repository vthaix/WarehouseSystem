// =============================================================================
// ĐỊA CHỈ GIAO HÀNG THEO ĐƠN VỊ HÀNH CHÍNH VIỆT NAM (UC-02 đặt hàng, UC-03.1 sửa đơn)
// Từ 01/07/2025 chính quyền địa phương còn 2 cấp: Tỉnh/Thành phố → Phường/Xã.
// Danh mục nằm ở public/data/vn-address-units.json (34 tỉnh/thành, 3.321 phường/xã),
// trình duyệt dùng cùng file này để hiện ô chọn.
// =============================================================================
const C = require("../services/domain/core");
const units = require("../../public/data/vn-address-units.json");

const provinces = new Map(units.provinces.map((p) => [String(p.code), p]));

/**
 * Kiểm tra mã tỉnh, mã phường/xã và phần số nhà, tên đường;
 * trả về địa chỉ đầy đủ "Số nhà tên đường, Phường/Xã, Tỉnh/Thành" cùng các mã đã kiểm tra.
 */
function compose(provinceCode, wardCode, street) {
  const province = provinces.get(String(provinceCode ?? ""));
  C.fail(!province, "VALIDATION_ERROR", "Vui lòng chọn Tỉnh/Thành phố giao hàng.");
  const ward = province.wards.find(([code]) => String(code) === String(wardCode ?? ""));
  C.fail(!ward, "VALIDATION_ERROR", "Vui lòng chọn Phường/Xã thuộc Tỉnh/Thành phố đã chọn.");
  C.fail(typeof street !== "string" || !street.trim(), "VALIDATION_ERROR", "Vui lòng nhập số nhà, tên đường.");
  C.fail(street.trim().length > 300, "VALIDATION_ERROR", "Số nhà, tên đường tối đa 300 ký tự.");
  const cleanStreet = street.trim().replace(/\s+/g, " ");
  return {
    province_code: province.code,
    ward_code: ward[0],
    street: cleanStreet,
    address: `${cleanStreet}, ${ward[1]}, ${province.name}`,
  };
}

module.exports = { compose };
