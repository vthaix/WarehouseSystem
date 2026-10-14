# Logical boundaries — giai đoạn chuyển đổi

Cập nhật: runtime mặc định đã chạy **6 process/container HTTP**, module chuyển vào `src/services/<owner>/modules` và mỗi service có index/Dockerfile riêng. Boundary factories vẫn tạo domain local bên trong owner; runtime monolith chỉ giữ cho tương thích/test legacy. Đọc [services README](../services/README.md) để chạy cấu trúc hiện tại. Các mô tả in-process bên dưới là giai đoạn trước.

Composition đã được monolith MySQL dùng qua `src/shared/runtime.js`. Có tám boundary:

| Boundary            | Entry                      | Nhóm service         |
| ------------------- | -------------------------- | -------------------- |
| Identity            | identity/index.js          | identity-service     |
| Catalog             | catalog/index.js           | business-service     |
| Sales               | sales/index.js             | business-service     |
| Production          | production/index.js        | business-service     |
| Procurement         | procurement/index.js       | business-service     |
| Warehouse & Quality | warehouse-quality/index.js | warehouse-service    |
| Notification        | notification/index.js      | notification-service |
| Reporting           | reporting/index.js         | reporting-service    |

`ownership.js` là hợp đồng owner theo resource. `business-plans` phải có type: SALE thuộc Sales, PURCHASE thuộc Procurement. Hai port dùng chung implementation/local transaction trong business-service. Đây không phải saga hay giao dịch phân tán.

Catalog chỉ đọc các resource của Catalog; Warehouse chỉ đọc danh mục kho/vị trí/lô. Writer cũng được giới hạn resource. Xử lý create/update/remove lô ở `src/services/warehouse-service/modules/warehouse/LotService.js`, Catalog không còn phương thức ghi lô. Runtime legacy dùng adapter; runtime phân tán dùng HTTP clients để chọn owner.

`legacy-adapter.js` giữ interface runtime/URL/EJS cũ, điều phối mutation kế hoạch theo type. Không đặt thêm nghiệp vụ trong adapter. Khi chuyển HTTP, thay adapter/client theo hợp đồng; không sao chép class nghiệp vụ vào gateway.

**Giới hạn hiện tại:** cùng process/pool/CSDL; SQL xuyên boundary và INSERT thông báo vẫn còn trong implementation legacy. ModuleRoutes/SourceImportService còn dùng pool trực tiếp. CatalogWriteService vẫn có logic danh mục nhiều loại nhưng instance bị giới hạn owner. Quyền SQL độc lập, broker, outbox/inbox, remote client, source claims và projections chưa triển khai. Constructors và module cũ vẫn được dùng để chuyển dần, chưa phải microservice deploy độc lập.

Kiểm thử: `node --test tests/unit/boundaries.test.js`; các kịch bản SQL/HTTP phải chạy bộ acceptance DB cô lập. Kiểm thử syntax kiểm cả src/apps/services.
