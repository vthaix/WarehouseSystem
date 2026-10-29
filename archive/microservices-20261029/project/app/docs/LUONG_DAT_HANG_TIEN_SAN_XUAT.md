# Đặt hàng và tiền sản xuất — cập nhật 22/10/2026

## Luồng sử dụng

UC-31 duyệt từng KHSX và tự cập nhật trạng thái đơn nguồn. Không duyệt trực tiếp đơn hoặc duyệt hàng loạt các kế hoạch cùng đơn. Từ chối giữ KHSX nháp để planner sửa, tăng version và lưu lý do, không từ chối đơn. API dùng `/production-plans/:id/review` với version kế hoạch.

1. Khách hàng đăng nhập UC-01, đặt đơn tại **UC-02**. Một đơn có nhiều mặt hàng, số lượng, ghi chú, địa chỉ và ngày muốn nhận. UC-03/03.1 xem/sửa theo trạng thái cho phép.
2. Planner tiếp nhận tại UC-29; UC-04 chọn đơn để lập KHSX, import các dòng thành phẩm còn cần sản xuất, chọn xưởng và thời gian.
3. Mặc định chọn **Tự tính NVL theo công thức bánh**. Hệ thống nhân định lượng một đơn vị với lượng từng bánh, cộng gộp NVL chung giữa các bánh và cộng dự phòng 10% đúng một lần. Có nút xem định lượng trước khi lưu. Nếu bánh chưa có công thức, báo rõ và cho chọn nhập định lượng gốc thủ công.
4. Giám đốc nhận thông báo kế hoạch chờ duyệt, xem đơn/KHSX và phê duyệt tại UC-31. Trạng thái khách hàng hiển thị **Đã phê duyệt**. Chỉ sau phê duyệt, chủ xưởng mới nhận thông báo và xem được KHSX của mình; không thông báo kế hoạch nháp cho xưởng.
5. Chủ xưởng mở chi tiết KHSX → **Đối chiếu tồn kho NVL**. Bảng gồm NVL, đơn vị, nhu cầu KHSX, tồn khả dụng và phần thiếu. Thao tác này phục vụ UC-22, không tạo đợt kiểm kê/số đếm UC-13/15.
6. Chọn **Lập báo cáo từ đối chiếu** để chuyển sang UC-34, giữ kế hoạch nguồn và điền nhu cầu. Nếu thiếu, mặc định chọn NHU_CAU và gửi planner. Có thể chọn/chụp bảng đối chiếu hoặc dán ảnh clipboard vào ô mô tả; bổ sung ghi chú và tiến độ.
7. Lưu báo cáo tạo bản nháp; mở chi tiết và chọn **Gửi** để gửi chính thức. BGĐ luôn nhận. Khi gửi báo cáo NHU_CAU còn thiếu NVL, hệ thống tự bật gửi planner kể cả client bỏ chọn. Tồn được đối chiếu lại lúc gửi; ảnh thể hiện thời điểm chụp, không thay số liệu nguồn.
8. Planner lập MUA từ phần thiếu thực tế; BGĐ duyệt UC-32. Bộ phận mua hàng nhận thông báo kế hoạch mua đã duyệt, lập đơn UC-27 và quản lý UC-14.

## Báo cáo trong quá trình sản xuất

- TIEN_DO/SU_CO lập được nhiều lần khi KHSX APPROVED/IN_PROGRESS, gồm trường hợp máy hỏng hoặc vừa hoàn thành một đợt nhỏ. Mặc định chỉ gửi BGĐ; không bắt nhập dòng NVL.
- NHU_CAU có dòng NVL thực tế, số thiếu = max(nhu cầu − khả dụng, 0). Giữ quy tắc một nguồn NHU_CAU hiệu lực/KHSX để không nhân đôi nguồn mua; không thay thế hoặc ghi đè báo cáo nguồn đã dùng.
- Tiến độ từ 0% đến dưới 100%. Hoàn thành toàn bộ dùng UC-35; không gửi UC-34 cho KHSX đã COMPLETED.
- Thành phẩm từng phần vẫn nhập tay theo KHSX ở UC-23; các phần cùng KHSX dùng chung đầu lô, mỗi đợt/mặt hàng có dòng lô riêng để QC. Nhiều mặt hàng cùng đơn không bị tách thành nhiều đơn. Lô vật lý phát sinh khi có hàng sản xuất, không tạo tồn/lô đã nhận tại bước đặt đơn.

## Công thức và tính số lượng

File cấu hình: **`app/src/config/production-recipes.json`**, owner nghiệp vụ Business. Định lượng tính cho **một đơn vị bán của mã thành phẩm**, NVL ghi theo đơn vị trong danh mục. Có công thức minh họa cho TP-001 đến TP-004; đây chưa phải công thức được chủ xưởng xác nhận. Khi có định lượng thực tế, chỉnh file này và build lại. Chưa thêm màn hình CRUD công thức.

Ví dụ minh họa: 100 TP-001 cần 12 kg bột; 50 TP-002 cần 4 kg bột. Tổng gốc 16 kg; sau dự phòng là 17,600 kg. Thuật toán dùng số nguyên theo thang decimal, cộng các đóng góp trước khi làm tròn lên 3 chữ số; không tính bằng float. Kho và báo cáo không cộng 10% lần nữa.

NVL tính lúc tạo KHSX được lưu bằng các dòng chi tiết hiện có. Đối chiếu dùng **định lượng đã lưu của KHSX**, không âm thầm thay bằng công thức mới sửa trong config. Mục công thức hiện tại trên bảng đối chiếu chỉ để tham khảo. Các KHSX cũ có định lượng nhập tay tiếp tục dùng định lượng của chúng; thiếu toàn bộ định lượng thì không kết luận “đủ”.

KHSX trả đủ dữ liệu đơn nguồn gồm khách hàng, địa chỉ, ngày nhận, ghi chú, trạng thái và toàn bộ dòng hàng/số lượng/đơn giá. Dòng sản xuất của một KHSX có thể là phần được phân công của đơn; hệ thống vẫn chặn tổng các KHSX vượt đơn.

## Ảnh báo cáo

- Chọn ảnh từ máy hoặc dán ảnh vào ô mô tả; nút **Chụp bảng đối chiếu vào mô tả** tạo PNG của kết quả đối chiếu hiện tại.
- PNG/JPEG/WebP, tối đa 5 MB/ảnh và 6 ảnh/báo cáo. Không nhận SVG hoặc giả loại file.
- File ở `src/images/production-reports/`; Docker lưu trong volume ảnh hiện có, Business đọc và gateway ghi.
- Mô tả lưu văn bản cùng liên kết ảnh dạng Markdown trong cột ghi chú hiện có. Không render HTML người dùng nhập; ảnh được dựng riêng bằng URL có kiểm tra quyền báo cáo.
- Người upload mới được gắn ảnh mới vào báo cáo. Người chỉ biết tên file không đọc được ảnh: phải đi qua endpoint gắn với ID báo cáo và quyền xem báo cáo. Planner không được gửi báo cáo sự cố thì không xem được cả nội dung và ảnh.
- Ảnh upload chưa gắn/lưu báo cáo có thể thành file dư khi hủy form; không tự xóa file đang được chứng từ khác tham chiếu. Backup ảnh riêng ngoài dump MySQL.

## API bổ sung

| API dưới /api/v1 | Quyền | Chức năng |
| --- | --- | --- |
| POST /production-plans/recipe-estimate | PLANNER | outputs → định lượng gốc, công thức tham khảo |
| POST /production-plans | PLANNER | material_source=RECIPE tự tính; MANUAL nhận materials gốc; request cũ có materials giữ cách xử lý nhập tay |
| GET /production-plans/:id/material-comparison | WORKSHOP_OWNER theo xưởng, PLANNER, DIRECTOR | Định lượng kế hoạch và tồn khả dụng tại thời điểm đối chiếu |
| POST /production-report-images | WORKSHOP_OWNER | data_url → image_path để gắn vào note |
| GET /production-reports/:id/images/:file | Người có quyền xem báo cáo, file phải được tham chiếu trong note | Đọc ảnh riêng tư |

Không thêm bảng hoặc migration trong đợt này; dùng ChiTietKeHoachSanXuat và ghi chú báo cáo hiện có. Dữ liệu lịch sử và các bản Domain Model đã khôi phục giữ nguyên.

## Kiểm chứng

- Unit: tính định lượng nhiều loại bánh, cộng gộp/làm tròn, thiếu công thức, NVL ngừng dùng và lượng không hợp lệ.
- MySQL microservice: đơn nhiều hàng → tiếp nhận → tự tính → duyệt → thông báo xưởng → đối chiếu → ảnh/báo cáo → planner; sự cố riêng tư, chống đọc ảnh sai quyền.
- Browser: đối chiếu từ chi tiết KHSX, chuyển form qua navigation, điền người nhận, chụp bảng và dán ảnh, payload báo cáo (ghi được mock); ghi thật kiểm ở MySQL acceptance.
