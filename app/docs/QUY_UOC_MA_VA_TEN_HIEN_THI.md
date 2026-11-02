# Quy ước mã và tên hiển thị

| Chứng từ | Ví dụ |
|---|---|
| Lô NVL tổng của NCC | `LO-NVL-TAM-ANH-001` |
| Dòng NVL trong lô | `NVL-TAM-ANH-BOT-MI-001` |
| Lô thành phẩm tổng của xưởng | `LO-TP-AHTOR-001` |
| Phần thành phẩm | `TP-AHTOR-BANH-QUY-BO-001` |
| Yêu cầu xuất NVL | `YC-XUAT-NVL-AHTOR-001` |
| Công việc xuất kho | `CV-XUAT-AHTOR-001` |
| Phiếu nhập / xuất | `PHIEU-NHAP-AHTOR-001`, `PHIEU-XUAT-AHTOR-001` |
| Kết quả QC NVL | `QC-NVL-TAM-ANH-001` |

- Mã dùng chữ không dấu, tên NCC/xưởng/mặt hàng và số thứ tự. Số thứ tự được cấp trong giao dịch để tránh trùng khi nhiều người cùng thao tác; không dùng ID CSDL hoặc mã ngẫu nhiên làm mã lô hiển thị.
- Các mã lô cũ được đổi bằng migration, giữ nguyên khóa chính và quan hệ giữa bảng. `LichSuDoiMa` lưu mã cũ/mã mới để đối chiếu. Không xóa hay tạo lại tồn kho, phiếu kho và kết quả kiểm tra.
- Không sửa lại các migration đã áp dụng. CSDL cũ chạy thêm các migration 011–013 khi khởi động Compose; CSDL mới chạy lần lượt toàn bộ.
- Đợt thành phẩm mới tự sinh mã khi lưu. Giao diện không yêu cầu chủ xưởng nghĩ mã lô; khi sửa hiển thị mã đã lưu.
- Trong form phân công, đề xuất lô nằm dưới đúng từng NVL. Sơ đồ thu gọn, đánh dấu các ô đề xuất. Mã và tên ô, tên khu, tên người, tên kho, tên NCC được dùng để hiển thị; ID chỉ dùng bên trong liên kết dữ liệu.
- Nhãn `AVAILABLE` hiển thị “Khả dụng”, số lượng dùng dấu phẩy thập phân. Dòng không có thông tin liên quan hiển thị trạng thái thiếu thông tin thay vì một số ID không giải thích.

Kiểm tra: `tests/unit/readable-codes.test.js`; `scripts/readable-codes-smoke.cjs` chỉ chạy trong CSDL test riêng; các smoke QC/điều phối kiểm tra cả sinh mã và bảo toàn nghiệp vụ.
