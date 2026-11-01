# Kết quả thực thi hệ thống

Chỉ chạy trên Docker test cổng 3310, có xác nhận test_instance=true. Không reset CSDL chính.

| Mức kiểm thử | Kết quả |
| --- | --- |
| Các pha kiểm thử | 33/33 đạt |
| Đơn vị | 88 đạt |
| Nghiệp vụ MySQL | 12 nhóm đạt |
| Trình duyệt | 24 nhóm đạt |
| Rà quyền/giao diện | 94 màn hình / 18 tài khoản; 0 lỗi bất thường |
| Mã TC chạy riêng | 123 Pass, 0 Fail, 828 Chưa chạy / 951 |

## Tệp kết quả

[Word đã điền kết quả thực tế](DacTa_TestCase_KetQua_20261101.docx). Giữ 54 bảng đặc tả và 54 bảng testcase đúng thứ tự, đủ 8 cột. Chỉ các mã có kiểm chứng thực tế mới được gán Pass; ca không có bộ thực thi gắn trực tiếp vẫn Chưa chạy. Vì vậy **chưa thể kết luận đã chạy hết 951 ca hoặc toàn bộ các nhánh có thể xảy ra**.

Bằng chứng ở app/artifacts/final-system-test: FINAL_RESULT.json, suite-results.json, documented-results.json, documented-http-evidence.json, log từng nhóm và screenshot. Sự kiện HTTP có thời điểm, mã TC khi thuộc phạm vi ca và request ID; không ghi cookie, CSRF hoặc mật khẩu.

Hai pha cuối của bộ mã TC được kiểm riêng bằng API/MySQL thật và Playwright: quyền 401/403, nguồn mua chưa duyệt, QC mặc định, kiểm kê 55/52/50, biên bản chung, mua bù 55/50, bù 2+3 và chặn thêm 1, dự toán 18.000/20.000, quyền giám đốc, số âm/chữ, TP 40+60, nút còn lại/đợt cuối, khách bán lấy từ đơn và chặn sửa/xóa QC. Các luồng tạo nguồn thực sự chạy trong CSDL test, không giả lập kết quả ghi.

Các bài UI khác trong bộ hệ thống có ca giả lập ghi; log của bài ghi rõ điều này. Không coi ca giả lập là bằng chứng ghi CSDL thật. Bài adapter bộ nhớ cũ e2e/browser.cjs không khớp UI đặt hàng hiện hành và không dùng để chấm hệ thống MySQL. Luồng hiện hành có customer-order và kiểm thử MySQL riêng.

## Sửa thiết kế ca kiểm thử

- Đăng nhập dành cho mọi vai trò, nên ca cũ “sai vai trò thì cấm đăng nhập” được sửa thành tên tài khoản không tồn tại/mật khẩu sai; đã chạy 401 và kiểm phiên vẫn chưa đăng nhập.
- UC-12.3 không còn được diễn đạt là chuyển sang sửa trực tiếp thành công. UI chỉ đọc, sửa/xóa cũ bị 409, giữ lịch sử; đã kiểm cả UI và API.
- Dùng đúng mặt hàng có đơn vị hộp cho dữ liệu TP 100/40/60; không dùng một mặt hàng đơn vị khác để gán Pass cho ca hộp.

## Phạm vi chưa chạy theo mã

828 ca còn thiếu bộ thực thi/fixture và đối chiếu kết quả riêng. Bao gồm nhiều biến thể hiển thị, hủy form, thiếu từng trường, mất mạng đúng thời điểm gửi và những nhánh nghiệp vụ cụ thể. Việc bộ hệ thống đã kiểm một phần các hành vi này không được dùng thay cho bằng chứng trọn vẹn của từng ca. Không gán chúng là Fail của ứng dụng, cũng không tự ghi Pass.

| UC | Tổng TC | Pass | Fail | Chưa chạy |
| --- | --- | --- | --- | --- |
| UC-29 | 16 | 2 | 0 | 14 |
| UC-06 | 13 | 2 | 0 | 11 |
| UC-06.1 | 17 | 2 | 0 | 15 |
| UC-06.2 | 13 | 2 | 0 | 11 |
| UC-06.3 | 17 | 2 | 0 | 15 |
| UC-07 | 13 | 2 | 0 | 11 |
| UC-07.1 | 18 | 2 | 0 | 16 |
| UC-07.2 | 13 | 2 | 0 | 11 |
| UC-07.3 | 17 | 2 | 0 | 15 |
| UC-08 | 21 | 2 | 0 | 19 |
| UC-09 | 24 | 2 | 0 | 22 |
| UC-13 | 23 | 2 | 0 | 21 |
| UC-17 | 16 | 2 | 0 | 14 |
| UC-18 | 12 | 2 | 0 | 10 |
| UC-19 | 13 | 2 | 0 | 11 |
| UC-20 | 13 | 2 | 0 | 11 |
| UC-21 | 12 | 2 | 0 | 10 |
| UC-25 | 16 | 2 | 0 | 14 |
| UC-25.1 | 21 | 2 | 0 | 19 |
| UC-25.2 | 14 | 2 | 0 | 12 |
| UC-31 | 19 | 2 | 0 | 17 |
| UC-14 | 10 | 2 | 0 | 8 |
| UC-23 | 33 | 2 | 0 | 31 |
| UC-24 | 17 | 2 | 0 | 15 |
| UC-24.1 | 21 | 2 | 0 | 19 |
| UC-24.2 | 12 | 2 | 0 | 10 |
| UC-27 | 27 | 3 | 0 | 24 |
| UC-04 | 34 | 8 | 0 | 26 |
| UC-05 | 13 | 2 | 0 | 11 |
| UC-05.1 | 22 | 2 | 0 | 20 |
| UC-05.2 | 13 | 2 | 0 | 11 |
| UC-10 | 19 | 2 | 0 | 17 |
| UC-11 | 16 | 2 | 0 | 14 |
| UC-11.01 | 23 | 2 | 0 | 21 |
| UC-11.02 | 23 | 2 | 0 | 21 |
| UC-35 | 29 | 6 | 0 | 23 |
| UC-01 | 13 | 2 | 0 | 11 |
| UC-12 | 17 | 2 | 0 | 15 |
| UC-12.1 | 22 | 3 | 0 | 19 |
| UC-12.2 | 8 | 3 | 0 | 5 |
| UC-12.3 | 11 | 3 | 0 | 8 |
| UC-34 | 37 | 2 | 0 | 35 |
| UC-15 | 19 | 2 | 0 | 17 |
| UC-28 | 20 | 4 | 0 | 16 |
| UC-32 | 19 | 2 | 0 | 17 |
| UC-02 | 18 | 2 | 0 | 16 |
| UC-03 | 13 | 3 | 0 | 10 |
| UC-03.1 | 20 | 2 | 0 | 18 |
| UC-22 | 13 | 2 | 0 | 11 |
| UC-16 | 18 | 2 | 0 | 16 |
| UC-BS-01 | 15 | 2 | 0 | 13 |
| UC-BS-02 | 14 | 2 | 0 | 12 |
| UC-BS-03 | 9 | 1 | 0 | 8 |
| UC-BS-04 | 12 | 1 | 0 | 11 |

## Chạy lại

Tại thư mục gốc, khởi động project test:

```powershell
docker compose -f app/docker-compose.yml -f app/docker-compose.test.yml -p warehouse-mono-review-20261029 up -d --build --wait
cd app
npm run test:final
```

Cần Node theo package.json, Docker CLI và trình duyệt Playwright/Edge/Chrome cho phần kiểm thử trên máy phát triển. Lệnh chỉ reset dữ liệu project test sau khi kiểm tra cờ môi trường. npm run test:documented chạy nhóm gắn mã TC đầu tiên; chạy đầy đủ dùng test:final để dựng fixture và chạy tiếp nhóm bổ sung.
