# Khôi phục bản microservice

## Chạy từ bản lưu trong Git

```powershell
cd archive/microservices-20261029/project
docker compose -p warehouse-micro-backup up -d --build --wait
```

Nếu bản mono đang giữ cổng 3000, dừng bản mono bằng `docker compose stop` tại thư mục gốc trước khi chạy, hoặc đặt `APP_PORT=3001` cho bản microservice. Project riêng tạo volume riêng; không tự lấy dữ liệu từ project cũ.

## Khôi phục chính xác bản trước chuyển đổi

Bản ZIP `backups/mono-refactor-20261029/before-refactor.zip` ở gốc dự án chứa các tệp mã và cấu hình gốc, gồm cả cấu hình riêng tư nếu có. `manifest.json` ghi SHA-256 của từng tệp, đã đối chiếu lại sau khi tạo ZIP. Các tài liệu kiến trúc gốc được giữ tại `project/app/docs` trong thư mục lưu này.

Giải nén ZIP vào **một thư mục trống riêng**, chép thư mục tài liệu gốc vào đó nếu cần, rồi chạy Compose từ thư mục vừa khôi phục. Không giải nén đè lên bản mono đang làm việc. Không cần xóa mã mono để chạy bản lưu.

Bản mã và bản dữ liệu khác nhau. Volume MySQL microservice cũ vẫn được giữ, nhưng chưa coi ZIP mã nguồn là bản sao dữ liệu. Muốn phục hồi dữ liệu phải dùng đúng volume hoặc bản xuất SQL của môi trường cũ. Không chạy `down -v` đối với project cũ nếu còn cần dữ liệu.
