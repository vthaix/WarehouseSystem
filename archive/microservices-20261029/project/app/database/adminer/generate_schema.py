"""Generate the standalone Vietnamese Adminer schema from docs/DATABASE.md."""

from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parents[2]
source = (ROOT / "docs/DATABASE.md").read_text(encoding="utf-8")
sql = source.split("```sql", 1)[1].split("```", 1)[0]
sql = sql[sql.index("CREATE TABLE users ("):]

tables = dict(zip(
    "users roles user_roles customers workshops workshop_users suppliers warehouses warehouse_locations categories units items customer_orders customer_order_lines business_plans business_plan_lines purchase_orders purchase_order_lines production_plans production_plan_outputs production_plan_materials lots qc_inspections qc_inspection_lines stock_requests stock_request_lines stock_documents stock_document_lines inventory_balances stocktakes stocktake_warehouses stocktake_assignments stocktake_lines stocktake_minutes exception_proposals exception_allocations inventory_movements tasks task_assignments production_reports production_report_lines finished_reports finished_report_outputs finished_report_materials notifications audit_logs idempotency_records".split(),
    "NguoiDung VaiTro NguoiDungVaiTro KhachHang Xuong NguoiDungXuong NhaCungCap Kho ViTriKho LoaiHang DonViTinh MatHang DonHang ChiTietDonHang KeHoachKinhDoanh ChiTietKeHoachKinhDoanh DonMuaHang ChiTietDonMuaHang KeHoachSanXuat ThanhPhamKeHoach NguyenLieuKeHoach LoHang PhieuKiemTraChatLuong ChiTietKiemTraChatLuong YeuCauKho ChiTietYeuCauKho PhieuKho ChiTietPhieuKho TonKho DotKiemKe KhoKiemKe PhanCongKiemKe ChiTietKiemKe BienBanKiemKe DeXuatXuLy PhanBoXuLy BienDongKho CongViec PhanCongCongViec BaoCaoSanXuat ChiTietBaoCaoSanXuat BaoCaoThanhPham ThanhPhamBaoCao NguyenLieuSuDung ThongBao NhatKyHeThong YeuCauChongLap".split(),
))

columns = dict(zip(
    "id username password_hash full_name email status failed_login_count locked_until session_version version created_at updated_at code name user_id role_id phone address workshop_id is_active tax_code warehouse_id category_id description unit_id kind reference_price is_sample image_path is_published customer_id delivery_address latest_delivery_date note received_by received_at reviewed_by reviewed_at rejection_reason quoted_total customer_order_id item_id quantity unit_price type supplier_id planned_date created_by total_amount business_plan_id business_plan_line_id expected_delivery_date delivery_terms purchase_order_id start_date end_date production_plan_id required_quantity purchase_order_line_id manufactured_date expiry_date received_quantity qc_status inspector_id inspected_at qc_inspection_id lot_id inspected_quantity passed_quantity failed_quantity issue purpose requested_date stock_request_id posted_by posted_at idempotency_key stock_document_id stock_request_line_id location_id quality_bucket difference_reason stocktake_id start_at end_at item_kind stocktake_warehouse_id snapshot_at completed_at system_quantity actual_quantity counted_by counted_at cause resolution_status remarks submitted_at qc_inspection_line_id stocktake_line_id action reason resolution_note applied_at exception_proposal_id quantity_delta stock_document_line_id operation_key title priority task_id production_report_id available_quantity finished_report_id completed_date used_quantity subject body resource_type resource_id read_at business_key actor_id before_data after_data request_id operation request_hash response_status response_body expires_at".split(),
    "MaBanGhi TenDangNhap MatKhauBam HoTen ThuDienTu TrangThai SoLanDangNhapSai KhoaDen PhienBanPhien PhienBan NgayTao NgayCapNhat Ma Ten MaNguoiDung MaVaiTro SoDienTho DiaChi MaXuong ConHoatDong MaSoThue MaKho MaLoaiHang MoTa MaDonViTinh Loai DonGiaThamKhao LaHangMau DuongDanAnh DaCongBo MaKhachHang DiaChiGiaoHang NgayGiaoChamNhat GhiChu MaNguoiTiepNhan NgayTiepNhan MaNguoiDuyet NgayDuyet LyDoTuChoi TongTienBaoGia MaDonHang MaMatHang SoLuong DonGia Kieu MaNhaCungCap NgayDuKien MaNguoiTao TongTien MaKeHoachKinhDoanh MaChiTietKeHoachKinhDoanh NgayGiaoDuKien DieuKhoanGiaoHang MaDonMuaHang NgayBatDau NgayKetThuc MaKeHoachSanXuat SoLuongCan MaChiTietDonMuaHang NgaySanXuat HanSuDung SoLuongNhan TrangThaiKiemTra MaNguoiKiemTra NgayKiemTra MaPhieuKiemTraChatLuong MaLoHang SoLuongKiemTra SoLuongDat SoLuongLoi Loi PhuongThuc NgayYeuCau MaYeuCauKho MaNguoiGhiSo NgayGhiSo KhoaChongLap MaPhieuKho MaChiTietYeuCauKho MaViTriKho NhomChatLuong LyDoChenhLech MaDotKiemKe BatDauLuc KetThucLuc LoaiMatHang MaKhoKiemKe NgayChotSo NgayHoanTat SoLuongHeThong SoLuongThucTe MaNguoiDem NgayDem NguyenNhan TrangThaiXuLy NhanXet NgayGui MaChiTietKiemTraChatLuong MaChiTietKiemKe HanhDong LyDo GhiChuXuLy NgayApDung MaDeXuatXuLy BienDongSoLuong MaChiTietPhieuKho KhoaNghiepVu TieuDe MucDoUuTien MaCongViec MaBaoCaoSanXuat SoLuongHienCo MaBaoCaoThanhPham NgayHoanThanh SoLuongSuDung TieuDeThongBao NoiDung LoaiTaiNguyen MaTaiNguyen NgayDoc KhoaThongBao MaNguoiThucHien DuLieuTruoc DuLieuSau MaYeuCau ThaoTac MaBamYeuCau MaPhanHoi NoiDungPhanHoi HetHanLuc".split(),
))
assert len(columns) == 130 and len(tables) == 47

source_tables = set(re.findall(r"CREATE TABLE (\w+) \(", sql))
source_columns = set()
for block in re.findall(r"CREATE TABLE \w+ \((.*?)\n\) ENGINE=InnoDB;", sql, re.S):
    source_columns.update(re.findall(
        r"^  ([a-z][a-z_0-9]*) (?:BIGINT|VARCHAR|CHAR|INT|SMALLINT|DECIMAL|TEXT|DATE|DATETIME|BOOLEAN|JSON)\b",
        block, re.M,
    ))
assert source_tables == set(tables), source_tables ^ set(tables)
assert source_columns == set(columns), source_columns ^ set(columns)

def translate(match):
    token = match.group(0)
    return tables.get(token, columns.get(token, token))

def translate_constraint(match):
    original = match.group(0)
    prefix, remainder = original.split("_", 1)
    names = {"ck": "KiemTra", "uq": "DuyNhat", "ix": "ChiMuc", "fk": "KhoaNgoai"}
    for old_table in sorted(tables, key=len, reverse=True):
        if remainder == old_table or remainder.startswith(old_table + "_"):
            suffix = remainder[len(old_table):].lstrip("_")
            if prefix == "fk":
                suffix = columns[suffix]
            result = names[prefix] + "_" + tables[old_table]
            return result + ("_" + suffix if suffix else "")
    raise ValueError("Unknown constraint: " + original)

# SQL string values (including enum values) must stay as stored by the application.
parts = re.split(r"('(?:''|[^'])*')", sql)
for index in range(0, len(parts), 2):
    parts[index] = re.sub(r"\b[a-z][a-z_0-9]*\b", translate, parts[index])
sql = "".join(parts)
sql = re.sub(r"\b(?:ck|uq|ix|fk)_[a-z][a-z_0-9]*\b", translate_constraint, sql)
assert all(len(name) <= 64 for name in re.findall(r"(?:CONSTRAINT|INDEX) (\w+)", sql))

# The two operational tables are required by the authentication/session design.
sql += """

CREATE TABLE PhienDangNhap (
  MaPhien VARCHAR(128) NOT NULL PRIMARY KEY,
  HetHanLuc BIGINT UNSIGNED NOT NULL,
  DuLieu JSON NOT NULL,
  INDEX ChiMuc_PhienDangNhap_HetHanLuc (HetHanLuc)
) ENGINE=InnoDB;

CREATE TABLE LanThuDangNhap (
  KhoaLanThu CHAR(64) NOT NULL PRIMARY KEY,
  BatDauCuaSo BIGINT UNSIGNED NOT NULL,
  SoLan INT UNSIGNED NOT NULL,
  CONSTRAINT KiemTra_LanThuDangNhap CHECK (SoLan >= 0),
  INDEX ChiMuc_LanThuDangNhap_BatDauCuaSo (BatDauCuaSo)
) ENGINE=InnoDB;
"""

header = """-- Schema MySQL 8.4 cho database KhoHang duy nhất của ứng dụng.
-- Nguồn: docs/DATABASE.md; tên bảng, cột, ràng buộc tiếng Việt không dấu.
-- Docker tự chạy schema trên database KhoHang trống khi khởi động lần đầu.
-- Không import lại vào database đã có bảng; không có DROP TABLE hay seed.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

"""
(Path(__file__).parent / "KhoHang.sql").write_text(header + sql, encoding="utf-8")

runtime_tables = {
    **tables,
    "quality_campaign_lots": "LoLichKiemTra",
    "quality_campaign_assignments": "PhanCongLichKiemTra",
    "stock_allocations": "PhanCongKho",
    "warehouse_records": "HoSoKho",
    "sessions": "PhienDangNhap",
    "login_attempts": "LanThuDangNhap",
    "schema_migrations": "LichSuCSDL",
}
runtime_columns = {
    **columns,
    "campaign_id": "MaLichKiemTra",
    "campaign_type": "LoaiDot",
    "quality_kind": "LoaiKiemTra",
    "location": "DiaDiem",
    "source_request_id": "MaYeuCauNguon",
    "manager_id": "MaNguoiPhuTrach",
    "task_type": "LoaiCongViec",
    "posted_quantity": "SoLuongDaGhi",
    "allocation_id": "MaPhanCongKho",
    "session_id": "MaPhien",
    "data": "DuLieu",
    "attempt_key": "KhoaLanThu",
    "window_start": "BatDauCuaSo",
    "attempts": "SoLan",
    "checksum": "MaBam",
    "applied_at": "NgayApDung",
}
(Path(__file__).parent / "identifiers.json").write_text(
    json.dumps({"tables": runtime_tables, "columns": runtime_columns}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
