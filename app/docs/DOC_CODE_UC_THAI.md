# Code các UC của Trần Văn Thái

UC-29, UC-06, UC-07, UC-13, UC-08, UC-09. Đọc từ trên xuống: file được gọi trước nằm trước.

- Code chép nguyên văn từ thư mục `app`; phần comment giải thích được thêm trong file này, file code của Thái để sạch.
- "Trích" là chỉ lấy phần liên quan của file dùng chung với UC khác.
- Comment ở cuối dòng, hoặc ở dòng ngay trên nếu dòng code dài.

## Đường đi chung

```
Người dùng bấm nút
  → public/js/....js               giao diện, gọi api(...)
  → src/shared/ModuleRoutes.js     địa chỉ nào gọi hàm nào, ai được gọi
  → ...Service.js                  điểm vào
  → uc....js                       xử lý của UC
  → MySQL                          lưu / đọc dữ liệu
```

## Hàm hay gặp

| Viết trong code | Nghĩa |
|---|---|
| `await` | Chờ làm xong mới chạy dòng tiếp theo |
| `P.role(user, [...])` | Không đúng vai trò thì báo lỗi |
| `C.fail(điều_kiện, mã, thông_báo)` | Điều kiện đúng thì dừng và báo lỗi |
| `C.fields(body, [...])` | Không nhận trường lạ |
| `C.version(dòng, phiên_bản)` | Người khác vừa sửa thì báo tải lại |
| `C.state(dòng, [...])` | Trạng thái không cho phép thì báo lỗi |
| `C.qty` / `C.decimal` | Đổi số lượng sang số nguyên để tính / đổi ngược lại |
| `FOR UPDATE` | Khóa dòng để hai người không sửa cùng lúc |
| `?` trong câu SQL | Chỗ điền giá trị ở mảng phía sau |
| `?.` và `??` | Không có thì bỏ qua / không có thì dùng giá trị sau |
| `esc()` | Chặn mã độc khi hiện chữ lên trang |

## Thứ tự đọc

**Phần dùng chung**

1. `src/shared/transaction.js` — Chạy nhiều câu SQL thành một khối: cùng lưu hoặc cùng hủy

**UC-29 Tiếp nhận đơn hàng**

2. `public/js/order-receiving.js` — Giao diện: danh sách đơn chờ và hộp xác nhận
3. `src/shared/ModuleRoutes.js` — Trích: địa chỉ tiếp nhận đơn
4. `src/modules/customer-orders/OrderService.js` — Trích: đọc danh sách, chi tiết đơn và gọi sang UC-29
5. `src/modules/customer-orders/uc29-tiep-nhan-don.js` — Xử lý tiếp nhận đơn

**UC-06 Quản lý danh mục kho và UC-07 Quản lý mặt hàng**

6. `public/js/catalog-forms.js` — Giao diện: thẻ danh mục, form danh mục, form mặt hàng
7. `src/shared/ModuleRoutes.js` — Trích: địa chỉ xem / thêm / sửa / xóa
8. `src/modules/catalog/CatalogWriteService.js` — Điểm vào thêm / sửa / xóa, chia việc cho UC-06 và UC-07
9. `src/modules/catalog/uc06-danh-muc.js` — UC-06.1 thêm, UC-06.2 xóa, UC-06.3 sửa danh mục
10. `src/modules/catalog/uc07-mat-hang.js` — UC-07.1 thêm, UC-07.2 xóa, UC-07.3 sửa mặt hàng
11. `src/modules/catalog/catalog-input.js` — Kiểm tra dữ liệu nhập
12. `src/modules/catalog/catalog-store.js` — Ghi vào CSDL
13. `src/modules/catalog/CatalogService.js` — Điểm vào xem danh sách và chi tiết
14. `src/modules/catalog/CatalogRepository.js` — Đọc danh sách và chi tiết từ CSDL

**UC-13 Lập đợt kiểm kê**

15. `public/js/uc13-lap-dot-kiem-ke.js` — Giao diện: form lập đợt
16. `src/shared/ModuleRoutes.js` — Trích: địa chỉ lấy lô và lập đợt
17. `src/modules/tasks/TaskService.js` — Trích: kiểm tra chung, tạo công việc, thông báo
18. `src/modules/tasks/uc13-lap-dot-kiem-ke.js` — Xử lý lập đợt
19. `src/modules/tasks/inspection-scope.js` — Trích: đợt kiểm số lượng hay chất lượng

**UC-08 Quản lý nhập kho và UC-09 Quản lý xuất kho**

20. `src/shared/ModuleRoutes.js` — Trích: các địa chỉ của UC-08/09
21. `src/shared/warehouse-management.js` — Danh sách và chi tiết yêu cầu nhập / xuất
22. `public/js/actor-workspace.js` — Trích: phần "Phiếu đã ghi sổ" và tìm kiếm phiếu
23. `public/js/workflow-forms.js` — Trích: nút Phân công
24. `public/js/uc08-09-phan-cong-kho.js` — Giao diện: form phân công
25. `src/modules/warehouse/WarehouseFlowService.js` — Trích: điểm vào ở máy chủ
26. `src/modules/warehouse/uc08-09-xem-truoc.js` — Dữ liệu để mở form
27. `src/modules/warehouse/uc08-09-phan-cong-kho.js` — Lưu và hủy phân công
28. `src/modules/warehouse/uc08-09-kiem-tra.js` — Các kiểm tra khi phân công
29. `src/shared/warehouse-allocation-plan.js` — So phân công cũ và mới
30. `src/shared/assigned-positions.js` — Vị trí được phân công, dùng cho thông báo

---

# Phần dùng chung

Đọc trước, vì mọi UC đều gọi.

## 1. src/shared/transaction.js

**Chạy nhiều câu SQL thành một khối: cùng lưu hoặc cùng hủy**

```js
// Chạy một nhóm câu SQL trong một giao dịch; work là hàm chứa các câu SQL đó
async function transaction(pool, work) {
  const db = await pool.getConnection(); // Lấy một kết nối tới CSDL
  try {
    await db.beginTransaction(); // Bắt đầu giao dịch
    const result = await work(db); // Chạy các câu SQL được truyền vào
    await db.commit(); // Không lỗi: lưu tất cả
    return result; // Trả kết quả cho nơi gọi
  } catch (error) { // Có lỗi ở bất kỳ câu nào
    await db.rollback(); // Hủy tất cả thay đổi
    throw error; // Báo lỗi tiếp cho nơi gọi
  } finally { // Dù đúng hay lỗi
    db.release(); // Trả kết nối lại để người khác dùng
  }
}

module.exports = transaction; // Cho file khác dùng hàm này
```

---

# UC-29 Tiếp nhận đơn hàng

Thứ tự gọi: `order-receiving.js` → `ModuleRoutes.js` → `OrderService.js` → `uc29-tiep-nhan-don.js` → `transaction.js`

## 2. public/js/order-receiving.js

**Giao diện: danh sách đơn chờ và hộp xác nhận**

```js
(() => { // Bọc cả file trong một hàm để biến không lẫn với file khác
  const WAITING = "SUBMITTED"; // Mã trạng thái "Chờ tiếp nhận"

  const oldLoadTable = loadTable; // Giữ lại hàm tải danh sách cũ của hệ thống
  const oldActionForm = actionForm; // Giữ lại hàm xử lý nút thao tác cũ
  let filterApplied = false; // Đã chọn sẵn bộ lọc hay chưa

  // Đang ở màn đơn hàng và là Bộ phận lập kế hoạch?
  const isReceivingPage = () => current === "customer-orders" && has(["PLANNER"]);
  const statusFilter = () => document.querySelector("#status"); // Lấy ô lọc trạng thái trên trang

  function applyWaitingFilter() { // Bước 1-2: lần đầu mở trang, chọn sẵn bộ lọc "Chờ tiếp nhận"
    // Sai màn, đã chọn rồi hoặc chưa có ô lọc thì thôi
    if (!isReceivingPage() || filterApplied || !statusFilter()) return false;
    filterApplied = true; // Đánh dấu đã chọn
    // Ô lọc đang trống thì chọn "Chờ tiếp nhận"
    if (!statusFilter().value) statusFilter().value = WAITING;
    return true; // Báo là vừa chọn bộ lọc
  }

  function showNoNewOrders() { // Ngoại lệ 2.1: không có đơn nào đang chờ
    // Đúng màn, đang lọc đơn chờ và danh sách rỗng?
    const noNewOrders = isReceivingPage() && statusFilter()?.value === WAITING && cached.length === 0;
    const table = document.querySelector("#table"); // Lấy vùng bảng
    // Hiện dòng thông báo thay cho bảng
    if (noNewOrders && table) table.innerHTML = '<div class="empty">Không có đơn hàng mới cần tiếp nhận.</div>';
  }

  loadTable = async function () { // Thay hàm tải danh sách bằng bản có thêm phần UC-29
    applyWaitingFilter(); // Chọn bộ lọc trước
    await oldLoadTable(); // Gọi hàm cũ để tải danh sách, chờ xong mới đi tiếp
    showNoNewOrders(); // Kiểm tra có cần báo "không có đơn mới"
  };

  window.addEventListener("DOMContentLoaded", () => { // Khi trang nạp xong
    if (applyWaitingFilter()) loadTable(); // Nếu vừa chọn bộ lọc thì tải lại danh sách
  });

  actionForm = async function (record, action) { // Thay hàm xử lý nút thao tác
    // Nút "Tiếp nhận" ở màn đơn hàng thì mở hộp xác nhận
    if (current === "customer-orders" && action === "receive") return openReceiveDialog(record);
    return oldActionForm(record, action); // Nút khác thì dùng hàm cũ
  };

  function openReceiveDialog(order) { // Bước 5: mở hộp xác nhận tiếp nhận
    const code = order.display_code || order.code; // Mã đơn để hiển thị
    // Mở hộp thoại với nội dung tóm tắt đơn
    openModal("Tiếp nhận đơn hàng " + code, receiveDialogHTML(order));

    const form = document.querySelector("#data-form"); // Lấy form trong hộp thoại
    const retryKey = crypto.randomUUID(); // Khóa chống gửi trùng: bấm lại vẫn dùng khóa này
    document.querySelector("#cancel").onclick = () => modal.close(); // Nút Hủy thì đóng hộp
    form.onsubmit = (event) => { // Khi bấm nút Tiếp nhận
      event.preventDefault(); // Không cho trình duyệt tải lại trang
      return sendReceive(order, code, form, retryKey); // Gửi lên máy chủ
    };
  }

  function receiveDialogHTML(order) { // Tạo nội dung HTML của hộp xác nhận
    const summary = [ // Các dòng tóm tắt: nhãn và giá trị
      ["Khách hàng", order.customer_name], // Tên khách
      ["Người nhận", order.recipient_name], // Người nhận hàng
      ["Số điện thoại người nhận", order.recipient_phone], // Số điện thoại người nhận
      // Định dạng ngày kiểu Việt Nam
      ["Hạn giao hàng", format(order.latest_delivery_date, "latest_delivery_date", order)],
      ["Tổng báo giá", format(order.quoted_total, "quoted_total", order)], // Định dạng tiền
    ];
    const summaryHTML = summary // Đổi các dòng thành HTML
      // Mỗi dòng một cặp nhãn - giá trị; esc() chặn mã độc, trống thì hiện dấu —
      .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value ?? "—")}</dd></div>`)
      .join(""); // Nối lại thành một chuỗi

    // Trả về HTML của form: tóm tắt, lời nhắc, nút Hủy và nút Tiếp nhận
    return `
      <form id="data-form">
        <dl class="detail-grid">${summaryHTML}</dl>
        <p class="notice">Sau khi tiếp nhận, đơn chuyển sang "Đã tiếp nhận" để lập kế hoạch sản xuất.
          Ban giám đốc duyệt kế hoạch sản xuất (UC-31), không duyệt trực tiếp đơn hàng.</p>
        <div class="form-actions">
          <button type="button" class="button" id="cancel">Hủy</button>
          <button type="submit" class="button primary">Tiếp nhận đơn hàng</button>
        </div>
      </form>`;
  }

  async function sendReceive(order, code, form, retryKey) { // Bước 6-7: gửi yêu cầu tiếp nhận
    const button = form.querySelector("[type=submit]"); // Lấy nút Tiếp nhận
    button.disabled = true; // Khóa nút để không bấm hai lần
    try {
      // Gọi máy chủ, gửi kèm phiên bản đơn và khóa chống trùng
      await api(`customer-orders/${order.id}/receive`, "POST", { version: order.version }, retryKey);
      modal.close(); // Thành công: đóng hộp
      toast(`Đã tiếp nhận đơn hàng ${code}.`); // Báo thành công
      loadTable(); // Tải lại danh sách
    } catch (error) { // Máy chủ báo lỗi
      document.querySelector("#form-error").innerHTML = errorHTML(error); // Hiện lỗi ngay trên hộp
    } finally { // Dù thành công hay lỗi
      button.disabled = false; // Mở lại nút
    }
  }
})(); // Chạy ngay hàm bọc ở trên
```

## 3. src/shared/ModuleRoutes.js

**Trích: địa chỉ tiếp nhận đơn**

```js
router.post( // Nhận yêu cầu gửi lên
  "/customer-orders/:id/receive", // Địa chỉ; :id là mã đơn
  role(["PLANNER"]), // Chỉ Bộ phận lập kế hoạch
  async (req, res) => // Hàm xử lý yêu cầu
    ok( // Trả kết quả theo mẫu chung
      req, // Yêu cầu của người dùng
      res, // Phản hồi trả về
      await runtime.orders.receive( // Gọi OrderService.receive
        req.user, // Người đăng nhập
        req.params.id, // Mã đơn trên địa chỉ
        req.body, // Dữ liệu gửi lên
        req.request_id, // Mã yêu cầu để ghi nhật ký
      ),
    ),
);
```

## 4. src/modules/customer-orders/OrderService.js

**Trích: đọc danh sách, chi tiết đơn và gọi sang UC-29**

```js
class OrderService { // Dịch vụ đơn hàng
  constructor(pool) { // Nhận kết nối CSDL
    this.pool = pool; // Lưu kết nối
  }

  transaction(work) { // Chạy giao dịch
    return transaction(this.pool, work); // Dùng hàm chung transaction.js
  }

// ... (bỏ qua phần không thuộc UC này) ...

present(user, row) { // Chuẩn hóa một đơn trước khi trả về
  const result = { ...row }; // Sao chép đơn
  // Mã đơn hiển thị
  if (row.order_sequence != null) result.display_code = recordCode.displayCode(row.code, recordCode.code('DH', row.customer_name, Number(row.order_sequence)));
  for (const name of ["id", "customer_id", "received_by", "reviewed_by"]) // Các trường là mã
    if (result[name] != null) result[name] = String(result[name]); // Đổi sang chữ
  result.latest_delivery_date = asDate(result.latest_delivery_date); // Ngày giao dạng năm-tháng-ngày
  // Phần tách riêng của địa chỉ (để form sửa chọn lại đúng tỉnh / phường).
  result.delivery_province_code = row.MaTinhThanhGiao ?? null; // Mã tỉnh / thành
  result.delivery_ward_code = row.MaPhuongXaGiao ?? null; // Mã phường / xã
  result.delivery_street = row.SoNhaTenDuongGiao ?? null; // Số nhà, tên đường
  result.recipient_name = row.TenNguoiNhan ?? null; // Tên người nhận
  result.recipient_phone = row.SoDienThoaiNguoiNhan ?? null; // Số điện thoại người nhận
  delete result.TenNguoiNhan; // Bỏ tên cột gốc khỏi kết quả
  delete result.SoDienThoaiNguoiNhan; // Bỏ tên cột gốc khỏi kết quả
  delete result.MaTinhThanhGiao; // Bỏ tên cột gốc khỏi kết quả
  delete result.MaPhuongXaGiao; // Bỏ tên cột gốc khỏi kết quả
  delete result.SoNhaTenDuongGiao; // Bỏ tên cột gốc khỏi kết quả
  result.actions = []; // Danh sách nút thao tác
  if ( // Khách được sửa đơn khi
    user.roles.includes("CUSTOMER") && // Là khách hàng
    String(result.customer_user_id) === String(user.id) && // Là chủ đơn
    ["SUBMITTED", "RECEIVED"].includes(result.status) // Đơn chưa được duyệt
  )
    result.actions.push("edit"); // Thì hiện nút Sửa
  // Bộ phận kế hoạch và đơn còn chờ
  if (user.roles.includes("PLANNER") && result.status === "SUBMITTED")
    result.actions.push("receive"); // Thì hiện nút Tiếp nhận

  delete result.customer_user_id; // Không trả mã tài khoản khách
  return result; // Trả kết quả
}

// ... (bỏ qua phần không thuộc UC này) ...

async list(user, query = {}) { // UC-29 bước 2: danh sách đơn
  P.role(user, P.read["customer-orders"]); // Phải có quyền xem đơn
  // Chỉ nhận các tham số lọc này
  C.fields(query, ["page", "per_page", "q", "status", "from", "to", "sort"]);
  const pagination = paginate(query); // Tính trang
  const where = [], // Các điều kiện lọc
    params = []; // Giá trị đi kèm
  if (this.customerOnly(user)) { // Khách chỉ xem đơn của mình
    where.push("c.user_id = ?"); // Điều kiện: đơn của tài khoản này
    params.push(user.id); // Thêm giá trị
  }
  if (query.q) { // Tìm theo mã đơn hoặc tên khách
    C.text(query.q, "q", 150); // Từ khóa tối đa 150 ký tự
    where.push("(o.code LIKE ? OR c.name LIKE ?)"); // Thêm điều kiện
    params.push(`%${query.q}%`, `%${query.q}%`); // Thêm giá trị
  }
  if (query.status) { // Lọc theo trạng thái (UC-29 lọc "Chờ tiếp nhận")
    // Trạng thái lạ thì báo lỗi
    C.fail(!statuses.includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
    where.push("o.status = ?"); // Thêm điều kiện trạng thái
    params.push(query.status); // Thêm giá trị
  }
  if (query.from) { // Lọc từ ngày
    C.date(query.from, "from"); // Ngày phải hợp lệ
    where.push("DATE(o.created_at) >= ?"); // Thêm điều kiện
    params.push(query.from); // Thêm giá trị
  }
  if (query.to) { // Lọc đến ngày
    C.date(query.to, "to"); // Ngày phải hợp lệ
    where.push("DATE(o.created_at) <= ?"); // Thêm điều kiện
    params.push(query.to); // Thêm giá trị
  }
  // Khoảng ngày ngược thì báo lỗi
  C.fail(query.from && query.to && query.from > query.to, "VALIDATION_ERROR", "Khoảng ngày không hợp lệ.");
  // Chỉ hỗ trợ xếp mới nhất
  C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
  const filter = where.length ? " WHERE " + where.join(" AND ") : ""; // Nối các điều kiện bằng AND
  const [[count]] = await this.pool.execute( // Đếm tổng số đơn
    // Câu lệnh đọc
    "SELECT COUNT(*) AS total FROM customer_orders o JOIN customers c ON c.id=o.customer_id" + filter,
    params, // Giá trị điền vào các dấu ?
  );
  const [rows] = await this.pool.execute( // Lấy các đơn của trang
    // Câu lệnh đọc
    "SELECT o.*,c.name AS customer_name,c.user_id AS customer_user_id,(SELECT COUNT(*) FROM customer_order_lines l WHERE l.customer_order_id=o.id) AS line_count,(SELECT COUNT(*) FROM customer_orders prior WHERE prior.customer_id=o.customer_id AND prior.id<=o.id) AS order_sequence FROM customer_orders o JOIN customers c ON c.id=o.customer_id" +
      filter + // Thêm điều kiện lọc
      " ORDER BY o.id DESC LIMIT ? OFFSET ?", // Mới nhất trước, giới hạn theo trang
    [...params, String(pagination.per_page), String(pagination.offset)], // Giá trị điền vào các dấu ?
  );
  return {
    data: rows.map((row) => this.present(user, row)), // Chuẩn hóa từng đơn, thêm nút thao tác
    meta: { // Thông tin phân trang
      page: pagination.page, // Trang hiện tại
      per_page: pagination.per_page, // Số dòng mỗi trang
      total: Number(count.total), // Tổng số dòng
      total_pages: Math.ceil(Number(count.total) / pagination.per_page), // Tổng số trang
    },
  };
}

// ... (bỏ qua phần không thuộc UC này) ...

async load(connection, user, id, locked = false) { // Đọc một đơn; locked = true thì khóa
  C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy đơn hàng.", 404); // Mã sai thì báo không tìm thấy
  // Khách chỉ đọc được đơn của mình
  const scoped = this.customerOnly(user) ? " AND c.user_id = ?" : "";
  const [rows] = await connection.execute( // Chạy câu lệnh đọc đơn
    // Câu lệnh đọc
    "SELECT o.*,c.name AS customer_name,c.user_id AS customer_user_id,(SELECT COUNT(*) FROM customer_orders prior WHERE prior.customer_id=o.customer_id AND prior.id<=o.id) AS order_sequence FROM customer_orders o JOIN customers c ON c.id=o.customer_id WHERE o.id = ?" +
      scoped + // Thêm điều kiện của khách
      (locked ? " FOR UPDATE" : ""), // Khóa dòng nếu được yêu cầu
    this.customerOnly(user) ? [id, user.id] : [id], // Giá trị điền vào các dấu ?
  );
  C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy đơn hàng.", 404); // Không có đơn thì báo lỗi
  return rows[0]; // Trả đơn
}

// ... (bỏ qua phần không thuộc UC này) ...

async detail(connection, user, id, locked = false) { // UC-29 bước 4: chi tiết đơn
  const row = await this.load(connection, user, id, locked); // Đọc đơn
  const [lines] = await connection.execute( // Đọc các dòng hàng
    // Câu lệnh đọc
    "SELECT l.*,i.code AS item_code,i.name AS item_name,u.name AS unit_name FROM customer_order_lines l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id WHERE l.customer_order_id=? ORDER BY l.id",
    [id], // Giá trị điền vào các dấu ?
  );
  const result = this.present(user, row); // Chuẩn hóa đơn
  delete result.customer_user_id; // Không trả mã tài khoản khách
  // UC-29 bước 4: chi tiết hàng theo thứ tự mã, tên, đơn vị, số lượng, đơn giá, thành tiền.
  result.lines = lines.map((line) => ({ // Chuẩn hóa từng dòng hàng
    id: String(line.id), // Mã (id)
    customer_order_id: String(line.customer_order_id), // Mã đơn hàng
    item_id: String(line.item_id), // Mã mặt hàng
    item_code: line.item_code, // Mã hàng
    item_name: line.item_name, // Tên mặt hàng
    unit: line.unit_name, // Đơn vị tính
    quantity: line.quantity, // Số lượng
    unit_price: line.unit_price, // Đơn giá
    // Thành tiền = đơn giá × số lượng
    total_amount: C.money(C.price(String(line.unit_price)) * C.qty(String(line.quantity), false) / 1000n),
  }));
  if (!this.customerOnly(user)) { // Nhân viên thì xem thêm kế hoạch sản xuất
    const [plans] = await connection.execute( // Đọc kế hoạch sản xuất của đơn
      "SELECT p.* FROM production_plans p WHERE p.customer_order_id=? ORDER BY p.id", // Câu lệnh đọc
      [id], // Giá trị điền vào các dấu ?
    );
    result.production_plans = plans.map((plan) => ({ // Chuẩn hóa kế hoạch
      ...plan, // Giữ nguyên các thông tin khác
      id: String(plan.id), // Mã (id)
      customer_order_id: String(plan.customer_order_id), // Mã đơn hàng
      workshop_id: String(plan.workshop_id), // Mã xưởng
      start_date: asDate(plan.start_date), // Ngày bắt đầu
      end_date: asDate(plan.end_date), // Ngày kết thúc
    }));
  }
  return result; // Trả kết quả
}

// ... (bỏ qua phần không thuộc UC này) ...

async get(user, id) { // Xem chi tiết đơn
  P.role(user, P.read["customer-orders"]); // Phải có quyền xem đơn
  return this.detail(this.pool, user, id); // Gọi hàm chi tiết
}

// ... (bỏ qua phần không thuộc UC này) ...

async audit(connection, user, orderId, action, before, after, requestId) { // Ghi nhật ký của đơn
  await connection.execute( // Chạy câu lệnh
    // Ai, đơn nào, thao tác gì, trước, sau
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'customer-orders',?,?,?,?,?)",
    // Dữ liệu trước / sau lưu dạng JSON
    [user.id, orderId, action, JSON.stringify(before), JSON.stringify(after), requestId],
  );
}

// ... (bỏ qua phần không thuộc UC này) ...

receive(user, id, body, requestId) { // UC-29 bước 5: tiếp nhận đơn
  return receiveOrder(this, user, id, body, requestId); // Gọi sang uc29-tiep-nhan-don.js
}
```

## 5. src/modules/customer-orders/uc29-tiep-nhan-don.js

**Xử lý tiếp nhận đơn**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung (C.fail, C.version...)
const P = require("../../services/domain/policy"); // Hàm kiểm tra quyền
const transaction = require("../../shared/transaction"); // Hàm chạy giao dịch

// Tiếp nhận đơn: orders là OrderService, user là người đăng nhập
async function receiveOrder(orders, user, orderId, body, requestId) {
  P.role(user, ["PLANNER"]); // Ngoại lệ 5.2: chỉ Bộ phận lập kế hoạch
  checkInput(body); // Kiểm tra dữ liệu gửi lên

  await transaction(orders.pool, async (db) => { // Các bước dưới đây cùng lưu hoặc cùng hủy
    // Đọc đơn và khóa lại (true) để hai người không cùng tiếp nhận
    const order = await orders.load(db, user, orderId, true);
    checkStillWaiting(order); // Ngoại lệ 5.1: đơn phải còn chờ tiếp nhận
    C.version(order, body.version); // Ngoại lệ 5.3: khách vừa sửa đơn thì báo tải lại
    await markReceived(db, user, orderId); // Ghi trạng thái mới
    // Ghi nhật ký: trước là chờ, sau là đã tiếp nhận
    await orders.audit(db, user, orderId, "RECEIVE", { status: "SUBMITTED" }, { status: "RECEIVED" }, requestId);
  });

  return orders.get(user, orderId); // Trả về đơn sau khi tiếp nhận
}

function checkInput(body) { // Kiểm tra dữ liệu gửi lên
  C.fields(body, ["version"]); // Chỉ nhận đúng một trường là version
  // version phải là số nguyên
  C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản đơn hàng.");
}

function checkStillWaiting(order) { // Đơn còn chờ tiếp nhận không?
  const waiting = order.status === "SUBMITTED"; // true nếu trạng thái là SUBMITTED
  C.fail(!waiting, "INVALID_STATE", // Không còn chờ thì dừng và báo lỗi 409
    // Nội dung thông báo cho người dùng
    "Đơn hàng đã được tiếp nhận hoặc không còn được phép tiếp nhận. Vui lòng tải lại danh sách và chọn đơn khác.", 409);
}

async function markReceived(db, user, orderId) { // Đổi trạng thái đơn trong CSDL
  await db.execute( // Chạy câu lệnh SQL, chờ xong
    // Câu lệnh: đặt trạng thái RECEIVED, ghi người nhận, thời điểm, tăng phiên bản thêm 1
    `UPDATE customer_orders
        SET status = 'RECEIVED', received_by = ?, received_at = UTC_TIMESTAMP(6), version = version + 1
      WHERE id = ?`,
    [user.id, orderId], // Giá trị điền vào hai dấu ?
  );
}

module.exports = receiveOrder; // Cho OrderService dùng hàm này
```

---

# UC-06 Quản lý danh mục kho và UC-07 Quản lý mặt hàng

Thứ tự gọi: `catalog-forms.js` → `ModuleRoutes.js` → `CatalogWriteService.js` → `uc06-danh-muc.js` hoặc `uc07-mat-hang.js` → `catalog-input.js` (kiểm tra) → `catalog-store.js` (ghi) → `transaction.js`.

Khi xem: `ModuleRoutes.js` → `CatalogService.js` → `CatalogRepository.js`.

## 6. public/js/catalog-forms.js

**Giao diện: thẻ danh mục, form danh mục, form mặt hàng**

```js
(() => { // Bọc cả file để biến không lẫn với file khác
  const KIND_OPTIONS = [ // Hai nhóm để chọn
    { id: "FINISHED_PRODUCT", name: "Thành phẩm" }, // Nhóm thành phẩm
    { id: "MATERIAL", name: "Nguyên vật liệu / vật tư đóng gói" }, // Nhóm nguyên vật liệu
  ];
  const YES_NO = [{ id: "true", name: "Có" }, { id: "false", name: "Không" }]; // Lựa chọn Có / Không
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"]; // Loại ảnh được nhận
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Dung lượng ảnh tối đa 5 MB

  const params = new URLSearchParams(location.search); // Tham số trên đường dẫn trang
  const pageKind = params.get("kind") || "FINISHED_PRODUCT"; // Nhóm đang xem, mặc định Thành phẩm

  const previous = { createForm, editForm, loadTable }; // Giữ lại các hàm cũ của hệ thống
  // Có phải màn danh mục hoặc mặt hàng không?
  const ownsForm = () => current === "categories" || current === "items";

  createForm = async function () { // Nút "Tạo mới"
    if (current === "categories") return categoryForm(); // Màn danh mục: form danh mục (UC-06.1)
    if (current === "items") return itemForm(); // Màn mặt hàng: form mặt hàng (UC-07.1)
    return previous.createForm(); // Màn khác: dùng form cũ
  };

  editForm = async function (record) { // Nút "Sửa"
    if (!ownsForm()) return previous.editForm(record); // Màn khác: dùng hàm cũ
    try {
      const fresh = (await api(current + "/" + record.id)).data; // Lấy dữ liệu mới nhất từ máy chủ
      // Mở đúng form với dữ liệu đó
      return current === "categories" ? categoryForm(fresh) : itemForm(fresh);
    } catch (error) { // Lỗi thì
      toast(error.message); // Hiện thông báo
    }
  };

  function categoryForm(record = {}) { // Form danh mục: không có record là thêm, có là sửa
    const isEdit = Boolean(record.id); // Đang sửa hay thêm?
    const image = imagePicker("Ảnh danh mục", record.image_path); // Chuẩn bị ô chọn ảnh
    openModal(isEdit ? "Sửa danh mục" : "Thêm danh mục", formWrap( // Mở hộp thoại với các ô nhập
      inputField("name", "text", true, [], record.name || "") + // Ô tên
      // Ô nhóm
      inputField("catalog_kind", "select", true, KIND_OPTIONS, record.catalog_kind || pageKind) +
      inputField("description", "textarea", false, [], record.description || "") + // Ô mô tả
      // Ô đang hoạt động
      inputField("is_active", "select", true, YES_NO, String(record.is_active ?? true)) +
      image.html, // Ô ảnh
    ));
    image.mount(); // Gắn sự kiện cho ô ảnh
    bindForm(async (data) => ({ // Khi bấm Lưu: dữ liệu gửi đi
      ...(isEdit ? { version: record.version } : {}), // Sửa thì gửi kèm phiên bản để chống ghi đè
      name: data.name, // Tên
      catalog_kind: data.catalog_kind, // Nhóm danh mục
      description: data.description || null, // Trống thì gửi null
      is_active: data.is_active === "true", // Đổi "true"/"false" thành đúng / sai
      image_path: await image.path(), // Tải ảnh lên trước rồi lấy đường dẫn
    // Sửa thì PATCH, thêm thì POST
    }), isEdit ? "categories/" + record.id : "categories", isEdit ? "PATCH" : "POST");
  }

  async function itemForm(record = {}) { // Form mặt hàng
    const isEdit = Boolean(record.id); // Đang sửa hay thêm?
    const categories = await options("categories"); // Lấy danh sách danh mục, chờ xong mới đi tiếp
    const units = await options("units"); // Lấy danh sách đơn vị tính
    const items = await options("items"); // Lấy danh sách mặt hàng (để gợi ý đơn vị)
    const kind = record.kind || pageKind; // Loại mặt hàng hiện tại
    const image = imagePicker("Ảnh mặt hàng", record.image_path); // Chuẩn bị ô chọn ảnh

    // Mở hộp thoại
    openModal(isEdit ? "Sửa mặt hàng" : "Thêm mặt hàng", formWrap(itemFormHTML(record, kind, units, image)));
    image.mount(); // Gắn sự kiện cho ô ảnh

    const form = document.querySelector("#data-form"); // Lấy form
    const kindSelect = form.querySelector("#f-kind"); // Ô chọn loại (chỉ có khi thêm)
    const categorySelect = form.querySelector("#f-category_id"); // Ô chọn danh mục
    const currentKind = () => (kindSelect ? kindSelect.value : kind); // Loại đang chọn trên form

    const refresh = () => { // Hàm cập nhật form theo loại đang chọn
      // Nạp danh mục cùng nhóm
      fillCategories(categorySelect, categories, currentKind(), record.category_id);
      showKindFields(currentKind()); // Ẩn / hiện ô theo loại
      // Thêm mới thì gợi ý đơn vị tính
      if (!isEdit) suggestUnit(form, categorySelect.value, currentKind(), units, items);
    };
    refresh(); // Cập nhật lần đầu
    kindSelect?.addEventListener("change", refresh); // Đổi loại thì cập nhật lại
    categorySelect.addEventListener("change", () => { // Khi đổi danh mục
      // Thêm mới thì gợi ý lại đơn vị
      if (!isEdit) suggestUnit(form, categorySelect.value, currentKind(), units, items);
    });

    const path = isEdit ? "items/" + record.id : "items"; // Địa chỉ gửi
    const method = isEdit ? "PATCH" : "POST"; // Cách gửi: sửa PATCH, thêm POST
    bindForm(async (data) => { // Khi bấm Lưu
      // Đọc dữ liệu trên form, tải ảnh lên
      const body = readItemForm(data, currentKind(), await image.path());
      // Sửa gửi kèm phiên bản; thêm gửi kèm loại
      return isEdit ? { version: record.version, ...body } : { kind: data.kind, ...body, is_active: true };
    }, path, method); // Gửi tới địa chỉ ở trên
  }

  function itemFormHTML(record, kind, units, image) { // Tạo các ô nhập của form mặt hàng
    const isEdit = Boolean(record.id); // Đang sửa hay thêm?
    const kindField = isEdit // Ô loại mặt hàng
      // Khi sửa: chỉ xem, không đổi được
      ? readOnlyField("Loại mặt hàng", KIND_OPTIONS.find((k) => k.id === kind)?.name)
      : inputField("kind", "select", true, KIND_OPTIONS, kind); // Khi thêm: chọn được
    const note = isEdit // Lời nhắc
      // Khi sửa: nhắc điều kiện đổi danh mục, đơn vị
      ? '<p class="span2 hint">Mặt hàng đã có lô, đơn hàng hoặc kế hoạch thì không đổi được danh mục và đơn vị tính.</p>'
      : ""; // Khi thêm: không có
    return ( // Ghép các ô lại
      inputField("name", "text", true, [], record.name || "") + // Tên
      kindField + // Loại
      inputField("category_id", "select", true, [], "") + // Danh mục (nạp sau)
      inputField("unit_id", "select", true, units, record.unit_id || "") + // Đơn vị tính
      inputField("reference_price", "number", true, [], record.reference_price ?? "") + // Giá tham khảo
      // Tiêu chuẩn nhập (nguyên vật liệu)
      inputField("material_quality_standard", "textarea", false, [], record.material_quality_standard || "") +
      // Hạn sử dụng (thành phẩm)
      inputField("default_shelf_life_days", "number", false, [], record.default_shelf_life_days ?? "") +
      inputField("is_sample", "select", true, YES_NO, String(Boolean(record.is_sample))) + // Hàng mẫu
      // Đã công bố
      inputField("is_published", "select", true, YES_NO, String(Boolean(record.is_published))) +
      inputField("description", "textarea", false, [], record.description || "") + // Mô tả
      image.html + // Ảnh
      note // Lời nhắc
    );
  }

  function readItemForm(data, kind, imagePath) { // Đọc dữ liệu trên form để gửi đi
    const isMaterial = kind === "MATERIAL"; // Là nguyên vật liệu?
    return {
      name: data.name, // Tên
      category_id: data.category_id, // Danh mục
      unit_id: data.unit_id, // Đơn vị tính
      reference_price: data.reference_price, // Giá tham khảo
      description: data.description || null, // Trống thì gửi null
      image_path: imagePath, // Đường dẫn ảnh
      // Thành phẩm thì không gửi tiêu chuẩn nhập
      material_quality_standard: isMaterial ? data.material_quality_standard || null : null,
      // Nguyên vật liệu thì không gửi hạn sử dụng
      default_shelf_life_days: !isMaterial && data.default_shelf_life_days ? Number(data.default_shelf_life_days) : null,
      is_sample: !isMaterial && data.is_sample === "true", // Nguyên vật liệu không phải hàng mẫu
      is_published: !isMaterial && data.is_published === "true", // Nguyên vật liệu không công bố
    };
  }

  function fillCategories(categorySelect, categories, kind, savedCategoryId) { // Nạp danh mục vào ô chọn
    // Danh mục nên chọn: đang chọn, đã lưu hoặc trên đường dẫn
    const selected = categorySelect.value || savedCategoryId || params.get("category_id");
    // Chỉ lấy danh mục cùng nhóm
    const sameGroup = categories.filter((c) => !c.catalog_kind || c.catalog_kind === kind);
    // Tạo các lựa chọn
    categorySelect.innerHTML = sameGroup.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    // Chọn lại nếu còn trong danh sách
    if (sameGroup.some((c) => c.id === selected)) categorySelect.value = selected;
  }

  function showKindFields(kind) { // Ẩn / hiện ô theo loại mặt hàng
    const isMaterial = kind === "MATERIAL"; // Là nguyên vật liệu?
    toggleField("material_quality_standard", isMaterial); // Tiêu chuẩn nhập chỉ hiện với nguyên vật liệu
    // Ba ô này chỉ hiện với thành phẩm
    for (const name of ["default_shelf_life_days", "is_sample", "is_published"]) toggleField(name, !isMaterial);
  }

  function suggestUnit(form, categoryId, kind, units, items) { // Gợi ý đơn vị tính khi thêm mới
    const counts = {}; // Đếm: đơn vị nào được bao nhiêu mặt hàng dùng
    for (const item of items.filter((i) => i.category_id === categoryId)) // Duyệt mặt hàng cùng danh mục
      counts[item.unit_id] = (counts[item.unit_id] || 0) + 1; // Cộng thêm 1
    // Đơn vị dùng nhiều nhất
    const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    // Chưa có mặt hàng: nguyên vật liệu gợi ý kg, thành phẩm gợi ý cái
    const fallback = units.find((u) => u.code === (kind === "MATERIAL" ? "KG" : "CAI"))?.id;
    const unitId = mostUsed || fallback; // Chọn một trong hai
    if (unitId) form.querySelector("#f-unit_id").value = unitId; // Điền vào ô đơn vị
  }

  function imagePicker(label, currentPath) { // Ô chọn ảnh dùng chung cho danh mục và mặt hàng
    let keptPath = currentPath || null; // Ảnh đang có
    let uploaded = null; // Ảnh vừa tải lên
    return { // Trả về ba thứ: HTML, cách gắn sự kiện, cách lấy đường dẫn ảnh
      // HTML: ô chọn file, ảnh xem trước, nút Bỏ ảnh, lời nhắc
      html: `<div class="field span2 item-photo-editor"><label for="image-file">${esc(label)}</label>
        <input id="image-file" type="file" accept="${IMAGE_TYPES.join(",")}">
        <div class="item-photo-preview" id="image-preview">${keptPath ? `<img src="${esc(keptPath)}" alt="${esc(label)}">` : ""}</div>
        <button type="button" class="button small" id="image-remove">Bỏ ảnh</button>
        <span class="hint">PNG, JPEG hoặc WebP, tối đa 5 MB. Ảnh không bắt buộc.</span></div>`,
      mount() { // Gắn sự kiện
        const input = document.querySelector("#image-file"); // Ô chọn file
        const preview = document.querySelector("#image-preview"); // Vùng xem trước
        input.onchange = () => { // Khi chọn file
          const file = input.files[0]; // File được chọn
          if (!file) return; // Không chọn thì thôi
          // Sai loại hoặc quá 5 MB
          if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
            input.value = ""; // Xóa lựa chọn
            // Báo không nhận ảnh
            toast("Ảnh không được chấp nhận. Chọn PNG, JPEG hoặc WebP tối đa 5 MB.");
            return; // Dừng
          }
          // Hiện ảnh xem trước
          preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Ảnh đang chọn">`;
        };
        document.querySelector("#image-remove").onclick = () => { // Khi bấm Bỏ ảnh
          input.value = ""; // Xóa file đang chọn
          keptPath = null; // Không giữ ảnh cũ nữa
          preview.replaceChildren(); // Xóa ảnh xem trước
        };
      },
      async path() { // Lấy đường dẫn ảnh để gửi kèm form
        const file = document.querySelector("#image-file").files[0]; // File đang chọn
        if (!file) return keptPath; // Không chọn ảnh mới thì giữ ảnh cũ
        if (uploaded?.file !== file) { // File này chưa tải lên?
          // Tải ảnh lên máy chủ
          const result = await api("category-images", "POST", { data_url: await readAsDataUrl(file) });
          uploaded = { file, path: result.data.image_path }; // Nhớ lại để không tải hai lần
        }
        return uploaded.path; // Trả đường dẫn ảnh
      },
    };
  }

  function readAsDataUrl(file) { // Đọc file ảnh thành chữ để gửi đi
    return new Promise((resolve, reject) => { // Trình duyệt đọc file xong mới trả kết quả
      const reader = new FileReader(); // Bộ đọc file
      reader.onload = () => resolve(reader.result); // Đọc xong: trả nội dung
      reader.onerror = () => reject(Error("Không đọc được ảnh.")); // Lỗi: báo không đọc được
      reader.readAsDataURL(file); // Bắt đầu đọc
    });
  }

  function readOnlyField(label, value) { // Tạo ô chỉ xem
    // Ô nhập bị khóa
    return `<div class="field"><label>${esc(label)}</label><input value="${esc(value || "")}" disabled></div>`;
  }

  function toggleField(name, visible) { // Ẩn / hiện một ô
    const input = document.querySelector("#f-" + name); // Tìm ô theo tên
    if (!input) return; // Không có thì thôi
    input.closest(".field").hidden = !visible; // Ẩn cả nhãn lẫn ô
    input.disabled = !visible; // Ô ẩn thì không gửi dữ liệu
  }

  function showCategoryCards() { // UC-06: hiện danh mục dạng thẻ
    if (current !== "categories") return; // Không phải màn danh mục thì thôi
    const table = document.querySelector("#table"); // Vùng danh sách
    if (!table) return; // Không có thì thôi
    const title = document.querySelector(".heading h1"); // Tiêu đề trang
    // Đổi tiêu đề theo nhóm đang xem
    if (title) title.textContent = "Danh mục " + (pageKind === "MATERIAL" ? "nguyên vật liệu" : "thành phẩm");
    const pagination = table.querySelector(".pagination"); // Giữ lại phần phân trang
    if (!cached.length) { // Không có danh mục nào
      // Ngoại lệ 2.1: báo không tìm thấy
      table.innerHTML = '<div class="empty">Không tìm thấy danh mục nào. Chọn Tạo mới để thêm.</div>';
      return; // Dừng
    }
    // Vẽ từng thẻ danh mục
    table.innerHTML = '<div class="catalog-category-grid">' + cached.map(categoryCard).join("") + "</div>";
    if (pagination) table.append(pagination); // Gắn lại phần phân trang
    table.querySelectorAll("[data-category-edit]").forEach((button) => { // Các nút Sửa
      // Bấm thì mở form sửa danh mục đó
      button.onclick = () => editForm(cached.find((r) => r.id === button.dataset.categoryEdit));
    });
    table.querySelectorAll("[data-category-delete]").forEach((button) => { // Các nút Xóa
      // Bấm thì mở hộp xác nhận xóa
      button.onclick = () => actionForm(cached.find((r) => r.id === button.dataset.categoryDelete), "delete");
    });
  }

  function categoryCard(category) { // Tạo HTML của một thẻ
    // Đường dẫn xem mặt hàng của danh mục
    const itemsUrl = "/catalog/data?module=items&kind=" + encodeURIComponent(category.catalog_kind || pageKind) +
      "&category_id=" + encodeURIComponent(category.id); // Kèm mã danh mục
    const picture = category.image_path // Ảnh của thẻ
      ? `<img src="${esc(category.image_path)}" alt="${esc(category.name)}">` // Có ảnh thì hiện ảnh
      // Không có thì hiện biểu tượng
      : '<span class="catalog-category-icon" aria-hidden="true">▦</span>';
    // HTML: ảnh, tên, mô tả, liên kết Xem mặt hàng, nút Sửa và Xóa
    return `<article class="catalog-category-card">
      <a href="${esc(itemsUrl)}">${picture}<h2>${esc(category.name)}</h2>
        <p>${esc(category.description || "Xem các mặt hàng trong danh mục")}</p><span>Xem mặt hàng →</span></a>
      <div class="inline-actions">
        <button class="button small" data-category-edit="${esc(category.id)}">Sửa danh mục</button>
        <button class="button small danger" data-category-delete="${esc(category.id)}">Xóa</button>
      </div></article>`;
  }

  loadTable = async function () { // Thay hàm tải danh sách
    await previous.loadTable(); // Tải danh sách như cũ
    showCategoryCards(); // Rồi đổi sang dạng thẻ
  };

  window.addEventListener("DOMContentLoaded", () => { // Khi trang nạp xong
    const content = document.querySelector("#content"); // Vùng nội dung
    if (!content) return; // Không có thì thôi
    const toCards = () => { // Hàm đổi bảng thành thẻ
      // Đang ở màn danh mục và còn dạng bảng thì đổi
      if (current === "categories" && document.querySelector("#table > .table-wrap, #table > table")) showCategoryCards();
    };
    toCards(); // Đổi ngay lần đầu
    // Theo dõi: bảng vẽ lại thì đổi tiếp
    new MutationObserver(toCards).observe(content, { childList: true, subtree: true });
  });
})(); // Chạy ngay hàm bọc
```

## 7. src/shared/ModuleRoutes.js

**Trích: địa chỉ xem / thêm / sửa / xóa**

```js
if (runtime.catalog.supports(resource)) { // Với từng loại: categories, items, warehouses...
  router.get("/" + resource, catalog.list(resource)); // Xem danh sách
  router.get("/" + resource + "/:id", catalog.show(resource)); // Xem chi tiết
  if (resource !== "lots") { // Lô có cách thêm riêng
    router.post( // THÊM
      "/" + resource, // Địa chỉ theo loại dữ liệu
      role(P.create[resource]), // Phải có quyền thêm
      async (req, res) => { // Hàm xử lý yêu cầu
        const result = await runtime.catalogWrite.create( // Gọi CatalogWriteService.create
          req.user, // Người đăng nhập
          resource, // Loại dữ liệu
          req.body, // Dữ liệu gửi lên
          req.request_id, // Mã yêu cầu để ghi nhật ký
        );
        res.set("Location", `/api/v1/${resource}/${result.id}`); // Cho biết địa chỉ của dòng mới
        ok(req, res, result, 201); // Trả kết quả, mã 201 là đã tạo
      },
    );
    router.patch( // SỬA
      "/" + resource + "/:id", // Địa chỉ kèm mã dòng
      role(P.editable[resource]), // Phải có quyền sửa
      async (req, res) => // Hàm xử lý yêu cầu
        ok( // Trả kết quả theo mẫu chung
          req, // Yêu cầu của người dùng
          res, // Phản hồi trả về
          await runtime.catalogWrite.update( // Gọi CatalogWriteService.update
            req.user, // Người đăng nhập
            resource, // Loại dữ liệu
            req.params.id, // Mã trên địa chỉ
            req.body, // Dữ liệu gửi lên
            req.request_id, // Mã yêu cầu để ghi nhật ký
          ),
        ),
    );
    router.delete( // XÓA
      "/" + resource + "/:id", // Địa chỉ kèm mã dòng
      role(P.editable[resource]), // Phải có quyền sửa
      async (req, res) => // Hàm xử lý yêu cầu
        ok( // Trả kết quả theo mẫu chung
          req, // Yêu cầu của người dùng
          res, // Phản hồi trả về
          await runtime.catalogWrite.remove( // Gọi CatalogWriteService.remove
            req.user, // Người đăng nhập
            resource, // Loại dữ liệu
            req.params.id, // Mã trên địa chỉ
            req.body, // Dữ liệu gửi lên
            req.request_id, // Mã yêu cầu để ghi nhật ký
          ),
        ),
    );
```

## 8. src/modules/catalog/CatalogWriteService.js

**Điểm vào thêm / sửa / xóa, chia việc cho UC-06 và UC-07**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const P = require("../../services/domain/policy"); // Hàm kiểm tra quyền
// Cấu hình từng loại dữ liệu và hàm kiểm tra dữ liệu nhập
const { RESOURCES, hasVersion, isId, readInput } = require("./catalog-input");
const store = require("./catalog-store"); // Các hàm ghi CSDL
const { addCategory, editCategory, deleteCategory } = require("./uc06-danh-muc"); // Xử lý UC-06
const { addItem, editItem, deleteItem } = require("./uc07-mat-hang"); // Xử lý UC-07

// Điểm vào chung cho thêm / sửa / xóa danh mục, mặt hàng, kho, vị trí, nhà cung cấp
class CatalogWriteService {
  // Nhận kết nối CSDL, hàm đọc dữ liệu, danh sách loại được phép
  constructor(pool, repository, resources = Object.keys(RESOURCES)) {
    this.pool = pool; // Lưu kết nối CSDL
    this.repository = repository; // Lưu hàm đọc dữ liệu
    this.resources = new Set(resources); // Lưu danh sách loại được phép
  }

  async create(user, resource, body, requestId) { // THÊM
    this.checkAllowed(user, resource); // Đúng quyền và đúng loại dữ liệu?
    let id; // Mã (id) của dòng sắp tạo
    // Danh mục: giao cho UC-06.1
    if (resource === "categories") id = await addCategory(this.pool, user, body, requestId);
    // Mặt hàng: giao cho UC-07.1
    else if (resource === "items") id = await addItem(this.pool, user, body, requestId);
    // Kho, vị trí, nhà cung cấp: hàm chung ở dưới
    else id = await addOther(this.pool, user, resource, body, requestId);
    return this.repository.get(resource, id); // Đọc lại dòng vừa tạo và trả về
  }

  async update(user, resource, id, body, requestId) { // SỬA
    this.checkAllowed(user, resource); // Đúng quyền và đúng loại dữ liệu?
    checkId(id); // Mã phải hợp lệ
    // Danh mục: UC-06.3
    if (resource === "categories") await editCategory(this.pool, user, id, body, requestId);
    // Mặt hàng: UC-07.3
    else if (resource === "items") await editItem(this.pool, user, id, body, requestId);
    else await editOther(this.pool, user, resource, id, body, requestId); // Loại khác: hàm chung
    return this.repository.get(resource, id); // Đọc lại dòng vừa sửa và trả về
  }

  async remove(user, resource, id, body, requestId) { // XÓA
    this.checkAllowed(user, resource); // Đúng quyền và đúng loại dữ liệu?
    checkId(id); // Mã phải hợp lệ
    const input = body || {}; // Không gửi gì thì coi như rỗng
    // Loại có phiên bản thì chỉ nhận trường version; loại khác không nhận trường nào
    C.fields(input, hasVersion(resource) ? ["version"] : []);
    // Danh mục: UC-06.2
    if (resource === "categories") await deleteCategory(this.pool, user, id, input, requestId);
    // Mặt hàng: UC-07.2
    else if (resource === "items") await deleteItem(this.pool, user, id, input, requestId);
    else await deleteOther(this.pool, user, resource, id, requestId); // Loại khác: hàm chung
    return { id: String(id), deleted: true }; // Báo đã xóa
  }

  checkAllowed(user, resource) { // Kiểm tra quyền và loại dữ liệu
    P.role(user, ["WAREHOUSE_MANAGER"]); // Chỉ Quản lý kho
    // Loại dữ liệu lạ thì báo chưa hỗ trợ
    C.fail(!RESOURCES[resource] || !this.resources.has(resource), "NOT_IMPLEMENTED", "Chức năng chưa được triển khai.", 501);
  }
}

function checkId(id) { // Mã phải là số nguyên dương
  C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404); // Sai thì báo không tìm thấy
}

async function addOther(pool, user, resource, body, requestId) { // Thêm kho / vị trí / nhà cung cấp
  const values = readInput(resource, body, "create"); // Kiểm tra dữ liệu nhập
  values.is_active ??= 1; // Không gửi thì mặc định đang hoạt động
  return store.transaction(pool, async (db) => { // Chạy trong giao dịch
    // Vị trí kho thì kho phải tồn tại
    if (resource === "warehouse-locations") await checkWarehouse(db, values.warehouse_id);
    const id = await store.insertRow(db, resource, values); // Thêm dòng vào bảng
    await store.audit(db, user, resource, id, "CREATE", null, values, requestId); // Ghi nhật ký
    return id; // Trả mã vừa tạo
  });
}

async function editOther(pool, user, resource, id, body, requestId) { // Sửa kho / vị trí / nhà cung cấp
  const changes = readInput(resource, body, "edit"); // Kiểm tra dữ liệu nhập
  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, resource, id); // Đọc và khóa dòng cần sửa
    await store.updateRow(db, resource, id, changes); // Ghi thay đổi
    await store.audit(db, user, resource, id, "UPDATE", current, changes, requestId); // Ghi nhật ký
  });
}

async function deleteOther(pool, user, resource, id, requestId) { // Xóa kho / vị trí / nhà cung cấp
  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, resource, id); // Đọc và khóa dòng cần xóa
    await store.deleteRow(db, resource, id); // Xóa; đang được dùng thì CSDL chặn và báo lỗi
    await store.audit(db, user, resource, id, "DELETE", current, null, requestId); // Ghi nhật ký
  });
}

async function checkWarehouse(db, warehouseId) { // Kho được chọn có tồn tại không?
  // Tìm kho còn hoạt động
  const [[warehouse]] = await db.execute("SELECT id FROM warehouses WHERE id=? AND is_active=1", [warehouseId]);
  // Không có thì báo lỗi
  C.fail(!warehouse, "VALIDATION_ERROR", "Kho không tồn tại hoặc đã ngừng hoạt động.");
}

module.exports = CatalogWriteService; // Cho file khác dùng lớp này
```

## 9. src/modules/catalog/uc06-danh-muc.js

**UC-06.1 thêm, UC-06.2 xóa, UC-06.3 sửa danh mục**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const { readInput } = require("./catalog-input"); // Hàm kiểm tra dữ liệu nhập
const store = require("./catalog-store"); // Các hàm ghi CSDL

async function addCategory(pool, user, body, requestId) { // UC-06.1 THÊM DANH MỤC
  // Kiểm tra dữ liệu: bỏ trống, sai định dạng thì báo lỗi
  const category = readInput("categories", body, "create");
  category.is_active ??= 1; // Không chọn thì mặc định đang hoạt động (1)

  return store.transaction(pool, async (db) => { // Các bước dưới cùng lưu hoặc cùng hủy
    await store.checkNameFree(db, "categories", category.name); // Tên không được trùng danh mục khác
    // Không nhập mã thì tự sinh DM-001, DM-002...
    category.code ||= await store.nextCode(db, "categories", "DM");
    const id = await store.insertRow(db, "categories", category); // Thêm dòng vào bảng danh mục
    // Ghi nhật ký thêm mới
    await store.audit(db, user, "categories", id, "CREATE", null, category, requestId);
    return id; // Trả mã vừa tạo
  });
}

async function editCategory(pool, user, id, body, requestId) { // UC-06.3 SỬA DANH MỤC
  const changes = readInput("categories", body, "edit"); // Kiểm tra các trường muốn sửa

  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, "categories", id); // Đọc và khóa danh mục cần sửa
    C.version(current, body.version); // Người khác vừa sửa thì báo tải lại
    await checkGroupChange(db, id, changes.LoaiDanhMuc); // Có được đổi nhóm không?
    await store.checkNameFree(db, "categories", changes.name, id); // Tên mới không được trùng
    await store.updateRow(db, "categories", id, changes); // Ghi thay đổi, tăng phiên bản
    // Ghi nhật ký: trước và sau khi sửa
    await store.audit(db, user, "categories", id, "UPDATE", current, changes, requestId);
  });
}

async function deleteCategory(pool, user, id, body, requestId) { // UC-06.2 XÓA DANH MỤC
  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, "categories", id); // Đọc và khóa danh mục cần xóa
    C.version(current, body.version); // Người khác vừa sửa thì báo tải lại
    await checkNotUsed(db, id); // Đang được sử dụng thì không cho xóa
    await store.deleteRow(db, "categories", id); // Xóa dòng
    await store.audit(db, user, "categories", id, "DELETE", current, null, requestId); // Ghi nhật ký xóa
  });
}

// Kiểm tra khi đổi nhóm nguyên vật liệu / thành phẩm
async function checkGroupChange(db, categoryId, newGroup) {
  if (!newGroup) return; // Không đổi nhóm thì bỏ qua
  // Đếm mặt hàng trong danh mục thuộc nhóm khác
  const [[other]] = await db.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=? AND kind<>?", [categoryId, newGroup]);
  // Còn mặt hàng nhóm khác thì báo lỗi
  C.fail(Number(other.total) > 0, "IN_USE", "Không đổi được nhóm: danh mục đang chứa mặt hàng thuộc nhóm khác.", 409);
}

async function checkNotUsed(db, categoryId) { // Danh mục còn được sử dụng không?
  // Đếm mặt hàng thuộc danh mục
  const [[items]] = await db.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=?", [categoryId]);
  // Đếm khu trong kho đang gắn danh mục
  const [[zones]] = await db.execute("SELECT COUNT(*) AS total FROM warehouse_locations WHERE zone_category_id=?", [categoryId]);
  // Còn mặt hàng thì không cho xóa
  C.fail(Number(items.total) > 0, "IN_USE", `Không thể xóa vì danh mục đang được sử dụng (${items.total} mặt hàng).`, 409);
  // Còn gắn khu kho thì không cho xóa
  C.fail(Number(zones.total) > 0, "IN_USE", "Không thể xóa vì danh mục đang được gắn cho khu trong kho.", 409);
}

module.exports = { addCategory, editCategory, deleteCategory }; // Cho CatalogWriteService dùng ba hàm
```

## 10. src/modules/catalog/uc07-mat-hang.js

**UC-07.1 thêm, UC-07.2 xóa, UC-07.3 sửa mặt hàng**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const { readInput } = require("./catalog-input"); // Hàm kiểm tra dữ liệu nhập
const store = require("./catalog-store"); // Các hàm ghi CSDL

const ITEM_USAGE = [ // Những nơi một mặt hàng có thể đã được dùng: [tên bảng, tên hiển thị]
  ["lots", "lô hàng / tồn kho"], // Đã có lô hàng hoặc tồn kho
  ["stock_request_lines", "yêu cầu nhập xuất"], // Đã có yêu cầu nhập xuất
  ["customer_order_lines", "đơn hàng"], // Đã có trong đơn hàng
  ["purchase_order_lines", "đơn mua hàng"], // Đã có trong đơn mua
  ["business_plan_lines", "kế hoạch mua bán"], // Đã có trong kế hoạch mua bán
  ["production_plan_lines", "kế hoạch sản xuất"], // Đã có trong kế hoạch sản xuất
  ["report_details", "báo cáo sản xuất"], // Đã có trong báo cáo sản xuất
];

async function addItem(pool, user, body, requestId) { // UC-07.1 THÊM MẶT HÀNG
  // Kiểm tra dữ liệu: bỏ trống, nhập chữ, số âm thì báo lỗi
  const item = readInput("items", body, "create");
  item.is_active ??= 1; // Mặc định đang hoạt động
  item.is_sample ??= 0; // Mặc định không phải hàng mẫu
  item.is_published ??= 0; // Mặc định chưa công bố cho khách
  item.version = 1; // Phiên bản đầu tiên là 1
  checkSampleFlags(item.kind, item); // Kiểm tra cờ hàng mẫu / công bố
  const ownFields = takeOwnFields(item); // Tách các trường nằm ở bảng con

  return store.transaction(pool, async (db) => { // Các bước dưới cùng lưu hoặc cùng hủy
    await checkCategory(db, item.category_id, item.kind); // Danh mục còn dùng và đúng nhóm
    await checkUnit(db, item.unit_id); // Đơn vị tính phải tồn tại
    await store.checkNameFree(db, "items", item.name); // Tên không được trùng
    // Không nhập mã thì tự sinh NVL-001 hoặc TP-001
    item.code ||= await store.nextCode(db, "items", item.kind === "MATERIAL" ? "NVL" : "TP");
    const id = await store.insertRow(db, "items", item); // Thêm dòng vào bảng mặt hàng
    await saveOwnFields(db, id, item.kind, ownFields); // Lưu trường riêng vào bảng con
    await store.audit(db, user, "items", id, "CREATE", null, item, requestId); // Ghi nhật ký
    return id; // Trả mã vừa tạo
  });
}

async function editItem(pool, user, id, body, requestId) { // UC-07.3 SỬA MẶT HÀNG
  const changes = readInput("items", body, "edit"); // Kiểm tra các trường muốn sửa
  const ownFields = takeOwnFields(changes); // Tách các trường nằm ở bảng con

  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, "items", id); // Đọc và khóa mặt hàng
    C.version(current, body.version); // Người khác vừa sửa thì báo tải lại
    checkSampleFlags(current.kind, { ...current, ...changes }); // Kiểm tra cờ theo giá trị sau khi sửa
    // Đã phát sinh chứng từ thì không đổi danh mục / đơn vị tính
    await checkCategoryAndUnitChange(db, current, changes);
    await checkCategory(db, changes.category_id, current.kind); // Danh mục mới phải hợp lệ
    await checkUnit(db, changes.unit_id); // Đơn vị tính mới phải tồn tại
    await store.checkNameFree(db, "items", changes.name, id); // Tên mới không được trùng
    await store.updateRow(db, "items", id, changes); // Ghi thay đổi, tăng phiên bản
    await saveOwnFields(db, id, current.kind, ownFields); // Lưu trường riêng vào bảng con
    // Ghi nhật ký: trước và sau khi sửa
    await store.audit(db, user, "items", id, "UPDATE", current, { ...changes, ...ownFields }, requestId);
  });
}

async function deleteItem(pool, user, id, body, requestId) { // UC-07.2 XÓA MẶT HÀNG
  await store.transaction(pool, async (db) => { // Chạy trong giao dịch
    const current = await store.lockRow(db, "items", id); // Đọc và khóa mặt hàng
    C.version(current, body.version); // Người khác vừa sửa thì báo tải lại
    const usedIn = await findUsage(db, id); // Tìm những nơi đã dùng mặt hàng
    // Đã dùng ở đâu đó thì báo lỗi, nêu rõ nơi dùng
    C.fail(usedIn.length, "IN_USE", `Không thể xóa mặt hàng vì đã phát sinh ${usedIn.join(", ")}.`, 409);
    await store.deleteRow(db, "items", id); // Xóa dòng
    await store.audit(db, user, "items", id, "DELETE", current, null, requestId); // Ghi nhật ký xóa
  });
}

function checkSampleFlags(kind, item) { // Kiểm tra cờ hàng mẫu và công bố
  // Chỉ thành phẩm mới được là hàng mẫu
  C.fail(item.is_sample === 1 && kind !== "FINISHED_PRODUCT", "VALIDATION_ERROR", "Chỉ thành phẩm được đánh dấu hàng mẫu.");
  // Chỉ hàng mẫu mới được công bố
  C.fail(item.is_published === 1 && item.is_sample !== 1, "VALIDATION_ERROR", "Chỉ công bố mặt hàng mẫu.");
}

async function checkCategory(db, categoryId, itemKind) { // Kiểm tra danh mục được chọn
  if (!categoryId) return; // Không đổi danh mục thì bỏ qua
  // Đọc danh mục
  const [[category]] = await db.execute("SELECT is_active,LoaiDanhMuc FROM categories WHERE id=?", [categoryId]);
  // Không tồn tại hoặc đã ngừng dùng thì báo lỗi
  C.fail(!category || !category.is_active, "VALIDATION_ERROR", "Danh mục không còn được sử dụng. Vui lòng chọn lại.");
  // Khác nhóm với mặt hàng thì báo lỗi
  C.fail(category.LoaiDanhMuc && category.LoaiDanhMuc !== itemKind, "VALIDATION_ERROR", "Mặt hàng phải thuộc đúng nhóm của danh mục.");
}

async function checkUnit(db, unitId) { // Kiểm tra đơn vị tính được chọn
  if (!unitId) return; // Không đổi thì bỏ qua
  const [[unit]] = await db.execute("SELECT id FROM units WHERE id=?", [unitId]); // Tìm đơn vị tính
  // Không có thì báo lỗi
  C.fail(!unit, "VALIDATION_ERROR", "Đơn vị tính không tồn tại. Vui lòng chọn lại.");
}

// Có được đổi danh mục / đơn vị tính không?
async function checkCategoryAndUnitChange(db, current, changes) {
  const changed = []; // Danh sách những thứ bị đổi
  // Danh mục khác cũ thì ghi lại
  if (changes.category_id && changes.category_id !== String(current.category_id)) changed.push("danh mục");
  // Đơn vị tính khác cũ thì ghi lại
  if (changes.unit_id && changes.unit_id !== String(current.unit_id)) changed.push("đơn vị tính");
  if (!changed.length) return; // Không đổi gì thì bỏ qua

  const usedIn = await findUsage(db, current.id); // Tìm nơi đã dùng mặt hàng
  C.fail(usedIn.length, "IN_USE", // Đã dùng thì không cho đổi
    // Thông báo nêu thứ bị đổi và nơi đã dùng
    `Không đổi được ${changed.join(" và ")} vì mặt hàng đã phát sinh ${usedIn.join(", ")}. Thông tin cũ được giữ nguyên.`, 409);
}

async function findUsage(db, itemId) { // Tìm những nơi mặt hàng đã được dùng
  const usedIn = []; // Danh sách kết quả
  for (const [table, label] of ITEM_USAGE) { // Duyệt từng bảng trong ITEM_USAGE
    // Bảng này có dòng nào của mặt hàng không?
    const [[row]] = await db.execute(`SELECT 1 AS used FROM ${table} WHERE item_id=? LIMIT 1`, [itemId]);
    if (row) usedIn.push(label); // Có thì thêm tên hiển thị vào kết quả
  }
  return usedIn; // Rỗng nghĩa là chưa phát sinh gì
}

function takeOwnFields(item) { // Tách trường của bảng con khỏi dữ liệu bảng mặt hàng
  const ownFields = {}; // Nơi chứa các trường tách ra
  // Tiêu chuẩn nhập và hạn sử dụng mặc định
  for (const field of ["material_quality_standard", "default_shelf_life_days"]) {
    if (!Object.hasOwn(item, field)) continue; // Không gửi trường này thì bỏ qua
    ownFields[field] = item[field]; // Chép sang nơi chứa riêng
    delete item[field]; // Bỏ khỏi dữ liệu bảng mặt hàng
  }
  return ownFields; // Trả các trường riêng
}

async function saveOwnFields(db, itemId, kind, fields) { // Lưu trường riêng vào bảng con
  // Là nguyên vật liệu hay thành phẩm?
  const isMaterial = kind === "MATERIAL", isProduct = kind === "FINISHED_PRODUCT";
  // Thành phẩm không có tiêu chuẩn nhập
  C.fail(!isMaterial && fields.material_quality_standard != null, "VALIDATION_ERROR", "Chỉ nguyên vật liệu có tiêu chuẩn nhập.");
  // Nguyên vật liệu không có hạn sử dụng mặc định
  C.fail(!isProduct && fields.default_shelf_life_days != null, "VALIDATION_ERROR", "Chỉ thành phẩm có hạn sử dụng mặc định.");

  // Nguyên vật liệu có gửi tiêu chuẩn nhập
  if (isMaterial && Object.hasOwn(fields, "material_quality_standard"))
    // Cập nhật bảng NguyenVatLieu
    await db.execute("UPDATE NguyenVatLieu SET TieuChuanNhap=? WHERE MaMatHang=?", [fields.material_quality_standard, itemId]);
  if (isProduct && Object.hasOwn(fields, "default_shelf_life_days")) // Thành phẩm có gửi hạn sử dụng
    // Cập nhật bảng ThanhPham
    await db.execute("UPDATE ThanhPham SET HanSuDungMacDinhNgay=? WHERE MaMatHang=?", [fields.default_shelf_life_days, itemId]);
}

module.exports = { addItem, editItem, deleteItem }; // Cho CatalogWriteService dùng ba hàm
```

## 11. src/modules/catalog/catalog-input.js

**Kiểm tra dữ liệu nhập**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung

const RESOURCES = { // Cấu hình từng loại dữ liệu
  categories: { // Danh mục
    table: "categories", // Tên bảng
    label: "danh mục", // Tên dùng trong thông báo
    // Trường được gửi khi thêm
    create: ["code", "name", "catalog_kind", "description", "image_path", "is_active"],
    // Trường được gửi khi sửa (có version để chống ghi đè)
    edit: ["version", "name", "catalog_kind", "description", "image_path", "is_active"],
    required: ["name", "catalog_kind"], // Trường bắt buộc khi thêm
    autoCode: true, // Mã để trống thì hệ thống tự sinh
  },
  items: { // Mặt hàng
    table: "items", // Tên bảng
    label: "mặt hàng", // Tên dùng trong thông báo
    // Trường được gửi khi thêm
    create: ["code", "name", "kind", "category_id", "unit_id", "reference_price", "description", "image_path",
      // (tiếp) trường riêng và các cờ
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    // Trường được gửi khi sửa (không đổi được loại mặt hàng)
    edit: ["version", "name", "category_id", "unit_id", "reference_price", "description", "image_path",
      // (tiếp) trường riêng và các cờ
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    required: ["name", "kind", "category_id", "unit_id", "reference_price"], // Trường bắt buộc khi thêm
    autoCode: true, // Mã để trống thì hệ thống tự sinh
  },
  warehouses: { // Kho
    table: "warehouses", // Tên bảng
    label: "kho", // Tên dùng trong thông báo
    create: ["code", "name", "address", "is_active"], // Trường được gửi khi thêm
    edit: ["name", "address", "is_active"], // Trường được gửi khi sửa
    required: ["code", "name"], // Trường bắt buộc khi thêm
  },
  "warehouse-locations": { // Vị trí trong kho
    table: "warehouse_locations", // Tên bảng
    label: "vị trí kho", // Tên dùng trong thông báo
    // Trường được gửi khi thêm
    create: ["warehouse_id", "code", "name", "zone_name", "zone_category_id", "depth", "is_active"],
    edit: ["name", "zone_name", "zone_category_id", "depth", "is_active"], // Trường được gửi khi sửa
    required: ["warehouse_id", "code", "name"], // Trường bắt buộc khi thêm
  },
  suppliers: { // Nhà cung cấp
    table: "suppliers", // Tên bảng
    label: "nhà cung cấp", // Tên dùng trong thông báo
    // Trường được gửi khi thêm
    create: ["code", "name", "phone", "email", "address", "tax_code", "is_active"],
    edit: ["name", "phone", "email", "address", "tax_code", "is_active"], // Trường được gửi khi sửa
    required: ["code", "name"], // Trường bắt buộc khi thêm
  },
};

const LABELS = { // Tên tiếng Việt của trường, dùng trong thông báo lỗi
  // Mã, tên, mô tả, nhóm, loại
  code: "Mã", name: "Tên", description: "Mô tả", catalog_kind: "Nhóm danh mục", kind: "Loại mặt hàng",
  // Danh mục, đơn vị, giá, kho
  category_id: "Danh mục", unit_id: "Đơn vị tính", reference_price: "Giá tham khảo", warehouse_id: "Kho",
  // Thông tin liên hệ và khu
  address: "Địa chỉ", phone: "Số điện thoại", email: "Email", tax_code: "Mã số thuế", zone_name: "Tên khu",
  // Trường riêng của mặt hàng
  material_quality_standard: "Tiêu chuẩn nhập", default_shelf_life_days: "Hạn sử dụng mặc định",
};
// Số ký tự tối đa của từng trường
const MAX_LENGTH = { code: 40, name: 150, address: 500, phone: 20, email: 254, tax_code: 30, zone_name: 120 };
// Các trường chữ được để trống
const OPTIONAL_TEXT = ["description", "address", "phone", "email", "tax_code"];

const labelOf = (field) => LABELS[field] || field; // Lấy tên tiếng Việt; không có thì dùng tên trường
const isId = (value) => /^[1-9]\d*$/.test(String(value)); // Có phải số nguyên dương không?
// Có trống không? (không gửi, null hoặc toàn khoảng trắng)
const isBlank = (value) => value === undefined || value === null || (typeof value === "string" && !value.trim());
// Viết tắt: điều kiện đúng thì báo lỗi dữ liệu
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

// Loại này có số phiên bản không?
const hasVersion = (resource) => RESOURCES[resource].edit.includes("version");

function readKind(value) { // Kiểm tra nhóm nguyên vật liệu / thành phẩm
  // Chỉ nhận một trong hai giá trị
  invalid(!["MATERIAL", "FINISHED_PRODUCT"].includes(value), "Chọn nhóm Nguyên vật liệu hoặc Thành phẩm.");
  return value; // Hợp lệ thì trả lại nguyên giá trị
}

function readId(value, field) { // Kiểm tra mã của dữ liệu ở bảng khác
  invalid(!isId(value), `${labelOf(field)} không hợp lệ.`); // Không phải số nguyên dương thì báo lỗi
  return String(value); // Trả về dạng chữ
}

function readZoneCategory(value) { // Nhóm hàng của khu trong kho
  if (isBlank(value)) return null; // Để trống nghĩa là khu chung
  invalid(!isId(value), "Nhóm hàng của khu không hợp lệ."); // Có nhập thì phải hợp lệ
  return String(value); // Trả về dạng chữ
}

function readDepth(value) { // Độ sâu của ô trong kho
  const depth = Number(value); // Đổi sang số
  // Phải là số nguyên từ 1 đến 100
  invalid(!Number.isInteger(depth) || depth < 1 || depth > 100, "Độ sâu vị trí phải từ 1 đến 100.");
  return depth; // Trả về số
}

function readPrice(value) { // Giá tham khảo
  // Nếu là số thì đổi sang chữ để kiểm tra
  const text = typeof value === "number" ? String(value) : value;
  // Không phải số thì báo lỗi
  invalid(typeof text !== "string" || !/^-?\d+(\.\d+)?$/.test(text.trim()), "Giá tham khảo phải là số. Vui lòng nhập lại.");
  // Số âm thì báo lỗi
  invalid(text.trim().startsWith("-"), "Giá tham khảo không được nhỏ hơn 0. Vui lòng nhập lại.");
  return C.money(C.price(text.trim())); // Đổi về dạng tiền 4 chữ số thập phân
}

function readShelfLife(value) { // Hạn sử dụng mặc định (số ngày)
  // Sai nếu không phải số nguyên từ 1 đến 36500 (null là không có)
  const wrong = value !== null && (!Number.isInteger(value) || value < 1 || value > 36500);
  invalid(wrong, "Hạn sử dụng mặc định phải là số ngày từ 1 đến 36500."); // Sai thì báo lỗi
  return value; // Trả lại giá trị
}

function readQualityStandard(value) { // Tiêu chuẩn nhập của nguyên vật liệu
  if (isBlank(value)) return null; // Trống thì lưu null
  // Quá 1000 ký tự thì báo lỗi
  invalid(typeof value !== "string" || value.length > 1000, "Tiêu chuẩn nhập không hợp lệ hoặc quá dài.");
  return value.trim(); // Bỏ khoảng trắng hai đầu
}

function readImage(value, field, resource) { // Ảnh
  // Mặt hàng và danh mục dùng hai bộ kiểm tra ảnh khác nhau
  const images = resource === "items" ? require("../../config/item-images") : require("../../config/category-images");
  return images.validatePath(value); // Chỉ nhận ảnh đã tải lên hệ thống
}

function readFlag(value, field) { // Trường có / không
  invalid(typeof value !== "boolean", `${field} phải là true hoặc false.`); // Phải là true hoặc false
  return value ? 1 : 0; // Lưu thành 1 hoặc 0
}

function readText(value, field) { // Trường chữ: tên, mã, mô tả, địa chỉ...
  // Bắt buộc nếu không nằm trong danh sách được để trống
  const required = !OPTIONAL_TEXT.includes(field);
  // Bắt buộc mà trống thì báo lỗi
  invalid(required && isBlank(value), `Vui lòng nhập đầy đủ thông tin: ${labelOf(field)}.`);
  const maxLength = MAX_LENGTH[field] || 5000; // Số ký tự tối đa, mặc định 5000
  // Không phải chữ hoặc quá dài thì báo lỗi
  invalid(value != null && (typeof value !== "string" || value.length > maxLength), `${labelOf(field)} không hợp lệ hoặc quá dài.`);
  // Là email nhưng sai dạng?
  const wrongEmail = field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  invalid(wrongEmail, "Email không hợp lệ."); // Email sai thì báo lỗi
  return value ? value.trim() : null; // Bỏ khoảng trắng hai đầu; trống thì lưu null
}

const FIELD_RULES = { // Trường nào dùng hàm kiểm tra nào; không có ở đây thì dùng readText
  catalog_kind: readKind, // Nhóm danh mục: kiểm tra bằng readKind
  kind: readKind, // Loại mặt hàng: kiểm tra bằng readKind
  category_id: readId, // Danh mục: kiểm tra bằng readId
  unit_id: readId, // Đơn vị tính: kiểm tra bằng readId
  warehouse_id: readId, // Kho: kiểm tra bằng readId
  zone_category_id: readZoneCategory, // Nhóm hàng của khu: kiểm tra bằng readZoneCategory
  depth: readDepth, // Độ sâu ô: kiểm tra bằng readDepth
  reference_price: readPrice, // Giá tham khảo: kiểm tra bằng readPrice
  default_shelf_life_days: readShelfLife, // Hạn sử dụng mặc định: kiểm tra bằng readShelfLife
  material_quality_standard: readQualityStandard, // Tiêu chuẩn nhập: kiểm tra bằng readQualityStandard
  image_path: readImage, // Đường dẫn ảnh: kiểm tra bằng readImage
  is_active: readFlag, // Đang hoạt động: kiểm tra bằng readFlag
  is_sample: readFlag, // Hàng mẫu: kiểm tra bằng readFlag
  is_published: readFlag, // Đã công bố: kiểm tra bằng readFlag
};

function readInput(resource, body, mode) { // Đọc dữ liệu gửi lên; mode là "create" hoặc "edit"
  C.fields(body, RESOURCES[resource][mode]); // Không nhận trường lạ
  if (mode === "create") checkRequired(resource, body); // Khi thêm: đủ trường bắt buộc chưa?
  else checkHasChange(body); // Khi sửa: có thay đổi gì không?

  const values = {}; // Kết quả sẵn sàng ghi vào bảng
  for (const [field, value] of Object.entries(body)) { // Duyệt từng trường được gửi
    if (field === "version") continue; // version không phải cột để ghi
    // Mã để trống thì bỏ qua, hệ thống tự sinh sau
    if (field === "code" && RESOURCES[resource].autoCode && isBlank(value)) continue;
    // Nhóm danh mục trong CSDL tên là LoaiDanhMuc
    const column = field === "catalog_kind" ? "LoaiDanhMuc" : field;
    const readField = FIELD_RULES[field] || readText; // Chọn hàm kiểm tra của trường
    values[column] = readField(value, field, resource); // Kiểm tra rồi lưu vào kết quả
  }
  return values; // Trả kết quả
}

function checkRequired(resource, body) { // Kiểm tra trường bắt buộc
  // Lọc ra các trường còn trống
  const missing = RESOURCES[resource].required.filter((field) => isBlank(body[field]));
  // Còn trống thì báo lỗi, kể tên từng trường
  invalid(missing.length, "Vui lòng nhập đầy đủ thông tin: " + missing.map(labelOf).join(", ") + ".");
}

function checkHasChange(body) { // Kiểm tra có gì để sửa
  // Các trường gửi lên, bỏ version
  const changed = Object.keys(body).filter((field) => field !== "version");
  invalid(!changed.length, "Không có nội dung cần sửa."); // Không có trường nào thì báo lỗi
}

module.exports = { RESOURCES, hasVersion, isId, readInput }; // Cho file khác dùng
```

## 12. src/modules/catalog/catalog-store.js

**Ghi vào CSDL**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const runTransaction = require("../../shared/transaction"); // Hàm chạy giao dịch
const { RESOURCES, hasVersion } = require("./catalog-input"); // Cấu hình từng loại dữ liệu

const tableOf = (resource) => RESOURCES[resource].table; // Lấy tên bảng của loại dữ liệu

async function transaction(pool, work) { // Chạy giao dịch, đổi lỗi CSDL thành thông báo dễ hiểu
  try {
    return await runTransaction(pool, work); // Chạy các câu SQL
  } catch (error) { // CSDL báo lỗi
    // Trùng mã hoặc tên
    if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Mã hoặc tên đã tồn tại.");
    // Dữ liệu đang được nơi khác dùng
    if (error.code === "ER_ROW_IS_REFERENCED_2") throw new C.DomainError(409, "IN_USE", "Không thể xóa vì dữ liệu đang được sử dụng.");
    throw error; // Lỗi khác thì báo nguyên
  }
}

async function lockRow(db, resource, id) { // Đọc và khóa một dòng
  // FOR UPDATE: khóa dòng cho tới khi xong giao dịch
  const [[row]] = await db.execute(`SELECT * FROM ${tableOf(resource)} WHERE id=? FOR UPDATE`, [id]);
  // Không có dòng thì báo lỗi
  C.fail(!row, "NOT_FOUND", `Không tìm thấy ${RESOURCES[resource].label}. Vui lòng tải lại danh sách.`, 404);
  return row; // Trả dòng đọc được
}

async function insertRow(db, resource, values) { // Thêm một dòng
  const columns = Object.keys(values); // Tên các cột
  const marks = columns.map(() => "?"); // Mỗi cột một dấu ?
  const [result] = await db.execute( // Chạy câu lệnh thêm
    // Câu lệnh ghép từ tên bảng và tên cột
    `INSERT INTO ${tableOf(resource)} (${columns.join(",")}) VALUES (${marks.join(",")})`,
    Object.values(values), // Giá trị điền vào các dấu ?
  );
  return result.insertId; // Trả mã (id) vừa tạo
}

async function updateRow(db, resource, id, values) { // Sửa một dòng
  const sets = Object.keys(values).map((column) => `${column}=?`); // Tạo danh sách "cột=?"
  if (hasVersion(resource)) sets.push("version=version+1"); // Bảng có phiên bản thì tăng thêm 1
  if (!sets.length) return; // Không có gì để sửa thì thôi
  // Chạy câu lệnh sửa
  await db.execute(`UPDATE ${tableOf(resource)} SET ${sets.join(",")} WHERE id=?`, [...Object.values(values), id]);
}

async function deleteRow(db, resource, id) { // Xóa một dòng
  await db.execute(`DELETE FROM ${tableOf(resource)} WHERE id=?`, [id]); // Chạy câu lệnh xóa
}

async function checkNameFree(db, resource, name, exceptId = 0) { // Tên đã có ở dòng khác chưa?
  if (!name) return; // Không đổi tên thì bỏ qua
  // Tìm dòng khác có cùng tên
  const [[same]] = await db.execute(`SELECT id FROM ${tableOf(resource)} WHERE name=? AND id<>? LIMIT 1`, [name, exceptId]);
  // Có thì báo trùng tên
  C.fail(same, "DUPLICATE", `Tên ${RESOURCES[resource].label} đã tồn tại. Vui lòng nhập tên khác.`, 409);
}

async function nextCode(db, resource, prefix) { // Sinh mã tiếp theo
  // Lấy các mã cùng tiền tố, ví dụ DM-%
  const [rows] = await db.execute(`SELECT code FROM ${tableOf(resource)} WHERE code LIKE ?`, [prefix + "-%"]);
  const numbers = rows // Lấy phần số của các mã
    .map((row) => row.code.slice(prefix.length + 1)) // Bỏ tiền tố
    .filter((text) => /^\d+$/.test(text)) // Chỉ giữ phần toàn chữ số
    .map(Number); // Đổi sang số
  // Số lớn nhất + 1, đủ 3 chữ số: DM-007
  return prefix + "-" + String(Math.max(0, ...numbers) + 1).padStart(3, "0");
}

async function audit(db, user, resource, id, action, before, after, requestId) { // Ghi nhật ký
  await db.execute( // Thêm dòng vào bảng nhật ký
    // Ai, loại dữ liệu, mã, thao tác, trước, sau, mã yêu cầu
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,?,?,?,?,?,?)",
    // Dữ liệu trước / sau lưu dạng JSON
    [user.id, resource, id, action, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, requestId],
  );
}

// Cho file khác dùng
module.exports = { transaction, lockRow, insertRow, updateRow, deleteRow, checkNameFree, nextCode, audit };
```

## 13. src/modules/catalog/CatalogService.js

**Điểm vào xem danh sách và chi tiết**

```js
const P = require("../../services/domain/policy"); // Hàm kiểm tra quyền
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
class CatalogService { // Dịch vụ xem danh mục
  constructor(repository) { // Nhận hàm đọc dữ liệu
    this.repository = repository; // Lưu lại
  }
  supports(resource) { // Loại dữ liệu có được hỗ trợ không?
    return this.repository.supports(resource); // Hỏi hàm đọc dữ liệu
  }
  async list(user, resource, query) { // UC-06 / UC-07 bước 2: xem danh sách
    P.role( // Kiểm tra quyền xem
      user, // Người đăng nhập
      // Đơn vị tính chỉ Quản lý kho; loại khác theo bảng quyền
      resource === "units" ? ["WAREHOUSE_MANAGER"] : P.read[resource],
    );
    const result = await this.repository.list(resource, query); // Đọc danh sách
    if (user.roles.includes("WAREHOUSE_MANAGER")) // Quản lý kho thì có nút Sửa, Xóa
      // Gắn nút Sửa, Xóa cho từng dòng
      result.data.forEach((row) => { row.actions = ["edit", "delete"]; });
    return result; // Trả danh sách
  }
  async get(user, resource, id) { // UC-06 / UC-07 bước 4: xem chi tiết
    P.role(user, P.read[resource]); // Kiểm tra quyền xem
    const result = await this.repository.get(resource, id); // Đọc chi tiết
    // Quản lý kho thì có nút Sửa, Xóa
    if (user.roles.includes("WAREHOUSE_MANAGER")) result.actions = ["edit", "delete"];
    return result; // Trả chi tiết
  }
  async sampleItems(user, query = {}) { // Khách xem hàng mẫu để đặt
    P.role(user, ["CUSTOMER"]); // Chỉ khách hàng
    return this.repository.list("items", { ...query, sampleOnly: true }); // Chỉ lấy hàng mẫu đã công bố
  }
  async lookup(user, resource, query = {}) { // Danh sách để chọn trong form
    P.role(user, ["WAREHOUSE_MANAGER"]); // Chỉ Quản lý kho
    C.fail( // Kiểm tra, sai thì báo lỗi
      !this.supports(resource), // Loại không được hỗ trợ
      "NOT_IMPLEMENTED", // Mã lỗi: chưa hỗ trợ
      "Dữ liệu chọn chưa được triển khai với MySQL.", // Thông báo cho người dùng
      501, // Mã trả về 501: chưa hỗ trợ
    );
    return (await this.repository.list(resource, { ...query, per_page: 100 })) // Lấy tối đa 100 dòng
      .data; // Chỉ lấy danh sách
  }
}
module.exports = CatalogService; // Cho file khác dùng
```

## 14. src/modules/catalog/CatalogRepository.js

**Đọc danh sách và chi tiết từ CSDL**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const paginate = require("../../utils/pagination"); // Hàm tính trang

const tables = { // Loại dữ liệu ứng với bảng nào
  categories: "categories", // Dữ liệu này nằm ở bảng categories
  warehouses: "warehouses", // Dữ liệu này nằm ở bảng warehouses
  "warehouse-locations": "warehouse_locations", // Dữ liệu này nằm ở bảng warehouse_locations
  suppliers: "suppliers", // Dữ liệu này nằm ở bảng suppliers
  units: "units", // Dữ liệu này nằm ở bảng units
  items: "items", // Dữ liệu này nằm ở bảng items
  lots: "lots", // Dữ liệu này nằm ở bảng lots
};

const LIST_COLUMNS = { // Cột lấy thêm khi xem danh sách
  // Mặt hàng: thêm đơn vị tính, tiêu chuẩn nhập, hạn sử dụng
  items: "t.*,u.name AS unit,n.TieuChuanNhap AS material_quality_standard,f.HanSuDungMacDinhNgay AS default_shelf_life_days",
  lots: "t.*,i.name AS item_name,h.code AS lot_header_code", // Lô: thêm tên mặt hàng và mã lô tổng
};
const LIST_JOINS = { // Bảng ghép thêm khi xem danh sách
  items: " JOIN units u ON u.id = t.unit_id" + // Mặt hàng ghép đơn vị tính và hai bảng con
    // Ghép hai bảng con
    " LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id",
  // Lô ghép mặt hàng và lô tổng
  lots: " JOIN items i ON i.id=t.item_id LEFT JOIN lot_headers h ON h.id=t.lot_header_id",
};

const DETAIL_SQL = { // Câu lệnh xem chi tiết từng loại
  // Mặt hàng: kèm đơn vị, danh mục, trường riêng
  items: "SELECT t.*,u.name AS unit,c.name AS category_name,n.TieuChuanNhap AS material_quality_standard," +
    "f.HanSuDungMacDinhNgay AS default_shelf_life_days" + // Hạn sử dụng mặc định
    // Đọc từ các bảng này
    " FROM items t JOIN units u ON u.id=t.unit_id JOIN categories c ON c.id=t.category_id" +
    // Ghép thêm bảng
    " LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id WHERE t.id=?",
  // Lô: kèm mặt hàng, nhà cung cấp, xưởng
  lots: "SELECT t.*,i.name AS item_name,h.code AS lot_header_code,u.name AS unit,s.name AS supplier_name,w.name AS workshop_name" +
    " FROM lots t JOIN items i ON i.id=t.item_id JOIN units u ON u.id=i.unit_id" + // Đọc từ các bảng này
    " LEFT JOIN lot_headers h ON h.id=t.lot_header_id" + // Ghép thêm bảng
    " LEFT JOIN purchase_order_lines pl ON pl.id=t.purchase_order_line_id" + // Ghép thêm bảng
    " LEFT JOIN purchase_orders po ON po.id=pl.purchase_order_id" + // Ghép thêm bảng
    " LEFT JOIN suppliers s ON s.id=COALESCE(pl.supplier_id,po.supplier_id)" + // Ghép thêm bảng
    " LEFT JOIN production_plans pp ON pp.id=t.production_plan_id" + // Ghép thêm bảng
    " LEFT JOIN workshops w ON w.id=pp.workshop_id WHERE t.id=?", // Ghép thêm bảng
  // Kho: kèm tên xưởng
  warehouses: "SELECT t.*,(SELECT name FROM workshops WHERE id=t.workshop_id) AS workshop_name FROM warehouses t WHERE t.id=?",
  // Vị trí: kèm tên kho và nhóm hàng
  "warehouse-locations": "SELECT t.*,(SELECT name FROM warehouses WHERE id=t.warehouse_id) AS warehouse_name," +
    // Và tên nhóm hàng của khu
    "(SELECT name FROM categories WHERE id=t.zone_category_id) AS category_name FROM warehouse_locations t WHERE t.id=?",
};

const KINDS = ["MATERIAL", "FINISHED_PRODUCT"]; // Hai nhóm hợp lệ
const isId = (value) => /^[1-9]\d*$/.test(String(value)); // Có phải số nguyên dương không?
// Viết tắt: điều kiện đúng thì báo lỗi dữ liệu
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

class CatalogRepository { // Lớp đọc dữ liệu danh mục
  constructor(pool, resources = Object.keys(tables)) { // Nhận kết nối CSDL và danh sách loại được đọc
    this.pool = pool; // Lưu kết nối
    this.resources = new Set(resources); // Lưu danh sách loại
  }

  supports(resource) { // Loại này có được hỗ trợ không?
    // Có trong bảng tables và được giao cho lớp này
    return Object.hasOwn(tables, resource) && this.resources.has(resource);
  }

  checkSupported(resource) { // Không hỗ trợ thì báo lỗi
    // Không hỗ trợ thì dừng
    C.fail(!this.supports(resource), "NOT_IMPLEMENTED", "Chức năng chưa được triển khai với MySQL.", 501);
  }

  async list(resource, query = {}) { // Xem danh sách: lọc, tìm kiếm, phân trang
    this.checkSupported(resource); // Loại dữ liệu hợp lệ?
    const { page, per_page, offset } = paginate(query); // Tính trang và số dòng bỏ qua
    const { where, values } = buildFilter(resource, query); // Tạo điều kiện lọc

    // Đếm tổng số dòng
    const [[count]] = await this.pool.execute(`SELECT COUNT(*) AS total FROM ${tables[resource]} t${where}`, values);
    const [rows] = await this.pool.execute( // Lấy các dòng của trang
      // Ghép câu lệnh: cột, bảng, điều kiện
      `SELECT ${LIST_COLUMNS[resource] || "t.*"} FROM ${tables[resource]} t${LIST_JOINS[resource] || ""}${where}` +
        " ORDER BY t.id DESC LIMIT ? OFFSET ?", // Mới nhất trước, giới hạn theo trang
      [...values, String(per_page), String(offset)], // Giá trị điền vào các dấu ?
    );

    let data = rows.map(normalize); // Chuẩn hóa từng dòng
    // Nhà cung cấp thì thêm danh sách mặt hàng cung cấp
    if (resource === "suppliers") data = await this.withSupplies(data);
    const total = Number(count.total); // Tổng số dòng dạng số
    // Trả dữ liệu và thông tin phân trang
    return { data, meta: { page, per_page, total, total_pages: Math.ceil(total / per_page) } };
  }

  async get(resource, id) { // Xem chi tiết một dòng
    this.checkSupported(resource); // Loại dữ liệu hợp lệ?
    C.fail(!/^\d+$/.test(String(id)), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404); // Mã phải là số
    // Lấy câu lệnh riêng của loại, không có thì đọc thẳng bảng
    const sql = DETAIL_SQL[resource] || `SELECT * FROM ${tables[resource]} WHERE id = ?`;
    const [rows] = await this.pool.execute(sql, [id]); // Chạy câu lệnh
    // Không có dòng thì báo không tìm thấy
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);

    const row = normalize(rows[0]); // Chuẩn hóa dòng
    if (resource !== "suppliers") return row; // Không phải nhà cung cấp thì trả luôn
    const [supplier] = await this.withSupplies([row]); // Nhà cung cấp thì thêm mặt hàng cung cấp
    return supplier; // Trả kết quả
  }

  async withSupplies(suppliers) { // Thêm danh sách nguyên vật liệu mỗi nhà cung cấp có báo giá
    const [materials] = await this.pool.execute( // Lấy bảng giá của các nguyên vật liệu
      // Câu lệnh đọc
      "SELECT i.id,i.name,n.BangGiaNCC FROM items i JOIN NguyenVatLieu n ON n.MaMatHang=i.id WHERE i.is_active=1",
    );
    return suppliers.map((supplier) => ({ // Với từng nhà cung cấp
      ...supplier, // Giữ nguyên các thông tin khác
      supplied_items: materials // Danh sách mặt hàng cung cấp
        // Giữ nguyên vật liệu có báo giá của nhà cung cấp này
        .filter((material) => readOffers(material).some((offer) => String(offer.supplier_id) === String(supplier.id)))
        .map((material) => ({ id: String(material.id), name: material.name })), // Chỉ lấy mã và tên
    }));
  }
}

function buildFilter(resource, query) { // Tạo điều kiện lọc danh sách
  const conditions = [], values = []; // Các điều kiện và giá trị đi kèm
  const add = (condition, ...params) => { // Hàm thêm một điều kiện
    conditions.push(condition); // Thêm điều kiện
    values.push(...params); // Thêm giá trị
  };

  // Mặc định chỉ hiện dòng đang hoạt động
  if (["items", "categories"].includes(resource) && query.include_inactive !== "true") add("t.is_active=1");
  if (resource === "categories" && query.kind) { // Lọc danh mục theo nhóm
    invalid(!KINDS.includes(query.kind), "Nhóm danh mục không hợp lệ."); // Nhóm sai thì báo lỗi
    add("t.LoaiDanhMuc=?", query.kind); // Thêm điều kiện nhóm
  }
  if (resource === "items" && query.category_id) { // Lọc mặt hàng theo danh mục
    invalid(!isId(query.category_id), "Danh mục không hợp lệ."); // Mã danh mục sai thì báo lỗi
    add("t.category_id=?", String(query.category_id)); // Thêm điều kiện danh mục
  }
  if (resource === "lots" && query.lot_header_id) { // Lọc lô theo lô tổng
    invalid(!isId(query.lot_header_id), "Lô tổng không hợp lệ."); // Mã lô tổng sai thì báo lỗi
    add("t.lot_header_id=?", String(query.lot_header_id)); // Thêm điều kiện lô tổng
  }
  if (query.q) { // Có từ khóa tìm kiếm (UC-07 luồng 3.1)
    C.text(query.q, "q", 150); // Từ khóa tối đa 150 ký tự
    const text = "%" + query.q + "%"; // Tìm chuỗi có chứa từ khóa
    if (resource === "lots") add("t.code LIKE ?", text); // Lô chỉ tìm theo mã
    else add("(t.code LIKE ? OR t.name LIKE ?)", text, text); // Loại khác tìm theo mã hoặc tên
  }
  if (resource === "items" && query.kind) { // Lọc mặt hàng theo loại
    invalid(!KINDS.includes(query.kind), "Loại mặt hàng không hợp lệ."); // Loại sai thì báo lỗi
    add("t.kind = ?", query.kind); // Thêm điều kiện loại
  }
  if (query.sampleOnly) // Khách đặt hàng: chỉ xem hàng mẫu
    // Thành phẩm, là hàng mẫu, đã công bố, đang hoạt động
    add("t.kind = 'FINISHED_PRODUCT' AND t.is_sample = 1 AND t.is_published = 1 AND t.is_active = 1");

  // Nối các điều kiện bằng AND
  return { where: conditions.length ? " WHERE " + conditions.join(" AND ") : "", values };
}

function readOffers(material) { // Đọc bảng giá lưu dạng JSON
  // Là chữ thì đổi sang danh sách
  if (typeof material.BangGiaNCC === "string") return JSON.parse(material.BangGiaNCC);
  return material.BangGiaNCC || []; // Không có thì trả danh sách rỗng
}

function normalize(row) { // Chuẩn hóa một dòng trước khi trả về
  const result = { ...row, actions: [] }; // Sao chép dòng, thêm danh sách thao tác rỗng
  delete result.BangGiaNCC; // Không trả bảng giá
  if (Object.hasOwn(result, "LoaiDanhMuc")) { // Có cột nhóm danh mục
    result.catalog_kind = result.LoaiDanhMuc; // Đổi sang tên catalog_kind cho giao diện
    delete result.LoaiDanhMuc; // Bỏ tên cột cũ
  }
  for (const key of Object.keys(result)) { // Duyệt từng trường
    // Mã đổi sang chữ để trình duyệt không làm tròn
    if (key === "id" || key.endsWith("_id")) result[key] = result[key] === null ? null : String(result[key]);
    if (key.startsWith("is_")) result[key] = Boolean(result[key]); // Cờ is_... đổi sang đúng / sai
  }
  return result; // Trả dòng đã chuẩn hóa
}

module.exports = CatalogRepository; // Cho file khác dùng lớp này
```

---

# UC-13 Lập đợt kiểm kê

Thứ tự gọi: `uc13-lap-dot-kiem-ke.js` (giao diện) → `ModuleRoutes.js` → `TaskService.js` → `uc13-lap-dot-kiem-ke.js` (máy chủ) → `inspection-scope.js`.

Bước lưu đợt gọi tiếp `QualityCampaignService.js` của phần QA/QC, không chép ở đây.

## 15. public/js/uc13-lap-dot-kiem-ke.js

**Giao diện: form lập đợt**

```js
(() => { // Bọc cả file để biến không lẫn với file khác
  const $ = (selector) => document.querySelector(selector); // Viết tắt: tìm phần tử trên trang
  const oldCreateForm = createForm; // Giữ lại hàm tạo mới cũ

  createForm = async function () { // Nút "Tạo mới"
    // Không phải màn Lập đợt kiểm kê thì dùng hàm cũ
    if (!isMysql || current !== "stocktakes") return oldCreateForm();
    try {
      // Lấy danh sách lô có thể kiểm, chờ xong
      const sources = (await api("task-inspection-sources")).data;
      const users = await options("users"); // Lấy danh sách nhân viên
      openForm(sources, users); // Mở form
    } catch (error) { // Lỗi thì
      openModal("Không thể lập đợt kiểm kê", errorHTML(error)); // Hiện hộp báo lỗi
    }
  };

  function openForm(sources, users) { // Bước 2: mở form
    openModal("Lập đợt kiểm kê", formWrap(formHTML(users))); // Mở hộp thoại với các ô nhập
    $('label[for="f-inspection_type"]').textContent = "Nhóm hàng *"; // Đổi nhãn ô nhóm hàng
    $('label[for="f-title"]').textContent = "Tên đợt kiểm kê *"; // Đổi nhãn ô tiêu đề

    $("#f-inspection_type").onchange = () => fillLots(sources); // Đổi nhóm hàng thì nạp lại danh sách lô
    $("#inspection-lot").onchange = () => showParts(sources); // Đổi lô thì hiện các phần của lô
    // Giờ kết thúc không được trước giờ bắt đầu
    $("#f-start_at").onchange = () => { $("#f-end_at").min = $("#f-start_at").value; };
    bindForm((data) => readForm(data, sources), "tasks"); // Bấm Lưu thì gửi tới địa chỉ "tasks"
    fillLots(sources); // Nạp danh sách lô lần đầu
  }

  function formHTML(users) { // Tạo các ô nhập
    // Hai nhóm hàng
    const kinds = [{ id: "FINISHED_PRODUCT", name: "Thành phẩm" }, { id: "MATERIAL", name: "Nguyên vật liệu" }];
    return ( // Ghép các ô
      inputField("inspection_type", "select", true, kinds) + // Nhóm hàng
      // Lô hàng (nạp sau)
      '<div class="field"><label for="inspection-lot">Lô hàng *</label><select id="inspection-lot" required></select></div>' +
      '<div class="span2" id="inspection-parts"></div>' + // Vùng hiện các phần của lô
      inputField("title") + // Tên đợt
      inputField("priority", "select", true, ["NORMAL", "HIGH", "LOW"]) + // Mức ưu tiên
      inputField("start_at", "datetime-local") + // Giờ bắt đầu
      inputField("end_at", "datetime-local") + // Giờ kết thúc
      inputField("location", "text", true, [], "Khu kiểm tra lô hàng") + // Địa điểm
      employeePicker(users) + // Chọn nhân viên
      // Lời nhắc: ai kiểm số lượng, ai kiểm chất lượng
      '<div class="span2 notice">Ban kiểm kê kiểm số lượng; QA/QC kiểm chất lượng. Chọn cả hai bộ phận để thực hiện cả hai nội dung trong cùng đợt.</div>' +
      inputField("description", "textarea", false) // Mô tả
    );
  }

  const isFinished = () => $("#f-inspection_type").value === "FINISHED_PRODUCT"; // Đang chọn thành phẩm?
  // Danh sách lô của nhóm đang chọn
  const lotsOf = (sources) => (isFinished() ? sources.finished_lots : sources.material_lots);
  // Lô đang chọn
  const chosenLot = (sources) => lotsOf(sources).find((lot) => lot.id === $("#inspection-lot").value);
  // Các ô tick phần của lô
  const partBoxes = () => [...document.querySelectorAll("[data-finished-part]")];
  // Các phần đã tick
  const chosenParts = () => partBoxes().filter((box) => box.checked).map((box) => box.value);
  // Các phần lô nguyên vật liệu đã chọn
  const chosenMaterialLots = () => [...($("#inspection-material-lots")?.selectedOptions || [])].map((option) => option.value);

  function fillLots(sources) { // Nạp danh sách lô vào ô chọn
    $("#inspection-lot").innerHTML = lotsOf(sources) // Lấy lô của nhóm đang chọn
      .map((lot) => `<option value="${esc(lot.id)}">${esc(lot.code)}</option>`) // Mỗi lô một lựa chọn
      .join(""); // Nối thành HTML
    showParts(sources); // Hiện phần của lô đầu tiên
  }

  function showParts(sources) { // Hiện phần của lô đang chọn
    const lot = chosenLot(sources); // Lô đang chọn
    if (isFinished()) showFinishedParts(lot, sources); // Thành phẩm
    else showMaterialParts(lot); // Nguyên vật liệu
    // Điền sẵn tên đợt
    $("#f-title").value = (isFinished() ? "Kiểm tra thành phẩm " : "Kiểm tra nguyên vật liệu ") + (lot?.code || "");
    suggestDates(sources); // Gợi ý thời gian
  }

  function showFinishedParts(lot, sources) { // Hiện các phần của lô thành phẩm
    const parts = lot?.parts || []; // Danh sách phần
    $("#inspection-parts").innerHTML = // Vẽ vào vùng phần của lô
      '<div class="form-section"><h3>Các phần của lô theo báo cáo thành phẩm</h3>' + // Khung và tiêu đề
      (parts.map(finishedPartHTML).join("") || // Mỗi phần một ô tick
        // Không có phần nào thì báo
        "<p>Chưa có báo cáo thành phẩm đã gửi còn phần chờ kiểm tra trong lô này.</p>") +
      "</div>"; // Đóng khung
    for (const box of partBoxes()) { // Với từng ô tick
      const part = parts.find((p) => p.id === box.value); // Phần tương ứng
      box.disabled = part?.available === false; // Đã giao kiểm thì không cho tick
      if (box.disabled) // Nếu bị khóa
        // Ghi chú lý do
        box.closest("label").querySelector("small").insertAdjacentText("beforeend", " · Đã giao kiểm tra / đã có kết quả");
      box.onchange = () => suggestDates(sources); // Tick thì gợi ý lại thời gian
    }
  }

  function finishedPartHTML(part) { // HTML của một phần
    // Các mặt hàng và số lượng trong phần
    const lines = part.lines.map((line) => line.item_name + ": " + format(line.quantity)).join(" · ");
    return (
      // Ô tick
      `<label class="employee-profile"><input type="checkbox" data-finished-part value="${esc(part.id)}">` +
      // Mã báo cáo, mặt hàng và ngày
      `<span><strong>${esc(part.code)}</strong><small>${esc(lines)} · ${esc(format(part.expected_date))}</small></span></label>`
    );
  }

  function showMaterialParts(lot) { // Hiện phần lô nguyên vật liệu
    const source = lot?.id?.startsWith("PO:") // Nguồn là đơn mua trực tiếp hay kế hoạch mua?
      ? "Lô nguyên vật liệu của đơn mua lập trực tiếp. " // Đơn mua trực tiếp
      : "Lô nguyên vật liệu được đối chiếu từ kế hoạch mua đã duyệt. "; // Kế hoạch mua đã duyệt
    const expected = lot?.expected_date ? format(lot.expected_date) : ""; // Ngày dự kiến nhận
    const eligible = lot?.eligible_lots || []; // Các phần lô được chọn
    $("#inspection-parts").innerHTML = // Vẽ vào vùng phần của lô
      `<div class="notice">${source}${esc(expected)}</div>` + // Dòng thông tin nguồn
      '<div class="form-section"><h3>Chọn phần lô nguyên vật liệu đã nhận</h3>' + // Khung và tiêu đề
      // Lời nhắc
      '<p class="material-reconciliation-note">Chỉ chọn các đợt đã ghi nhận thuộc đúng nguồn; không gộp số lượng cả lô tổng.</p>' +
      // Có phần lô thì cho chọn, không thì báo
      (eligible.length ? materialLotsHTML(eligible) : noMaterialLotsHTML()) +
      "</div>"; // Đóng khung
  }

  function materialLotsHTML(lots) { // Ô chọn nhiều phần lô
    // Mỗi phần lô một lựa chọn
    const choices = lots.map((lot) => `<option value="${esc(lot.id)}">${esc(lot.name)}</option>`).join("");
    return (
      // Nhãn ô chọn
      '<div class="field"><label for="inspection-material-lots">Phần lô đang chờ QC *</label>' +
      // Cho chọn nhiều, bắt buộc
      `<select id="inspection-material-lots" multiple size="6" required>${choices}</select>` +
      "<small>Giữ Ctrl (hoặc Command) để chọn nhiều phần lô.</small></div>" // Hướng dẫn chọn nhiều
    );
  }

  function noMaterialLotsHTML() { // Chưa có hàng
    // Vẫn lập được đợt dự kiến
    return '<div class="notice">Chưa có phần lô nguyên vật liệu thực tế chờ kiểm tra. Bạn vẫn có thể lập đợt dự kiến; khi hàng được ghi nhận, chọn bổ sung phần lô trong chi tiết công việc.</div>';
  }

  function suggestDates(sources) { // Gợi ý thời gian kiểm kê
    const lot = chosenLot(sources); // Lô đang chọn
    const received = isFinished() // Ngày nhận hàng
      // Thành phẩm: ngày muộn nhất của các phần đã tick
      ? latest((lot?.parts || []).filter((part) => chosenParts().includes(part.id)).map((part) => part.expected_date))
      : lot?.expected_date; // Nguyên vật liệu: ngày dự kiến của nguồn
    const day = latest([received || calendarToday(), calendarToday()]); // Không sớm hơn hôm nay
    const start = $("#f-start_at"), end = $("#f-end_at"); // Hai ô giờ
    start.min = day + "T00:00"; // Không chọn trước ngày này
    start.value = day + "T08:00"; // Bắt đầu 8 giờ
    end.min = start.value; // Kết thúc không trước bắt đầu
    end.value = day + "T09:00"; // Kết thúc 9 giờ
  }

  const latest = (days) => days.sort().at(-1); // Ngày muộn nhất trong danh sách

  // Đổi giờ Việt Nam sang giờ chuẩn để gửi
  const toIso = (vietnamTime) => new Date(vietnamTime + "+07:00").toISOString();

  function readForm(data, sources) { // Bước 5: dữ liệu gửi lên máy chủ
    const lot = chosenLot(sources); // Lô đang chọn
    if (!lot) throw Error("Chưa có lô phù hợp để kiểm tra."); // Không có lô thì báo
    const chosen = isFinished() ? readFinishedLot(lot) : readMaterialLot(lot); // Phần lô theo nhóm hàng
    return {
      ...data, // Các ô nhập thông thường
      start_at: toIso(data.start_at), // Giờ bắt đầu
      end_at: toIso(data.end_at), // Giờ kết thúc
      assignee_ids: selectedEmployees(), // Nhân viên được chọn
      ...chosen, // Lô và các phần được chọn
    };
  }

  function readFinishedLot(lot) { // Đọc lựa chọn thành phẩm
    const parts = chosenParts(); // Các phần đã tick
    // Chưa tick thì báo
    if (!parts.length) throw Error("Chọn ít nhất một phần theo báo cáo thành phẩm.");
    return { lot_header_id: lot.id, finished_report_ids: parts }; // Trả mã lô và các phần
  }

  function readMaterialLot(lot) { // Đọc lựa chọn nguyên vật liệu
    const lotIds = chosenMaterialLots(); // Các phần lô đã chọn
    // Có hàng mà chưa chọn thì báo
    if (lot.eligible_lots?.length && !lotIds.length) throw Error("Chọn ít nhất một phần lô nguyên vật liệu đã nhận.");
    return { material_source: lot.id, material_lot_ids: lotIds }; // Trả nguồn và các phần lô
  }
})(); // Chạy ngay hàm bọc
```

## 16. src/shared/ModuleRoutes.js

**Trích: địa chỉ lấy lô và lập đợt**

```js
// Bước 2: lấy các lô có thể kiểm, chỉ Ban giám đốc
router.get('/task-inspection-sources',role(['DIRECTOR']),async(req,res)=>ok(req,res,await runtime.tasks.inspectionSources(req.user)));

// ... (bỏ qua phần không thuộc UC này) ...

router.post("/tasks", role(["DIRECTOR"]), async (req, res) => // Bước 5: lập đợt, chỉ Ban giám đốc
  ok( // Trả kết quả theo mẫu chung
    req, // Yêu cầu của người dùng
    res, // Phản hồi trả về
    await runtime.tasks.create(req.user, req.body, req.request_id), // Gọi TaskService.create
    201, // Mã 201 là đã tạo
  ),
);
```

## 17. src/modules/tasks/TaskService.js

**Trích: kiểm tra chung, tạo công việc, thông báo**

```js
async inspectionSources(user) { // UC-13 bước 2: các lô có thể lập đợt
  P.role(user, ["DIRECTOR"]); // Chỉ Ban giám đốc
  return inspections.loadSources(this.pool); // Gọi sang uc13-lap-dot-kiem-ke.js
}
async transaction(work) { // Chạy giao dịch (bản riêng vì còn phải trả khóa lịch)
  const c = await this.pool.getConnection(); // Lấy kết nối
  c.taskScheduleLocks = []; // Danh sách khóa lịch đang giữ
  try {
    await c.beginTransaction(); // Bắt đầu giao dịch
    const result = await work(c); // Chạy các câu SQL
    await c.commit(); // Lưu tất cả
    return result; // Trả kết quả
  } catch (e) { // Có lỗi
    await c.rollback(); // Lỗi thì hủy tất cả
    throw e; // Báo lỗi tiếp
  } finally {
    try {
      for (const key of c.taskScheduleLocks) { // Trả từng khóa lịch
        await c.query("SELECT RELEASE_LOCK(?)", [key]); // Câu lệnh trả khóa
      }
    } finally {
      c.release(); // Trả kết nối
    }
  }
}

// ... (bỏ qua phần không thuộc UC này) ...

async validate(c, b, exclude = null, keptStart = false) { // UC-13 bước 4: kiểm tra thông tin chung
  C.text(b.title, "title", 200); // Tiêu đề bắt buộc, tối đa 200 ký tự
  C.text(b.description || "", "description", 5000, false); // Mô tả không bắt buộc
  C.fail( // Kiểm tra, sai thì báo lỗi
    !["LOW", "NORMAL", "HIGH"].includes(b.priority), // Ưu tiên phải là một trong ba mức
    "VALIDATION_ERROR", // Mã lỗi: dữ liệu không hợp lệ
    "Ưu tiên không hợp lệ.", // Thông báo cho người dùng
  );
  // Kiểm tra giờ bắt đầu, kết thúc
  const {start,end}=require('../../shared/time-rules').range(b.start_at,b.end_at);
  C.fail( // Kiểm tra, sai thì báo lỗi
    !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start, // Khoảng thời gian phải hợp lệ
    "VALIDATION_ERROR", // Mã lỗi: dữ liệu không hợp lệ
    "Khoảng thời gian không hợp lệ.", // Thông báo cho người dùng
  );
  // Lấy ngày theo giờ Việt Nam
  const localDay = value => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh', year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
  // Không cho ngày trong quá khứ
  if (!keptStart) C.fail(localDay(start) < C.today(), 'VALIDATION_ERROR', 'Ngày phân công không được trong quá khứ.');
  // Khi sửa giữ giờ bắt đầu: giờ kết thúc phải còn ở tương lai
  C.fail(keptStart && end <= new Date(), 'VALIDATION_ERROR', 'Giờ kết thúc mới phải sau thời điểm hiện tại.');
  C.fail( // Kiểm tra, sai thì báo lỗi
    !Array.isArray(b.assignee_ids) || // Danh sách nhân viên: có, tối đa 50, không trùng, mã hợp lệ
      !b.assignee_ids.length || // Không có ai
      b.assignee_ids.length > 50 || // Quá 50 người
      new Set(b.assignee_ids).size !== b.assignee_ids.length || // Bị trùng
      b.assignee_ids.some((id) => !isId(id)), // Mã không hợp lệ
    "VALIDATION_ERROR", // Mã lỗi: dữ liệu không hợp lệ
    "Danh sách phân công không hợp lệ.", // Thông báo cho người dùng
  );
  const ids = b.assignee_ids // Xếp mã nhân viên theo thứ tự để không khóa chéo nhau
    .map(String) // Đổi sang chữ
    .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1)); // Xếp tăng dần
  // Identity rows are read-only to this service. Serialize assignments locally
  // without requiring UPDATE permission on the Identity database.
  // Tên CSDL, dùng tạo khóa
  const [[schema]] = await c.query("SELECT DATABASE() AS schedule_database");
  for (const id of ids) { // Với từng nhân viên
    const key = // Tên khóa lịch của nhân viên
      "task:" + // Tiền tố
      crypto // Tạo dấu vân tay
        .createHash("sha256") // Kiểu mã hóa
        .update(schema.schedule_database + ":" + id) // Từ tên CSDL và mã nhân viên
        .digest("hex") // Dạng chữ
        .slice(0, 56); // Lấy 56 ký tự
    if (c.taskScheduleLocks.includes(key)) continue; // Đã giữ khóa này thì bỏ qua
    // Giữ khóa lịch, chờ tối đa 10 giây
    const [[lock]] = await c.query("SELECT GET_LOCK(?,10) AS acquired", [
      key, // Giá trị điền vào các dấu ?
    ]);
    C.fail( // Kiểm tra, sai thì báo lỗi
      Number(lock.acquired) !== 1, // Không giữ được thì báo thử lại
      "SCHEDULE_CONFLICT", // Mã lỗi: trùng lịch
      "Lịch đang được cập nhật. Vui lòng thử lại.", // Thông báo cho người dùng
      409, // Mã trả về 409: xung đột
    );
    c.taskScheduleLocks.push(key); // Nhớ khóa để trả sau
  }
  const [users] = await c.execute( // Đọc nhân viên
    // Đang hoạt động, thuộc Ban kiểm kê hoặc QA/QC
    "SELECT id FROM users WHERE status='ACTIVE' AND EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=users.id AND r.code IN ('STOCKTAKER','QC_INSPECTOR')) AND id IN (" +
      ids.map(() => "?").join(",") + // Mỗi nhân viên một dấu ?
      ") ORDER BY id", // Đóng danh sách
    ids, // Giá trị điền vào các dấu ?
  );
  C.fail( // Kiểm tra, sai thì báo lỗi
    users.length !== ids.length, // Thiếu ai thì báo lỗi
    "VALIDATION_ERROR", // Mã lỗi: dữ liệu không hợp lệ
    // Thông báo cho người dùng
    "Chỉ được phân công nhân viên đang hoạt động thuộc Ban kiểm kê hoặc QA/QC.",
  );
  const [overlap] = await c.execute( // Tìm công việc chồng giờ
    // Câu lệnh đọc
    "SELECT t.id FROM tasks t JOIN task_assignments a ON a.task_id=t.id WHERE a.user_id IN (" +
      ids.map(() => "?").join(",") + // Mỗi nhân viên một dấu ?
      // Còn hiệu lực và chồng khung giờ
      ") AND t.status IN ('PLANNED','IN_PROGRESS') AND t.start_at<? AND t.end_at>?" +
      (exclude ? " AND t.id<>?" : "") + // Khi sửa: bỏ qua chính công việc đang sửa
      " FOR UPDATE", // Khóa các dòng tìm được
    [...ids, end, start, ...(exclude ? [exclude] : [])], // Giá trị điền vào các dấu ?
  );
  C.fail( // Kiểm tra, sai thì báo lỗi
    overlap.length, // Có thì báo trùng lịch
    "SCHEDULE_CONFLICT", // Mã lỗi: trùng lịch
    "Lịch công việc bị trùng.", // Thông báo cho người dùng
    409, // Mã trả về 409: xung đột
  );
  return { start, end, ids }; // Trả thời gian và nhân viên đã kiểm tra
}

// ... (bỏ qua phần không thuộc UC này) ...

async audit(c, user, id, action, data, requestId) { // Ghi nhật ký công việc
  await c.execute( // Thêm dòng nhật ký
    // Ai, công việc nào, thao tác gì
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'tasks',?,?,?,?)",
    [user.id, id, action, JSON.stringify(data), requestId], // Giá trị điền vào các dấu ?
  );
}

// ... (bỏ qua phần không thuộc UC này) ...

async create(user, b, requestId) { // UC-13 bước 4-6: lập đợt và giao việc
  P.role(user, ["DIRECTOR"]); // Chỉ Ban giám đốc
  // Không nhận trường lạ
  C.fields(b, ["title", "description", "priority", "start_at", "end_at", "assignee_ids",
    // (tiếp) các trường riêng của kiểm kê
    "inspection_type", "lot_header_id", "finished_report_ids", "material_source", "material_lot_ids", "location", "minute_author_id"]);

  const taskId = await this.transaction(async (c) => { // Mọi bước dưới cùng lưu hoặc cùng hủy
    const value = await this.validate(c, b); // Kiểm tra thông tin chung
    const campaign = b.inspection_type // Có chọn nhóm hàng kiểm kê?
      // Có: tạo đợt kiểm kê
      ? await inspections.createCampaign(this.pool, c, user, b, value.ids, requestId)
      : null; // Không: chỉ là công việc thường

    const id = await insertTask(c, user, b, value); // Thêm công việc
    // Gắn công việc với đợt
    if (campaign) await c.execute("UPDATE tasks SET stocktake_id=?,task_type='LOT_INSPECTION' WHERE id=?", [campaign.id, id]);
    for (const userId of value.ids) // Với từng nhân viên
      // Giao cho từng nhân viên
      await c.execute("INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)", [id, userId]);
    await this.audit(c, user, id, "CREATE", b, requestId); // Ghi nhật ký

    for (const userId of value.ids) // Với từng nhân viên
      await notifyNewTask(c, userId, id, "Công việc mới: " + b.title, // Thông báo cho từng nhân viên
        // Nội dung và khóa chống trùng thông báo
        b.description || "Bạn được phân công thực hiện công việc.", "task-" + id + "-assigned");
    if (campaign) // Có đợt kiểm kê
      // Thông báo cho người lập biên bản
      await notifyNewTask(c, campaign.NguoiLapBienBanDuocChon, id, "Bạn được phân công lập biên bản chung",
        b.title, "task-" + id + "-minute-author-created"); // Nội dung và khóa chống trùng thông báo
    return id; // Trả mã công việc
  });
  return this.get(user, String(taskId)); // Trả công việc vừa tạo
}

// ... (bỏ qua phần không thuộc UC này) ...

async function insertTask(c, user, b, value) { // Thêm dòng công việc
  // Sinh mã công việc
  const code = await require("../../shared/readable-codes").next(c, "tasks", "CV", b.title);
  const [created] = await c.execute( // Chạy câu lệnh thêm
    // Công việc mới ở trạng thái chờ thực hiện
    "INSERT INTO tasks (code,title,description,priority,start_at,end_at,status,created_by,version) VALUES (?,?,?,?,?,?,'PLANNED',?,1)",
    // Giá trị điền vào các dấu ?
    [code, b.title, b.description || null, b.priority, value.start, value.end, user.id],
  );
  return created.insertId; // Trả mã vừa tạo
}

async function notifyNewTask(c, userId, taskId, subject, body, businessKey) { // Gửi thông báo
  await c.execute( // Thêm thông báo
    // Trùng khóa thì không thêm lần nữa
    "INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'tasks',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",
    [userId, subject, body, taskId, businessKey], // Giá trị điền vào các dấu ?
  );
}
```

## 18. src/modules/tasks/uc13-lap-dot-kiem-ke.js

**Xử lý lập đợt**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const { actualLots } = require("../quality/campaign-sources"); // Hàm lấy các phần lô đang chờ kiểm
const QualityCampaignService = require("../quality/QualityCampaignService"); // Dịch vụ lưu đợt kiểm tra
const inspectionScope = require("./inspection-scope"); // Phạm vi kiểm: số lượng / chất lượng
const scheduleDates = require("../../shared/qc-schedule-dates"); // Hàm xử lý ngày theo giờ Việt Nam

const DEFAULT_LOCATION = "Khu kiểm tra lô hàng"; // Địa điểm mặc định
// Viết tắt: điều kiện đúng thì báo lỗi dữ liệu
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);
// Lấy phần ngày năm-tháng-ngày
const dateOnly = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

async function loadSources(db) { // Bước 2: các lô có thể lập đợt
  const waitingLots = await actualLots(db, null, 1000); // Các phần lô đang chờ kiểm, chưa thuộc đợt nào
  return { // Trả về hai nhóm
    finished_lots: await groupFinishedLots(db, waitingLots), // Nhóm thành phẩm
    material_lots: await groupMaterialLots(db, waitingLots), // Nhóm nguyên vật liệu
  };
}

async function groupFinishedLots(db, waitingLots) { // Gom thành phẩm theo lô tổng
  const groups = new Map(); // Mã lô tổng → thông tin lô tổng
  const groupOf = (headerId, code) => { // Lấy lô tổng, chưa có thì tạo
    const key = String(headerId); // Mã dạng chữ
    // Chưa có thì tạo mới, chưa có phần nào
    if (!groups.has(key)) groups.set(key, { id: key, code, parts: [] });
    return groups.get(key); // Trả lô tổng
  };

  // Duyệt phần lô thành phẩm đang chờ
  for (const lot of waitingLots.filter((l) => l.kind === "FINISHED_PRODUCT"))
    groupOf(lot.lot_header_id, lot.lot_header_code || lot.code); // Tạo sẵn lô tổng của nó

  for (const report of await submittedFinishedReports(db)) { // Duyệt các báo cáo thành phẩm đã gửi
    // Lô của báo cáo còn chờ kiểm không?
    const waiting = waitingLots.find((l) => l.id === String(report.lot_id));
    const lot = waiting || lotOfReport(report); // Còn thì dùng luôn, không thì lấy từ báo cáo
    const group = groupOf(lot.lot_header_id, report.lot_header_code); // Lô tổng của báo cáo
    addLotToPart(group, report, lot, Boolean(waiting)); // Thêm lô vào phần của lô tổng
  }
  return [...groups.values()]; // Trả danh sách lô tổng
}

async function submittedFinishedReports(db) { // Đọc các báo cáo thành phẩm đã gửi
  const [reports] = await db.execute( // Chạy câu lệnh đọc
    // Cột: báo cáo, lô, số lượng
    "SELECT r.id,r.code,r.completed_date,o.lot_id,l.lot_header_id,l.code AS lot_code,l.received_quantity,l.qc_status," +
      "i.name AS item_name,h.code AS lot_header_code" + // Tên mặt hàng và mã lô tổng
      // Ghép báo cáo với lô, mặt hàng, lô tổng
      " FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id" +
      // Ghép thêm bảng
      " JOIN lots l ON l.id=o.lot_id JOIN items i ON i.id=l.item_id JOIN lot_headers h ON h.id=l.lot_header_id" +
      " WHERE r.status='SUBMITTED' ORDER BY r.id DESC LIMIT 1000", // Chỉ báo cáo đã gửi, mới nhất trước
  );
  return reports; // Trả danh sách
}

function lotOfReport(report) { // Tạo thông tin lô từ báo cáo (lô không còn chờ kiểm)
  return {
    id: String(report.lot_id), // Mã (id)
    lot_header_id: report.lot_header_id, // Mã lô tổng
    code: report.lot_code, // Mã
    item_name: report.item_name, // Tên mặt hàng
    received_quantity: report.received_quantity, // Số lượng nhận
    // Ngày dự kiến là ngày hoàn thành báo cáo
    expected_date: String(dateOnly(report.completed_date)).slice(0, 10),
  };
}

function addLotToPart(group, report, lot, isWaiting) { // Thêm lô vào phần (báo cáo)
  let part = group.parts.find((p) => p.id === String(report.id)); // Phần của báo cáo này đã có chưa?
  if (!part) { // Chưa có thì tạo
    // Phần mới, tạm cho là chọn được
    part = { id: String(report.id), code: report.code, available: true, expected_date: lot.expected_date, lot_ids: [], lines: [] };
    group.parts.push(part); // Thêm vào lô tổng
  }
  if (!isWaiting) part.available = false; // Có lô không còn chờ thì cả phần không chọn được
  part.expected_date = laterDate(part.expected_date, lot.expected_date); // Lấy ngày muộn hơn
  part.lot_ids.push(lot.id); // Ghi mã lô vào phần
  // Ghi chi tiết để hiển thị
  part.lines.push({ lot_id: lot.id, code: lot.code, item_name: lot.item_name, quantity: lot.received_quantity });
}

const laterDate = (a, b) => [a, b].sort().at(-1); // Ngày muộn hơn trong hai ngày

async function groupMaterialLots(db, waitingLots) { // Gom nguyên vật liệu theo nguồn
  const materials = waitingLots.filter((l) => l.kind === "MATERIAL"); // Chỉ lấy nguyên vật liệu
  // Đơn mua trực tiếp trước, kế hoạch mua sau
  return [...groupDirectPurchases(materials), ...(await groupPurchasePlans(db, materials))];
}

function groupDirectPurchases(materials) { // Gom theo đơn mua lập trực tiếp
  const groups = new Map(); // Mã đơn mua → nguồn
  // Lô không có kế hoạch mua nhưng có đơn mua
  for (const lot of materials.filter((l) => !l.purchase_plan_id && l.purchase_order_ref)) {
    const key = "PO:" + lot.purchase_order_ref; // Mã nguồn dạng PO:số
    if (!groups.has(key)) // Chưa có thì tạo nguồn
      groups.set(key, { // Tạo nguồn mới
        id: key, // Mã (id)
        code: "đơn mua lập trực tiếp · " + lot.purchase_order_code, // Mã
        purchase_plan_id: null, // Mã kế hoạch mua
        expected_date: lot.expected_date, // Ngày dự kiến
        lot_ids: [], // Danh sách mã lô
        lines: [], // Danh sách chi tiết
        eligible_lots: [], // Các phần lô được chọn
      });
    const group = groups.get(key); // Lấy nguồn
    group.lot_ids.push(lot.id); // Thêm mã lô
    // Thêm chi tiết
    group.lines.push({ lot_id: lot.id, item_name: lot.item_name, quantity: lot.received_quantity, code: lot.code });
    group.eligible_lots.push(lotChoice(lot)); // Thêm vào danh sách được chọn
  }
  return [...groups.values()]; // Trả danh sách nguồn
}

async function groupPurchasePlans(db, materials) { // Các kế hoạch mua đã duyệt
  const [plans] = await db.execute( // Đọc kế hoạch mua
    "SELECT id,code,planned_date FROM business_plans" + // Cột cần lấy
      // Chỉ kế hoạch MUA đã duyệt hoặc đang thực hiện
      " WHERE type='PURCHASE' AND status IN ('APPROVED','IN_PROGRESS') ORDER BY id DESC LIMIT 100",
  );
  return plans.map((plan) => ({ // Mỗi kế hoạch thành một nguồn
    id: "PLAN:" + plan.id, // Mã nguồn dạng PLAN:số
    code: "nguyên vật liệu dự kiến · " + plan.code, // Mã
    purchase_plan_id: String(plan.id), // Mã kế hoạch mua
    expected_date: dateOnly(plan.planned_date), // Ngày dự kiến
    lot_ids: [], // Danh sách mã lô
    lines: [], // Danh sách chi tiết
    // Các phần lô đã nhận của kế hoạch này
    eligible_lots: materials.filter((l) => String(l.purchase_plan_id) === String(plan.id)).map(lotChoice),
  }));
}

// Thông tin một phần lô để chọn
const lotChoice = (lot) => ({ id: lot.id, name: lot.name, expected_date: lot.expected_date });

// Bước 4-6: kiểm tra và tạo đợt (chạy trong giao dịch của TaskService)
async function createCampaign(pool, db, user, body, assigneeIds, requestId) {
  // Chỉ nhận hai nhóm hàng
  invalid(!["MATERIAL", "FINISHED_PRODUCT"].includes(body.inspection_type), "Chọn kiểm tra thành phẩm hoặc kiểm tra nguyên vật liệu.");
  const author = chooseMinuteAuthor(body, assigneeIds); // Chọn người lập biên bản

  const sources = await loadSources(db); // Đọc lại các lô có thể kiểm ngay lúc lưu
  const chosen = body.inspection_type === "FINISHED_PRODUCT" // Kiểm tra lô được chọn
    ? chooseFinishedLots(sources.finished_lots, body) // Thành phẩm
    : chooseMaterialLots(sources.material_lots, body); // Nguyên vật liệu

  // Lưu đợt bằng dịch vụ kiểm tra chất lượng
  const campaign = await new QualityCampaignService(pool).create(user, {
    campaign_type: "QUALITY_CHECK", // Loại đợt
    quality_kind: body.inspection_type, // Nhóm hàng
    ...chosen, // Nguồn và các lô được chọn
    planned_date: scheduleDates.localDay(body.start_at), // Ngày kiểm theo giờ Việt Nam
    start_at: body.start_at, // Giờ bắt đầu
    end_at: body.end_at, // Giờ kết thúc
    location: body.location || DEFAULT_LOCATION, // Không nhập thì dùng địa điểm mặc định
    note: body.description || "", // Ghi chú
    assignee_ids: assigneeIds, // Nhân viên được giao
  }, requestId, db); // db: dùng chung giao dịch đang mở

  // Ghi phạm vi kiểm theo vai trò người được giao
  await inspectionScope.sync(db, campaign.id, assigneeIds);
  // Ghi người lập biên bản
  await db.execute("UPDATE stocktakes SET NguoiLapBienBanDuocChon=? WHERE id=?", [author, campaign.id]);
  return { ...campaign, NguoiLapBienBanDuocChon: String(author) }; // Trả đợt vừa tạo
}

function chooseMinuteAuthor(body, assigneeIds) { // Chọn người lập biên bản chung
  // Chỉ giao một người thì người đó lập
  const onlyOne = assigneeIds.length === 1 ? assigneeIds[0] : null;
  const author = body.minute_author_id || onlyOne; // Người được chọn trên form, hoặc người duy nhất
  // Phải nằm trong danh sách được giao
  invalid(!assigneeIds.includes(String(author)), "Chọn một nhân viên được phân công để lập biên bản chung.");
  return author; // Trả người lập
}

function chooseFinishedLots(finishedLots, body) { // Kiểm tra lựa chọn thành phẩm
  const group = finishedLots.find((g) => g.id === String(body.lot_header_id)); // Tìm lô tổng được chọn
  const reportIds = body.finished_report_ids; // Các phần được chọn
  // Phải có từ 1 đến 100 phần, không trùng
  const validList = Array.isArray(reportIds) && reportIds.length > 0 && reportIds.length <= 100 && !hasDuplicate(reportIds);
  // Sai thì báo lỗi
  invalid(!group || !validList, "Chọn lô và từng phần theo báo cáo thành phẩm đã gửi.");

  const lotIds = []; // Các lô sẽ kiểm
  for (const reportId of reportIds) { // Duyệt từng phần được chọn
    const part = group.parts.find((p) => p.id === String(reportId)); // Tìm phần trong lô tổng
    // Không thuộc lô hoặc đã giao kiểm thì báo lỗi
    invalid(!part || !part.available, "Phần được chọn không thuộc lô, chưa gửi báo cáo hoặc đã được giao kiểm tra.");
    lotIds.push(...part.lot_ids); // Thêm các lô của phần
  }
  return { source_mode: "ACTUAL", lot_ids: lotIds }; // Trả nguồn là lô thực tế
}

function chooseMaterialLots(materialLots, body) { // Kiểm tra lựa chọn nguyên vật liệu
  const material = materialLots.find((g) => g.id === body.material_source); // Tìm nguồn được chọn
  // Không có thì báo lỗi
  invalid(!material, "Chọn lô nguyên vật liệu theo kế hoạch mua đã duyệt hoặc đơn mua lập trực tiếp.");

  let lotIds = material.lot_ids; // Mặc định lấy mọi phần lô của nguồn
  if (body.material_lot_ids !== undefined) { // Form có gửi danh sách phần lô
    checkMaterialLotIds(material, body.material_lot_ids); // Kiểm tra danh sách
    lotIds = body.material_lot_ids.map(String); // Dùng danh sách đó
  }
  if (material.id.startsWith("PLAN:")) // Nguồn là kế hoạch mua
    // Ghi kèm mã kế hoạch
    return { source_mode: "PURCHASE_PLAN", source_plan_id: material.purchase_plan_id, lot_ids: lotIds };
  return { source_mode: "ACTUAL", lot_ids: lotIds }; // Nguồn là đơn mua trực tiếp
}

function checkMaterialLotIds(material, lotIds) { // Kiểm tra danh sách phần lô
  // Phải là danh sách, tối đa 100, không trùng
  invalid(!Array.isArray(lotIds) || lotIds.length > 100 || hasDuplicate(lotIds), "Danh sách phần lô nguyên vật liệu không hợp lệ.");
  const eligibleIds = material.eligible_lots.map((lot) => lot.id); // Các phần lô được phép chọn
  invalid(lotIds.some((id) => !eligibleIds.includes(String(id))), // Có phần lô không được phép?
    "Phần lô không thuộc nguồn đã chọn, đã giao kiểm tra hoặc không còn chờ QC."); // Thông báo lỗi
  // Có hàng thì phải chọn ít nhất một phần
  invalid(eligibleIds.length > 0 && !lotIds.length, "Chọn ít nhất một phần lô nguyên vật liệu đã nhận.");
}

// Danh sách có phần tử trùng không?
const hasDuplicate = (ids) => new Set(ids.map(String)).size !== ids.length;

module.exports = { loadSources, createCampaign }; // Cho TaskService dùng
```

## 19. src/modules/tasks/inspection-scope.js

**Trích: đợt kiểm số lượng hay chất lượng**

```js
const C=require('../../services/domain/core'); // Hàm kiểm tra dùng chung
async function infer(c,ids){ // Đợt kiểm gì, dựa vào vai trò người được giao
  // Đọc vai trò của những người được giao
  const [roles]=await c.execute('SELECT DISTINCT r.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id IN ('+ids.map(()=>'?').join(',')+") AND r.code IN ('STOCKTAKER','QC_INSPECTOR')",ids);
  // Có Ban kiểm kê thì kiểm số lượng, có QA/QC thì kiểm chất lượng
  return {count:roles.some(r=>r.code==='STOCKTAKER'),quality:roles.some(r=>r.code==='QC_INSPECTOR')};
}
async function sync(c,id,ids){ // Ghi phạm vi kiểm vào đợt
  const scope=await infer(c,ids); // Tính phạm vi
  // Lưu vào đợt
  await c.execute('UPDATE stocktakes SET KiemSoLuong=?,KiemChatLuong=? WHERE id=?',[scope.count,scope.quality,id]);
  return scope; // Trả phạm vi
}
```

---

# UC-08 Quản lý nhập kho và UC-09 Quản lý xuất kho

Thứ tự gọi khi xem: `ModuleRoutes.js` → `warehouse-management.js`; phần phiếu đã ghi sổ: `actor-workspace.js`.

Thứ tự gọi khi phân công: `workflow-forms.js` (nút) → `uc08-09-phan-cong-kho.js` (giao diện) → `ModuleRoutes.js` → `WarehouseFlowService.js` → `uc08-09-xem-truoc.js` (mở form) hoặc `uc08-09-phan-cong-kho.js` (lưu) → `uc08-09-kiem-tra.js` → `assigned-positions.js` (thông báo).

## 20. src/shared/ModuleRoutes.js

**Trích: các địa chỉ của UC-08/09**

```js
for(const resource of ['warehouse-inbound','warehouse-outbound']){ // Hai màn: nhập kho và xuất kho
 // Danh sách, gọi warehouse-management.list
 router.get('/'+resource,role(['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']),async(req,res)=>{const r=await require('./warehouse-management').list(runtime,req.user,resource,req.query);ok(req,res,r.data,200,r.meta);});
 // Chi tiết, gọi warehouse-management.get
 router.get('/'+resource+'/:id',role(['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']),async(req,res)=>ok(req,res,await require('./warehouse-management').get(runtime,req.user,resource,req.params.id)));
}

// ... (bỏ qua phần không thuộc UC này) ...

router.get( // Nhận yêu cầu xem
  "/stock-requests/:id/allocations", // Dữ liệu mở form phân công
  role(["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]), // Quản lý kho và Nhân viên kho
  async (req, res) => // Hàm xử lý yêu cầu
    ok( // Trả kết quả theo mẫu chung
      req, // Yêu cầu của người dùng
      res, // Phản hồi trả về
      // Gọi WarehouseFlowService.preview
      await runtime.warehouseFlow.preview(req.user, req.params.id, req.query),
    ),
);

// ... (bỏ qua phần không thuộc UC này) ...

router.post( // Nhận yêu cầu gửi lên
  "/stock-requests/:id/dispatch", // Lưu phân công
  role(["WAREHOUSE_MANAGER"]), // Chỉ Quản lý kho
  async (req, res) => // Hàm xử lý yêu cầu
    ok( // Trả kết quả theo mẫu chung
      req, // Yêu cầu của người dùng
      res, // Phản hồi trả về
      await runtime.warehouseFlow.dispatch( // Gọi WarehouseFlowService.dispatch
        req.user, // Người đăng nhập
        req.params.id, // Mã trên địa chỉ
        req.body, // Dữ liệu gửi lên
        req.get("Idempotency-Key"), // Khóa chống gửi trùng
        req.request_id, // Mã yêu cầu để ghi nhật ký
      ),
    ),
);

// ... (bỏ qua phần không thuộc UC này) ...

router.post( // Nhận yêu cầu gửi lên
  "/tasks/:id/cancelAllocation", // Hủy phân công
  role(["WAREHOUSE_MANAGER"]), // Chỉ Quản lý kho
  async (req, res) => // Hàm xử lý yêu cầu
    ok( // Trả kết quả theo mẫu chung
      req, // Yêu cầu của người dùng
      res, // Phản hồi trả về
      await runtime.warehouseFlow.cancelAllocation( // Gọi WarehouseFlowService.cancelAllocation
        req.user, // Người đăng nhập
        req.params.id, // Mã trên địa chỉ
        req.body, // Dữ liệu gửi lên
        req.request_id, // Mã yêu cầu để ghi nhật ký
      ),
    ),
);
```

## 21. src/shared/warehouse-management.js

**Danh sách và chi tiết yêu cầu nhập / xuất**

```js
// Hàm kiểm tra dùng chung và kiểm tra quyền
const C=require('../services/domain/core'),P=require('../services/domain/policy');
// Màn nhập kho là IN, màn xuất kho là OUT
const direction=resource=>resource==='warehouse-inbound'?'IN':'OUT';
async function list(runtime,user,resource,query){ // UC-08/09: danh sách yêu cầu nhập hoặc xuất
 P.role(user,['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']); // Chỉ Quản lý kho và Nhân viên kho
 // Lấy danh sách yêu cầu, lọc theo nhập / xuất
 return runtime.stockRequests.list(user,{...query,type:direction(resource)});
}
async function get(runtime,user,resource,id){ // UC-08/09: chi tiết một yêu cầu
 P.role(user,['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']); // Chỉ Quản lý kho và Nhân viên kho
 const row=await runtime.stockRequests.get(user,id); // Đọc yêu cầu
 // Mở sai màn (nhập mở ở màn xuất) thì báo không tìm thấy; đúng thì trả về
 C.fail(row.type!==direction(resource),'NOT_FOUND','Không tìm thấy hồ sơ trong nghiệp vụ này.',404);return row;
}
module.exports={direction,list,get}; // Cho file khác dùng
```

## 22. public/js/actor-workspace.js

**Trích: phần "Phiếu đã ghi sổ" và tìm kiếm phiếu**

```js
async function history(){ // UC-08/09 bước 2: phần "Phiếu đã ghi sổ"
 if(!warehouseModules.includes(current))return; // Không phải màn nhập / xuất kho thì thôi
 // Tìm vùng hiển thị, chưa có thì tạo
 let section=document.querySelector('#warehouse-posted-history');if(!section){section=document.createElement('section');section.id='warehouse-posted-history';section.className='work-panel';document.querySelector('#content').append(section);}
 // Tiêu đề và lời nhắc
 section.innerHTML='<h2>Phiếu đã ghi sổ</h2><p class="subtitle">Đối chiếu kết quả thực hiện với các lần tiếp nhận và phân công phía trên.</p>';
 // UC-08/UC-09 luồng 3.1: ô Tìm kiếm của trang cũng lọc phiếu đã ghi sổ theo mã phiếu.
 const search=(document.querySelector('#q')?.value||'').trim(); // Từ khóa trong ô Tìm kiếm
 // Màn nhập lấy phiếu IN, màn xuất lấy phiếu OUT; gọi máy chủ kèm từ khóa
 try{const direction=current==='warehouse-inbound'?'IN':'OUT',result=await api('stock-documents?type='+direction+'&per_page=10'+(search?'&q='+encodeURIComponent(search):''));
  // Ngoại lệ 2.1: không có phiếu thì báo
  if(!result.data.length){section.insertAdjacentHTML('beforeend','<p class="hint">'+(search?'Không tìm thấy phiếu phù hợp với "'+esc(search)+'".':'Chưa có phiếu đã ghi sổ.')+'</p>');return;}
  const list=document.createElement('div');list.className='posted-document-list'; // Danh sách phiếu
  // Mỗi phiếu một nút; bấm thì mở chi tiết phiếu (bước 3-4)
  for(const r of result.data){const b=document.createElement('button');b.type='button';b.className='posted-document';b.innerHTML='<span><strong>'+esc(r.code)+'</strong><small>'+esc(format(r.posted_at,'posted_at'))+'</small></span><span>Xem phiếu →</span>';b.onclick=async()=>{try{detail((await api('stock-documents/'+r.id)).data);}catch(e){toast(e.message);}};list.append(b);}section.append(list);
 }catch(e){section.insertAdjacentHTML('beforeend',errorHTML(e));} // Lỗi thì hiện lỗi
}
```

## 23. public/js/workflow-forms.js

**Trích: nút Phân công**

```js
// Bấm nút "Phân công" thì mở form ở uc08-09-phan-cong-kho.js
if (action === "dispatch") return dispatchForm(r);
```

## 24. public/js/uc08-09-phan-cong-kho.js

**Giao diện: form phân công**

```js
async function dispatchForm(request) { // Mở form phân công (nút "Phân công" gọi hàm này)
  try {
    // Lấy lô, ô, tồn, phân công đang có; chờ xong
    const preview = (await api("stock-requests/" + request.id + "/allocations")).data;
    const users = await options("users"); // Lấy danh sách người dùng
    // Chỉ giữ nhân viên kho
    const staff = users.filter((user) => user.roles.includes("WAREHOUSE_STAFF"));
    warehouseDispatch.open({ request, preview, staff }); // Mở form
  } catch (error) { // Lỗi thì
    openModal("Phân công kho", errorHTML(error)); // Hiện hộp báo lỗi
  }
}

const warehouseDispatch = (() => { // Gom mọi hàm của form vào một chỗ
  const $ = (selector) => document.querySelector(selector); // Viết tắt: tìm phần tử trên trang
  const same = (a, b) => String(a) === String(b); // So sánh hai mã, không phân biệt số hay chữ
  const allRows = () => [...document.querySelectorAll("[data-dispatch]")]; // Mọi dòng phân bổ trên form
  // Tìm ô nhập trong một dòng phân bổ
  const field = (row, key) => row.querySelector(`[data-key="${key}"]`);
  // Rút gọn tên khu: "Khu A · bột" → "Khu bột"
  const zoneLabel = (zone) => (zone || "Khu chung").replace(/^Khu [A-Z] · /, "Khu ");
  // Tên ô: mã ô · khu
  const positionLabel = (location) => location.code + " · " + zoneLabel(location.zone_name);
  // Form thay đổi thì lần lưu sau là yêu cầu mới
  const newRetryKey = () => { retryKey = crypto.randomUUID(); };

  const toMilli = (value) => { // Đổi "1.5" thành 1500 (đơn vị 1/1000) để tính chính xác
    const [whole, fraction = ""] = String(value || "0").split("."); // Tách phần nguyên và phần thập phân
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0")); // Ghép lại thành số nguyên lớn
  };
  // Đổi ngược 1500 thành "1.500"
  const fromMilli = (n) => `${n / 1000n}.${String(n % 1000n).padStart(3, "0")}`;
  const sum = (values) => values.reduce((total, value) => total + value, 0n); // Cộng một danh sách số
  // Phần chưa ghi phiếu = được giao − đã ghi
  const pendingQuantity = (allocation) => toMilli(allocation.quantity) - toMilli(allocation.posted_quantity);

  function open(form) { // Dựng form
    const { request } = form; // Yêu cầu đang phân công
    openModal("Phân công kho · " + request.code, formHTML(request)); // Mở hộp thoại
    // Giờ kết thúc không trước giờ bắt đầu
    $("#f-start_at").onchange = () => { $("#f-end_at").min = $("#f-start_at").value; };
    $("#add-dispatch").onclick = () => { addRow(form); newRetryKey(); }; // Nút Thêm phân bổ

    // Các phân công còn phần chưa ghi phiếu
    const pending = currentAllocations(form).filter((a) => pendingQuantity(a) > 0n);
    pending.forEach((allocation) => addSavedRow(form, allocation)); // Hiện lại từng phân công cũ để sửa
    addMissingRows(form, pending); // Thêm dòng cho mặt hàng chưa phân công

    if (request.type === "OUT") addFillButton(form); // Xuất kho thì có nút bổ sung tự động
    // Bấm Lưu thì gửi lên máy chủ
    bindForm((data) => readForm(data, form), "stock-requests/" + request.id + "/dispatch");
  }

  const currentAllocations = (form) => form.preview.allocations || []; // Các phân công đang có

  function formHTML(request) { // Nội dung hộp thoại
    // Bảng lô nguồn nếu có
    const lots = request.source_lots?.length ? tableData(request.source_lots) : "";
    return ( // Ghép các phần
      // Lời nhắc
      '<div class="notice">Chọn nhân viên kho và kiểm tra lô, vị trí, số lượng được giao.</div>' +
      lots + // Bảng lô nguồn
      formWrap( // Form gồm
        timeFieldsHTML(request) + // Hai ô giờ
          '<div class="span2" id="dispatch-lines"></div>' + // Vùng chứa các dòng phân bổ
          // Nút thêm dòng
          '<button class="button" type="button" id="add-dispatch">＋ Thêm phân bổ</button>',
      )
    );
  }

  function timeFieldsHTML(request) { // Hai ô ngày giờ thực hiện, có gợi ý sẵn
    const halfHour = 30 * 60000; // Nửa giờ, tính bằng mili giây
    const now = Math.ceil(Date.now() / halfHour) * halfHour; // Làm tròn lên nửa giờ tới
    const requested = Date.parse(request.requested_at || ""); // Giờ xưởng đề nghị
    // Chưa qua thì dùng giờ đề nghị, qua rồi thì dùng nửa giờ tới
    const start = Number.isFinite(requested) && requested > now ? requested : now;
    // Đổi sang giờ Việt Nam để hiện trên ô
    const toInput = (ms) => new Date(ms + 7 * 3600000).toISOString().slice(0, 16);
    return (
      inputField("start_at", "datetime-local", true, [], toInput(start)) + // Giờ bắt đầu
      // Giờ kết thúc sau 2 giờ
      inputField("end_at", "datetime-local", true, [], toInput(start + 2 * 3600000))
    );
  }

  function addSavedRow(form, allocation) { // Hiện lại một phân công cũ
    // Thêm dòng với đúng mặt hàng, lô, ô
    const row = addRow(form, String(allocation.stock_request_line_id), String(allocation.lot_id), String(allocation.location_id));
    field(row, "assignee_id").value = String(allocation.user_id); // Chọn lại nhân viên
    field(row, "quantity").value = fromMilli(pendingQuantity(allocation)); // Điền số lượng còn lại
  }

  function addMissingRows(form, pending) { // Thêm dòng cho mặt hàng chưa phân công
    const waiting = form.preview.lines.filter( // Lọc dòng hàng
      // Còn phải làm và chưa có phân công
      (line) => toMilli(line.remaining_quantity) > 0n && !pending.some((a) => same(a.stock_request_line_id, line.id)),
    );
    waiting.forEach((line) => addRow(form, line.id)); // Mỗi dòng hàng thêm một dòng phân bổ
  }

  function addFillButton(form) { // Nút tự thêm lô theo thứ tự ưu tiên
    const button = document.createElement("button"); // Tạo nút
    button.type = "button"; // Không phải nút gửi form
    button.className = "button"; // Kiểu hiển thị
    button.textContent = "Bổ sung phân bổ theo hạn dùng và thứ tự nhập"; // Chữ trên nút
    $("#add-dispatch").after(button); // Đặt sau nút Thêm phân bổ
    button.onclick = () => { // Khi bấm
      // Thử thêm từng lô của từng dòng hàng
      for (const line of form.preview.lines) for (const lot of line.lots) addLotIfNeeded(form, line, lot);
      newRetryKey(); // Form đã đổi
    };
  }

  function addLotIfNeeded(form, line, lot) { // Thêm một lô nếu còn cần
    if (!stockOf(form, line, lot.id).length) return; // Lô hết hàng thì bỏ qua
    const row = addRow(form, line.id, lot.id); // Thêm dòng phân bổ
    // Không cần thêm (gợi ý bằng 0) thì bỏ dòng vừa thêm
    if (toMilli(field(row, "quantity").value) <= 0n) row.remove();
  }

  function readForm(data, form) { // Dữ liệu gửi lên máy chủ
    // Đổi giờ Việt Nam sang giờ chuẩn
    const toIso = (vietnamTime) => new Date(vietnamTime + "+07:00").toISOString();
    return {
      version: form.preview.request.version, // Phiên bản yêu cầu để chống ghi đè
      allocation_mode: "REPLACE_PENDING", // Thay các phân công chưa ghi phiếu
      start_at: toIso(data.start_at), // Giờ bắt đầu
      end_at: toIso(data.end_at), // Giờ kết thúc
      allocations: allRows().map(readRow), // Mọi dòng phân bổ
    };
  }

  function readRow(row) { // Đọc một dòng phân bổ
    const inputs = [...row.querySelectorAll("[data-key]")]; // Các ô nhập của dòng
    // Ghép thành { tên ô: giá trị }
    return Object.fromEntries(inputs.map((input) => [input.dataset.key, input.value]));
  }

  function freeQuantity(form, balance) { // Lượng còn phân công được tại một ô
    const available = toMilli(balance.available_quantity ?? balance.quantity); // Lượng khả dụng
    if (form.request.type !== "OUT") return available; // Nhập kho thì dùng luôn
    const ownHeld = currentAllocations(form).filter( // Xuất kho: phần đang giữ cho chính yêu cầu này
      // Cùng lô, cùng ô
      (a) => same(a.lot_id, balance.lot_id) && same(a.location_id, balance.location_id) && a.quality_bucket === "AVAILABLE",
    );
    // Cộng lại, vì lần lưu này sẽ thay các phân công đó
    return available + sum(ownHeld.map(pendingQuantity));
  }

  function stockOf(form, line, lotId) { // Các ô đang có hàng của một lô
    return line.balances.filter( // Lọc tồn kho
      // Đúng lô, hàng khả dụng, còn lượng
      (b) => same(b.lot_id, lotId) && b.quality_bucket === "AVAILABLE" && freeQuantity(form, b) > 0n,
    );
  }

  function eligibleLots(form, line) { // Các lô được chọn
    const usable = (lot) => // Lô có dùng được không?
      form.request.type === "IN" // Nhập kho
        ? toMilli(lot.passed_quantity) > toMilli(lot.posted_quantity) // Còn lượng đạt QC chưa nhập
        : stockOf(form, line, lot.id).length > 0; // Xuất kho: lô còn hàng
    return line.lots.filter(usable).sort(compareLots); // Lọc rồi xếp thứ tự ưu tiên
  }

  function compareLots(a, b) { // Thứ tự ưu tiên của lô
    // Hạn dùng; không có thì coi như rất xa
    const expiry = (lot) => String(lot.expiry_date || "9999-12-31").slice(0, 10);
    const received = (lot) => Date.parse(lot.first_received_at || "9999-12-31"); // Ngày nhập kho
    // Hạn gần trước, rồi nhập trước, rồi mã nhỏ trước
    return expiry(a).localeCompare(expiry(b)) || received(a) - received(b) || Number(a.id) - Number(b.id);
  }

  function addRow(form, lineId = null, lotId = null, locationId = null) { // Thêm một dòng phân bổ
    const row = document.createElement("div"); // Tạo khung dòng
    row.className = "form-section"; // Kiểu hiển thị
    row.dataset.dispatch = "true"; // Đánh dấu đây là dòng phân bổ
    row.innerHTML = rowHTML(form); // Vẽ các ô nhập

    const state = { form, row, lotId, locationId, line: null, lots: [] }; // Nhớ trạng thái của dòng
    field(row, "stock_request_line_id").onchange = () => changeLine(state); // Đổi dòng hàng
    field(row, "lot_id").onchange = () => changeLot(state); // Đổi lô
    field(row, "location_id").onchange = () => updateQuantity(state); // Đổi ô
    row.querySelector("button").onclick = () => { row.remove(); newRetryKey(); }; // Nút Xóa phân bổ

    $("#dispatch-lines").append(row); // Gắn dòng vào form
    if (lineId) field(row, "stock_request_line_id").value = lineId; // Chọn sẵn dòng hàng nếu có
    changeLine(state); // Nạp lô, ô và số lượng
    return row; // Trả dòng vừa thêm
  }

  function rowHTML(form) { // HTML của một dòng phân bổ
    const lineOptions = form.preview.lines // Các dòng hàng để chọn
      // Tên hàng và lượng còn phải làm
      .map((l) => `<option value="${l.id}">${esc(l.item_name)} · còn ${esc(format(l.remaining_quantity))} ${esc(l.unit || "")}</option>`)
      .join(""); // Nối lại
    // Các nhân viên kho để chọn
    const staffOptions = form.staff.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("");
    // Nhãn ô theo nhập / xuất
    const locationTitle = form.request.type === "IN" ? "Ô nhập hàng" : "Ô lấy hàng";
    return ( // Ghép các ô nhập
      '<div class="form-grid">' + // Khung các ô nhập
      // Dòng hàng
      `<div class="field"><label>Dòng hàng</label><select aria-label="Dòng hàng" data-key="stock_request_line_id">${lineOptions}</select></div>` +
      // Nhân viên kho
      `<div class="field"><label>Nhân viên kho</label><select aria-label="Nhân viên kho" data-key="assignee_id">${staffOptions}</select></div>` +
      // Lô
      '<div class="field"><label>Lô</label><select aria-label="Lô phân công" data-key="lot_id"></select></div>' +
      // Ô trong kho
      `<div class="field"><label>${locationTitle}</label><select aria-label="Vị trí phân công" data-key="location_id"></select></div>` +
      // Số lượng
      '<div class="field"><label>Số lượng</label><input aria-label="Số lượng phân công" data-key="quantity" type="number" min="0.001" step="0.001" required value="1"></div>' +
      // Chất lượng: luôn là hàng khả dụng
      '<div class="field"><label>Chất lượng</label><input type="hidden" data-key="quality_bucket" value="AVAILABLE"><input aria-label="Chất lượng" value="Khả dụng" readonly></div>' +
      '</div><button class="button small danger" type="button">Xóa phân bổ</button>' // Nút xóa dòng
    );
  }

  const isInbound = (state) => state.form.request.type === "IN"; // Yêu cầu này là nhập kho?
  // Lô đang chọn
  const chosenLot = (state) => state.lots.find((lot) => lot.id === field(state.row, "lot_id").value);
  const chosenLocationId = (state) => field(state.row, "location_id").value; // Ô đang chọn

  function changeLine(state) { // Khi đổi dòng hàng
    const { form, row } = state; // Lấy form và dòng
    const lineId = field(row, "stock_request_line_id").value; // Mã dòng hàng đang chọn
    state.line = form.preview.lines.find((line) => line.id === lineId); // Thông tin dòng hàng
    state.lots = eligibleLots(form, state.line); // Các lô chọn được

    field(row, "lot_id").innerHTML = state.lots.map(lotOptionHTML).join(""); // Nạp ô chọn lô
    // Chọn lại lô ban đầu nếu còn
    if (state.lotId && state.lots.some((lot) => lot.id === state.lotId)) field(row, "lot_id").value = state.lotId;
    fillLocations(row, state.line.locations); // Nạp ô chọn vị trí
    // Chọn lại ô ban đầu nếu có
    if (state.locationId) field(row, "location_id").value = String(state.locationId);
    changeLot(state); // Cập nhật tiếp theo lô
  }

  function lotOptionHTML(lot) { // Một lựa chọn lô
    // Kèm hạn sử dụng
    const expiry = lot.expiry_date ? " · HSD " + esc(format(lot.expiry_date, "expiry_date")) : " · Chưa có HSD";
    return `<option value="${lot.id}">${esc(lot.code)}${expiry}</option>`; // HTML của lựa chọn
  }

  function fillLocations(row, locations) { // Nạp danh sách ô
    field(row, "location_id").innerHTML = locations // Ô chọn vị trí
      // Mỗi ô một lựa chọn
      .map((location) => `<option value="${location.id}">${esc(positionLabel(location))}</option>`)
      .join(""); // Nối lại
  }

  function changeLot(state) { // Khi đổi lô
    const lot = chosenLot(state); // Lô đang chọn
    // Nhập kho: chọn ô hệ thống gợi ý
    if (isInbound(state) && lot?.suggested_location_id) field(state.row, "location_id").value = lot.suggested_location_id;
    if (!isInbound(state)) showStockedLocations(state, lot); // Xuất kho: chỉ hiện ô có hàng
    updateQuantity(state); // Tính lại số lượng
    showHint(state, lot); // Hiện lời nhắc
  }

  function showStockedLocations(state, lot) { // Xuất kho: chỉ hiện các ô đang có hàng của lô
    const { form, row, line } = state; // Lấy form, dòng và dòng hàng
    const current = chosenLocationId(state); // Ô đang chọn
    const stocked = lot && stockOf(form, line, lot.id); // Các ô có hàng của lô
    // Chỉ giữ ô có hàng
    const choices = lot ? line.locations.filter((l) => stocked.some((b) => same(b.location_id, l.id))) : line.locations;
    // Ô này có trong danh sách không?
    const has = (id) => choices.some((location) => same(location.id, id));

    fillLocations(row, choices); // Nạp lại ô chọn vị trí
    if (has(current)) field(row, "location_id").value = current; // Ô cũ còn hợp lệ thì giữ
    // Không thì dùng ô ban đầu
    else if (state.locationId && has(state.locationId)) field(row, "location_id").value = String(state.locationId);
    // Không nữa thì lấy ô đầu tiên
    else if (choices.length) field(row, "location_id").value = String(choices[0].id);
  }

  function showHint(state, lot) { // Hiện lời nhắc dưới dòng
    let hint = state.row.querySelector(".queue-hint"); // Tìm lời nhắc có sẵn
    if (!hint) { // Chưa có thì tạo
      hint = document.createElement("p"); // Tạo đoạn chữ
      hint.className = "queue-hint"; // Đặt class
      state.row.append(hint); // Gắn vào cuối dòng
    }
    hint.textContent = isInbound(state) // Nội dung lời nhắc
      ? lot?.storage_hint || "Chọn ô nhập hàng." // Nhập kho: lý do gợi ý ô
      // Xuất kho: nhắc thứ tự ưu tiên lô
      : "Lô được xếp theo hạn dùng gần nhất; đây là gợi ý. Bạn có thể chọn lô khác còn khả dụng và vị trí có hàng.";
  }

  function updateQuantity(state) { // Tính số lượng gợi ý
    const lot = chosenLot(state); // Lô đang chọn
    if (!isInbound(state)) moveToStockedLocation(state, lot); // Xuất kho: chuyển sang ô có hàng nếu cần

    // Lượng của lô − phần dòng khác đã lấy
    const fromLot = lotQuantity(state, lot) - draftedOfLot(state, lot);
    // Lượng yêu cầu còn lại − phần dòng khác đã giao
    const fromLine = toMilli(state.line.remaining_quantity) - draftedOfLine(state);
    let quantity = fromLine < fromLot ? fromLine : fromLot; // Lấy số nhỏ hơn
    if (quantity < 0n) quantity = 0n; // Không cho âm

    const input = field(state.row, "quantity"); // Ô số lượng
    input.value = fromMilli(quantity); // Điền số gợi ý
    input.max = fromMilli(quantity); // Không cho nhập quá
    showMap(state); // Vẽ lại sơ đồ
  }

  function moveToStockedLocation(state, lot) { // Ô đang chọn hết hàng thì đổi ô
    if (!lot) return; // Chưa chọn lô thì thôi
    const stocked = stockOf(state.form, state.line, lot.id); // Các ô có hàng
    // Ô đang chọn có hàng thì giữ
    if (stocked.some((b) => same(b.location_id, chosenLocationId(state)))) return;
    // Không thì chuyển sang ô đầu tiên có hàng
    if (stocked.length) field(state.row, "location_id").value = String(stocked[0].location_id);
  }

  function lotQuantity(state, lot) { // Lượng của lô dùng được
    if (!lot) return 0n; // Chưa chọn lô thì bằng 0
    // Nhập kho: đạt QC − đã nhập
    if (isInbound(state)) return toMilli(lot.passed_quantity) - toMilli(lot.posted_quantity);
    const balances = state.line.balances.filter( // Xuất kho: tồn của lô tại ô
      // Đúng lô, đúng ô, hàng khả dụng
      (b) => same(b.lot_id, lot.id) && same(b.location_id, chosenLocationId(state)) && b.quality_bucket === "AVAILABLE",
    );
    return sum(balances.map((b) => freeQuantity(state.form, b))); // Cộng lại
  }

  const otherRows = (state) => allRows().filter((row) => row !== state.row); // Các dòng phân bổ khác
  // Tổng số lượng của một nhóm dòng
  const drafted = (rows) => sum(rows.map((row) => toMilli(field(row, "quantity").value)));

  function draftedOfLot(state, lot) { // Dòng khác đã lấy bao nhiêu của lô này
    const locationId = chosenLocationId(state); // Ô đang chọn
    return drafted(otherRows(state).filter((row) => // Cộng các dòng
      // Cùng lô (xuất kho thì cùng cả ô)
      field(row, "lot_id").value === lot?.id && (isInbound(state) || field(row, "location_id").value === locationId)));
  }

  function draftedOfLine(state) { // Dòng khác đã giao bao nhiêu của dòng hàng này
    // Cộng các dòng cùng dòng hàng
    return drafted(otherRows(state).filter((row) => field(row, "stock_request_line_id").value === state.line.id));
  }

  function showMap(state) { // Vẽ sơ đồ kho
    // Vùng chứa sơ đồ
    const holder = childOf(state.row.querySelector(".form-grid"), "warehouse-dispatch-map", "div");
    const fold = document.createElement("details"); // Khối đóng mở được
    fold.className = "warehouse-position-picker"; // Kiểu hiển thị
    fold.open = holder.querySelector("details")?.open || false; // Giữ trạng thái đang mở
    fold.innerHTML = '<summary class="button small">Xem vị trí trong kho</summary>'; // Chữ để bấm mở
    fold.append(seatMap(state, holder)); // Thêm sơ đồ ô
    holder.replaceChildren(fold, captionOf(state)); // Thay nội dung cũ

    showItemTitle(state); // Hiện tên mặt hàng
    if (!isInbound(state)) showLotQueue(state); // Xuất kho: hiện bảng lô ưu tiên
  }

  function childOf(parent, className, tag) { // Lấy phần tử con, chưa có thì tạo
    let child = parent.querySelector("." + className); // Tìm theo class
    if (!child) { // Chưa có
      child = document.createElement(tag); // Tạo phần tử
      child.className = className; // Đặt class
      parent.append(child); // Gắn vào cuối
    }
    return child; // Trả phần tử
  }

  function seatMap(state, holder) { // Tạo sơ đồ ô
    const { form, line } = state; // Lấy form và dòng hàng
    const lot = chosenLot(state); // Lô đang chọn
    const inbound = isInbound(state); // Là nhập kho?
    // Các ô có hàng của lô
    const stockedIds = lot ? stockOf(form, line, lot.id).map((b) => String(b.location_id)) : [];
    const locations = line.locations.map((location) => ({ // Thông tin từng ô
      ...location, // Giữ nguyên các thông tin khác
      // Hàng đang có trong ô
      stock: line.balances.filter((b) => same(b.location_id, location.id) && freeQuantity(form, b) > 0n),
      // Nhập chọn ô nào cũng được; xuất chỉ ô có hàng
      selectable: inbound || stockedIds.includes(String(location.id)),
    }));
    return createWarehouseSeatMap({ // Vẽ sơ đồ bằng hàm dùng chung
      locations, // Danh sách ô
      selectedId: chosenLocationId(state), // Ô đang chọn
      suggestedId: inbound ? lot?.suggested_location_id : null, // Ô gợi ý khi nhập
      suggestedIds: inbound ? lot?.suggested_location_ids || [] : stockedIds, // Các ô tô đậm
      onSelect: (location) => { // Khi bấm một ô
        field(state.row, "location_id").value = String(location.id); // Chọn ô đó
        updateQuantity(state); // Tính lại số lượng
        newRetryKey(); // Form đã đổi
      },
      onZone: (name) => { // Khi bấm tên khu
        // Hiện tên khu
        holder.querySelector(".warehouse-dispatch-selection").textContent = name.replace(/^Khu [A-Z] · /, "Khu ");
      },
    });
  }

  function captionOf(state) { // Dòng chữ ô đang chọn
    const location = state.line.locations.find((l) => String(l.id) === chosenLocationId(state)); // Tìm ô
    const caption = document.createElement("p"); // Tạo đoạn chữ
    caption.className = "warehouse-dispatch-selection"; // Kiểu hiển thị
    // "Nhập vào: ..." hoặc "Lấy hàng tại: ..."
    caption.textContent = (isInbound(state) ? "Nhập vào: " : "Lấy hàng tại: ") + (location ? positionLabel(location) : "Chưa chọn ô");
    return caption; // Trả đoạn chữ
  }

  function showItemTitle(state) { // Tiêu đề tên mặt hàng
    let title = state.row.querySelector(".dispatch-item-title"); // Tìm tiêu đề có sẵn
    if (!title) { // Chưa có thì tạo
      title = document.createElement("h3"); // Tạo tiêu đề
      title.className = "dispatch-item-title"; // Đặt class
      state.row.prepend(title); // Gắn vào đầu dòng
    }
    title.textContent = state.line.item_name; // Điền tên mặt hàng
  }

  function showLotQueue(state) { // Bảng lô ưu tiên khi xuất kho
    let queue = state.row.querySelector(".dispatch-line-queue"); // Tìm bảng có sẵn
    if (!queue) { // Chưa có thì tạo
      queue = document.createElement("section"); // Tạo vùng bảng
      queue.className = "dispatch-line-queue"; // Đặt class
      state.row.querySelector(".form-grid").after(queue); // Đặt sau các ô nhập
    }
    queue.innerHTML = // Vẽ bảng
      // Tiêu đề và lời nhắc
      '<h4>Lô xuất đề xuất</h4><p class="queue-hint">Thứ tự ưu tiên gợi ý theo hạn dùng gần nhất; quản lý vẫn có thể chọn lô khác còn khả dụng.</p>' +
      // Hàng tiêu đề của bảng
      '<div class="table-wrap"><table><thead><tr><th>Ưu tiên</th><th>Lô</th><th>Hạn dùng</th><th>Có thể xuất</th><th></th></tr></thead><tbody>' +
      state.lots.map((lot, index) => queueRowHTML(state, lot, index)).join("") + // Mỗi lô một hàng
      "</tbody></table></div>"; // Đóng bảng
    queue.querySelectorAll("[data-queue-lot]").forEach((button) => { // Các nút Chọn lô
      button.onclick = () => { // Khi bấm
        const select = field(state.row, "lot_id"); // Ô chọn lô
        select.value = button.dataset.queueLot; // Chọn lô của nút đó
        select.dispatchEvent(new Event("change")); // Báo là lô đã đổi
      };
    });
  }

  function queueRowHTML(state, lot, index) { // Một hàng của bảng lô
    const chosen = lot.id === chosenLot(state)?.id; // Lô này đang được chọn?
    // Tồn khả dụng của lô
    const balances = state.line.balances.filter((b) => same(b.lot_id, lot.id) && b.quality_bucket === "AVAILABLE");
    const available = sum(balances.map((b) => freeQuantity(state.form, b))); // Tổng lượng có thể xuất
    return (
      `<tr class="${chosen ? "queue-selected" : ""}">` + // Tô đậm nếu đang chọn
      `<td>${index + 1}</td><td>${esc(lot.code)}</td>` + // Thứ tự ưu tiên và mã lô
      // Hạn dùng
      `<td>${esc(lot.expiry_date ? format(lot.expiry_date, "expiry_date") : "Chưa ghi nhận")}</td>` +
      // Lượng có thể xuất
      `<td>${esc(format(fromMilli(available)))} ${esc(state.line.unit || "")}</td>` +
      // Nút chọn lô
      `<td><button class="button small" type="button" data-queue-lot="${esc(lot.id)}">${chosen ? "Đang chọn" : "Chọn lô"}</button></td></tr>`
    );
  }

  return { open }; // Bên ngoài chỉ dùng hàm open
})(); // Chạy ngay hàm bọc
```

## 25. src/modules/warehouse/WarehouseFlowService.js

**Trích: điểm vào ở máy chủ**

```js
class WarehouseFlowService { // Dịch vụ kho: điểm vào của phân công và ghi phiếu
  constructor(pool, requests) { // Nhận kết nối CSDL và dịch vụ yêu cầu kho
    this.pool = pool; // Lưu kết nối
    this.requests = requests; // Lưu dịch vụ yêu cầu kho
  }

  transaction(work) { // Chạy giao dịch
    return transaction(this.pool, work); // Dùng hàm chung transaction.js
  }

  preview(user, requestId, query) { // Dữ liệu mở form phân công
    return previewRequest(this, user, requestId, query); // Gọi uc08-09-xem-truoc.js
  }

  dispatch(user, requestId, body, key, auditId) { // Lưu phân công
    return dispatchRequest(this, user, requestId, body, key, auditId); // Gọi uc08-09-phan-cong-kho.js
  }

  cancelAllocation(user, taskId, body, auditId) { // Hủy phân công
    return cancelAllocation(this, user, taskId, body, auditId); // Gọi uc08-09-phan-cong-kho.js
  }
```

## 26. src/modules/warehouse/uc08-09-xem-truoc.js

**Dữ liệu để mở form**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const P = require("../../services/domain/policy"); // Hàm kiểm tra quyền
const storageQueue = require("../../shared/storage-queue"); // Hàm gợi ý ô và xếp thứ tự lô
// Điều kiện lô thuộc báo cáo của kế hoạch bán
const saleReportScope = require("../../shared/sale-report-scope");

const isId = (value) => /^[1-9]\d*$/.test(String(value)); // Có phải số nguyên dương không?
const same = (a, b) => String(a) === String(b); // So sánh hai mã
const withTextId = (row) => ({ ...row, id: String(row.id) }); // Đổi mã sang chữ
// Đổi các mã của lô sang chữ
const lotDto = (lot) => ({ ...lot, id: String(lot.id), item_id: String(lot.item_id) });
// Đổi các mã của tồn kho sang chữ
const balanceDto = (balance) => ({ ...balance, lot_id: String(balance.lot_id), location_id: String(balance.location_id) });

// Dữ liệu để mở form phân công / ghi phiếu
async function previewRequest(flow, user, requestId, query = {}) {
  P.role(user, ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]); // Chỉ Quản lý kho và Nhân viên kho
  C.fields(query, ["task_id"]); // Chỉ nhận tham số task_id
  // task_id phải hợp lệ
  if (query.task_id) C.fail(!isId(query.task_id), "VALIDATION_ERROR", "Công việc không hợp lệ.");

  const db = flow.pool; // Kết nối CSDL
  const isManager = user.roles.includes("WAREHOUSE_MANAGER"); // Người xem là quản lý kho?
  const request = await flow.requests.load(db, user, requestId); // Đọc yêu cầu, kiểm tra quyền xem
  // Yêu cầu mua không có phiếu kho
  C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không ghi phiếu kho.", 409);
  // Quản lý kho phải là người phụ trách
  C.fail(isManager && !same(request.manager_id, user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);

  const detail = await flow.requests.get(user, requestId); // Chi tiết yêu cầu
  const locations = await loadLocations(db, request.warehouse_id); // Các ô trong kho
  const categoryOf = await loadItemCategories(db); // Mặt hàng thuộc nhóm nào
  const lots = await loadLots(db, request, requestId); // Các lô dùng được
  await suggestLocations(db, lots, locations, categoryOf, request.warehouse_id); // Gợi ý ô cho từng lô
  const balances = await loadBalances(db, request.warehouse_id); // Tồn kho từng ô
  const allocations = await loadAllocations(db, requestId, query.task_id); // Các phân công đang có
  // Nhân viên chỉ thấy phần của mình
  const visible = isManager ? allocations : allocations.filter((a) => same(a.user_id, user.id));
  const frozen = await isCounting(db, request.warehouse_id); // Kho có đang kiểm kê không?

  // Gom lại để truyền cho hàm dưới
  const view = { request, isManager, lots, locations, balances, visible, categoryOf };
  return {
    request: detail, // Yêu cầu
    frozen, // Kho đang khóa
    lines: detail.lines // Các dòng hàng
      // Nhân viên chỉ thấy dòng được giao
      .filter((line) => isManager || visible.some((a) => same(a.stock_request_line_id, line.id)))
      .map((line) => lineDto(line, view)), // Kèm lô, ô, tồn của dòng
    locations: locations.map(withTextId), // Mọi ô trong kho
    // Các lô phù hợp yêu cầu
    eligible_lots: lots.filter((lot) => detail.lines.some((line) => line.item_id === String(lot.item_id))).map(lotDto),
    balances: balances.map(balanceDto), // Tồn kho
    allocations: visible.map(allocationDto), // Phân công được thấy
  };
}

function lineDto(line, view) { // Một dòng hàng kèm lựa chọn
  // Phân công của dòng này
  const assigned = view.visible.filter((a) => same(a.stock_request_line_id, line.id));
  const isLineLot = (lot) => String(lot.item_id) === line.item_id; // Lô đúng mặt hàng?
  // Lô được chọn: quản lý thấy hết, nhân viên thấy lô được giao
  const lotAllowed = (lot) => isLineLot(lot) && (view.isManager || assigned.some((a) => same(a.lot_id, lot.id)));
  const locationAllowed = (location) => // Ô có được chọn không?
    // Quản lý: ô đúng khu; nhân viên: ô được giao
    (view.isManager && zoneFits(view, line, location)) || assigned.some((a) => same(a.location_id, location.id));
  // Tồn kho của dòng này
  const balanceOfLine = (balance) => view.lots.some((lot) => same(lot.id, balance.lot_id) && isLineLot(lot));

  return {
    ...line, // Giữ nguyên các thông tin khác
    unit: line.unit || "", // Đơn vị tính, không có thì để trống
    lots: view.lots.filter(lotAllowed).map(lotDto), // Các lô
    locations: view.locations.filter(locationAllowed).map(withTextId), // Các ô
    balances: view.balances.filter(balanceOfLine).map(balanceDto), // Tồn kho
  };
}

function zoneFits(view, line, location) { // Ô có hợp với mặt hàng không?
  // Xuất kho hoặc khu chung thì ô nào cũng được
  if (view.request.type !== "IN" || location.zone_category_id == null) return true;
  // Nhập kho: khu phải đúng nhóm hàng
  return same(location.zone_category_id, view.categoryOf.get(String(line.item_id)));
}

function allocationDto(row) { // Đổi mọi mã của phân công sang chữ
  const result = { ...row }; // Sao chép
  for (const field of Object.keys(result)) // Duyệt từng trường
    // Trường là mã thì đổi sang chữ
    if (field === "id" || field.endsWith("_id")) result[field] = result[field] == null ? null : String(result[field]);
  return result; // Trả kết quả
}

async function loadLocations(db, warehouseId) { // Đọc các ô đang dùng của kho
  const [rows] = await db.execute( // Chạy câu lệnh
    // Xếp theo khu và độ sâu
    "SELECT id,code,name,zone_name,zone_category_id,depth FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 ORDER BY zone_name,depth,id",
    [warehouseId], // Giá trị điền vào các dấu ?
  );
  return rows; // Trả danh sách ô
}

async function loadItemCategories(db) { // Mặt hàng thuộc nhóm nào
  const [items] = await db.execute("SELECT id,category_id FROM items"); // Đọc mọi mặt hàng
  // Tạo bảng tra: mặt hàng → nhóm
  return new Map(items.map((item) => [String(item.id), item.category_id]));
}

async function loadLots(db, request, requestId) { // Đọc các lô dùng được
  const source = lotSource(request, requestId); // Điều kiện nguồn của yêu cầu
  const [lots] = await db.execute( // Chạy câu lệnh
    // Thông tin lô và lượng đạt QC
    "SELECT l.id,l.code,l.item_id,l.expiry_date,l.received_quantity,l.qc_status,q.passed_quantity," +
      // Lần đầu nhập vào kho này
      "(SELECT MIN(doc.posted_at) FROM stock_document_lines d JOIN stock_documents doc ON doc.id=d.stock_document_id" +
      // Chỉ phiếu nhập vào kho này
      " JOIN warehouse_locations pos ON pos.id=d.location_id WHERE d.lot_id=l.id AND doc.type='IN' AND pos.warehouse_id=?) AS first_received_at," +
      // Tổng đã nhập
      "COALESCE((SELECT SUM(d.quantity) FROM stock_document_lines d JOIN stock_documents doc ON doc.id=d.stock_document_id" +
      " WHERE d.lot_id=l.id AND doc.type='IN'),0) AS posted_quantity" + // Không có thì bằng 0
      " FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id" + // Ghép với kết quả QC
      // Kết quả đã ghi nhận
      " JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED'" +
      " WHERE l.qc_status IN ('PASSED','PARTIAL')" + // Chỉ lô đạt toàn bộ hoặc một phần
      // Còn hạn dùng (giờ Việt Nam)
      " AND (l.expiry_date IS NULL OR l.expiry_date>=DATE(DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 HOUR)))" + source.sql +
      // Hạn gần trước, nhập trước
      " ORDER BY (l.expiry_date IS NULL),l.expiry_date,(first_received_at IS NULL),first_received_at,l.created_at,l.id LIMIT 500",
    [request.warehouse_id, ...source.params], // Giá trị điền vào các dấu ?
  );
  return lots.sort(storageQueue.compare); // Xếp lại theo thứ tự ưu tiên
}

function lotSource(request, requestId) { // Lô phải thuộc nguồn nào
  if (request.production_source_mode === "MANUAL") // Nhập thành phẩm từng phần
    // Lô do chính yêu cầu này tạo
    return { sql: " AND l.production_receipt_request_id=?", params: [requestId] };
  if (request.purpose === "PURCHASE_RECEIPT") // Nhập nguyên vật liệu
    // Lô của đơn mua
    return { sql: " AND l.purchase_order_line_id IN (SELECT id FROM purchase_order_lines WHERE purchase_order_id=?)", params: [request.purchase_order_id] };
  if (request.purpose === "PRODUCTION_RECEIPT") // Nhập thành phẩm
    // Lô của báo cáo thành phẩm
    return { sql: " AND l.id IN (SELECT lot_id FROM finished_report_outputs WHERE finished_report_id=?)", params: [request.production_report_id] };
  if (request.purpose === "SALE_ISSUE") // Xuất bán
    return {
      // Lô thuộc báo cáo của kế hoạch bán
      sql: " AND l.id IN (SELECT o.lot_id FROM finished_report_outputs o JOIN business_plans p ON p.id=? WHERE " +
        saleReportScope("o", "p.finished_report_id") + ")", // Điều kiện theo báo cáo của kế hoạch bán
      params: [request.business_plan_id], // Mã kế hoạch bán
    };
  return { sql: "", params: [] }; // Xuất sản xuất: mọi lô đạt
}

// Gợi ý ô nhập cho từng lô
async function suggestLocations(db, lots, locations, categoryOf, warehouseId) {
  const [stored] = await db.execute( // Đọc hàng đang có trong kho
    // Lô, mặt hàng, hạn dùng và ô
    "SELECT b.lot_id,l.item_id,l.expiry_date,b.location_id FROM inventory_balances b JOIN lots l ON l.id=b.lot_id" +
      // Ghép thêm bảng
      " JOIN warehouse_locations loc ON loc.id=b.location_id WHERE loc.warehouse_id=? AND b.quantity>0",
    [warehouseId], // Giá trị điền vào các dấu ?
  );
  for (const lot of lots) { // Duyệt từng lô
    lot.expiry_date = storageQueue.date(lot.expiry_date); // Chuẩn hóa ngày hạn dùng
    const category = categoryOf.get(String(lot.item_id)); // Nhóm của mặt hàng
    // Chỉ ô khu chung hoặc đúng nhóm
    const choices = locations.filter((l) => l.zone_category_id == null || same(l.zone_category_id, category));
    // Hàng cùng loại đang có trong kho
    const sameItem = stored.filter((row) => same(row.item_id, lot.item_id));
    const suggestion = storageQueue.recommend(lot, choices, sameItem); // Tính ô gợi ý
    lot.suggested_location_id = suggestion.location_id; // Ô gợi ý tốt nhất
    lot.suggested_location_ids = suggestion.location_ids; // Các ô gợi ý khác
    lot.storage_hint = suggestion.reason; // Lý do gợi ý
  }
}

async function loadBalances(db, warehouseId) { // Đọc tồn kho từng ô
  const reserved = // Công thức tính phần đang giữ chỗ
    // Tổng đã giao trừ đã ghi
    "COALESCE((SELECT SUM(a.quantity-a.posted_quantity) FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
    // Cùng lô, cùng ô
    " WHERE a.lot_id=b.lot_id AND a.location_id=b.location_id AND a.quality_bucket=b.quality_bucket" +
    " AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'),0)"; // Công việc xuất kho còn hiệu lực
  const [rows] = await db.execute( // Chạy câu lệnh
    // Đang có và đang giữ chỗ
    `SELECT b.lot_id,b.location_id,b.quality_bucket,b.quantity,${reserved} AS reserved_quantity,` +
      // Khả dụng = đang có − giữ chỗ, không âm
      `GREATEST(b.quantity-${reserved},0) AS available_quantity` +
      // Chỉ kho của yêu cầu
      " FROM inventory_balances b JOIN warehouse_locations loc ON loc.id=b.location_id WHERE loc.warehouse_id=?",
    [warehouseId], // Giá trị điền vào các dấu ?
  );
  return rows; // Trả tồn kho
}

async function loadAllocations(db, requestId, taskId) { // Đọc các phân công còn hiệu lực
  const [rows] = await db.execute( // Chạy câu lệnh
    // Kèm tên ô, khu, kho
    "SELECT a.*,loc.code AS location_code,loc.name AS location_name,loc.zone_name,w.name AS warehouse_name" +
      // Đọc từ các bảng này
      " FROM stock_allocations a JOIN tasks t ON t.id=a.task_id JOIN warehouse_locations loc ON loc.id=a.location_id" +
      // Bỏ công việc đã hủy
      " JOIN warehouses w ON w.id=loc.warehouse_id WHERE a.stock_request_id=? AND t.status<>'CANCELLED'" +
      (taskId ? " AND a.task_id=?" : ""), // Lọc theo công việc nếu có
    taskId ? [requestId, taskId] : [requestId], // Giá trị điền vào các dấu ?
  );
  return rows; // Trả danh sách
}

async function isCounting(db, warehouseId) { // Kho có đang khóa kiểm kê không?
  const [rows] = await db.execute( // Tìm phiếu kiểm kê của kho
    // Phiếu kiểm kê và đợt kiểm kê
    "SELECT sw.id FROM stocktake_warehouses sw JOIN stocktakes s ON s.id=sw.stocktake_id" +
      // Đang đếm hoặc đếm xong chưa đóng
      " WHERE sw.warehouse_id=? AND sw.status IN ('COUNTING','COMPLETED') AND s.campaign_type='COUNT' LIMIT 1",
    [warehouseId], // Giá trị điền vào các dấu ?
  );
  return rows.length > 0; // Có thì đúng
}

module.exports = previewRequest; // Cho WarehouseFlowService dùng
```

## 27. src/modules/warehouse/uc08-09-phan-cong-kho.js

**Lưu và hủy phân công**

```js
const crypto = require("node:crypto"); // Thư viện mã hóa, dùng tạo dấu vân tay nội dung
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
const P = require("../../services/domain/policy"); // Hàm kiểm tra quyền
const transaction = require("../../shared/transaction"); // Hàm chạy giao dịch
const codes = require("../../shared/readable-codes"); // Hàm sinh mã công việc
const positions = require("../../shared/assigned-positions"); // Hàm mô tả vị trí được phân công
const timeRules = require("../../shared/time-rules"); // Hàm kiểm tra thời gian
const allocationPlan = require("../../shared/warehouse-allocation-plan"); // Hàm so phân công cũ và mới
const check = require("./uc08-09-kiem-tra"); // Các kiểm tra của UC-08/09

// Đổi số lượng sang số nguyên 1/1000 để tính chính xác
const amount = (value) => C.qty(String(value), false);
// Phân công còn phần chưa ghi phiếu?
const isPending = (allocation) => amount(allocation.quantity) > amount(allocation.posted_quantity);
const unique = (values) => [...new Set(values)]; // Bỏ phần tử trùng

async function dispatchRequest(flow, user, requestId, body, key, auditId) { // LƯU PHÂN CÔNG
  P.role(user, ["WAREHOUSE_MANAGER"]); // Chỉ Quản lý kho
  const time = readInput(body, key); // Kiểm tra dữ liệu gửi lên, lấy thời gian thực hiện

  return transaction(flow.pool, async (db) => { // Mọi bước dưới cùng lưu hoặc cùng hủy
    const saved = await findSavedResult(db, user, requestId, body, key); // Đã xử lý khóa này chưa?
    if (saved.result) return saved.result; // Rồi thì trả kết quả cũ, không giao hai lần

    const request = await flow.requests.load(db, user, requestId, true); // Đọc và khóa yêu cầu
    await check.warehouseNotCounting(db, request.warehouse_id); // Kho đang kiểm kê thì dừng
    checkRequest(request, user, body.version); // Đúng người phụ trách, đúng phiên bản, còn việc
    await check.productionSource(db, flow.requests, request); // Nguồn sản xuất còn hợp lệ
    const detail = await flow.requests.get(user, requestId, db); // Chi tiết yêu cầu: lượng còn phải làm
    const saleReportId = await check.saleSource(db, request); // Nguồn bán còn hợp lệ, lấy mã báo cáo

    const current = await loadAllocations(db, requestId); // Các phân công đang có
    checkStillEditable(request, current); // Còn được sửa không?

    let kept = current; // Phân công vẫn giữ sau lần lưu này
    if (body.allocation_mode === "REPLACE_PENDING") { // Chế độ thay phân công chưa ghi phiếu
      if (current.length && allocationPlan.unchanged(current, body.allocations)) { // Nội dung không đổi
        // Chỉ đổi ngày giờ
        const result = await confirmSame(db, user, request, requestId, current, time, auditId);
        return saveResult(db, saved.id, result); // Lưu kết quả và kết thúc
      }
      // Có đổi: hủy phần chưa ghi phiếu
      kept = await cancelPending(db, user, requestId, current, auditId);
    }

    // Danh sách nhân viên được giao
    const assigneeIds = unique(body.allocations.map((line) => String(line.assignee_id)));
    await check.warehouseStaff(db, assigneeIds); // Phải là nhân viên kho đang hoạt động
    // Có đặt giờ thì kiểm tra trùng lịch
    if (!time.immediate) await check.noScheduleConflict(db, assigneeIds, time, requestId);
    // Kiểm tra từng dòng phân công
    await check.allocationLines(db, { request, detail, kept, lines: body.allocations, saleReportId });

    const tasks = []; // Các công việc sẽ tạo
    for (const assigneeId of assigneeIds) // Mỗi nhân viên
      // Một công việc
      tasks.push(await createTask(db, user, request, requestId, assigneeId, body.allocations, time));

    // Tăng phiên bản yêu cầu
    await db.execute("UPDATE stock_requests SET version=version+1 WHERE id=?", [requestId]);
    // Ghi nhật ký
    await audit(db, user, requestId, "DISPATCH", { tasks, count: body.allocations.length }, auditId);
    // Lưu kết quả theo khóa và trả về
    return saveResult(db, saved.id, { request_id: String(requestId), version: request.version + 1, tasks });
  });
}

function readInput(body, key) { // Kiểm tra dữ liệu gửi lên
  // Không nhận trường lạ
  C.fields(body, ["version", "start_at", "end_at", "allocations", "allocation_mode"]);
  // Chế độ lưu chỉ nhận REPLACE_PENDING
  C.fail(body.allocation_mode !== undefined && body.allocation_mode !== "REPLACE_PENDING",
    "VALIDATION_ERROR", "Cách lưu phân công không hợp lệ."); // Thông báo lỗi
  // Phải có số phiên bản
  C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản yêu cầu.");
  const time = readTime(body); // Đọc thời gian
  check.allocationCount(body.allocations); // Từ 1 đến 200 dòng
  // Phải có khóa chống gửi trùng
  C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
  check.allocationFormat(body.allocations); // Từng dòng đúng dạng
  return time; // Trả thời gian
}

function readTime(body) { // Thời gian thực hiện
  if (body.start_at === undefined && body.end_at === undefined) // Không gửi giờ
    // Làm ngay, trong 1 giờ tới
    return { immediate: true, start: new Date(), end: new Date(Date.now() + 3600000) };
  const range = timeRules.range(body.start_at, body.end_at); // Có gửi: kiểm tra hợp lệ
  // Trả giờ bắt đầu và kết thúc
  return { immediate: false, start: new Date(range.start), end: new Date(range.end) };
}

async function findSavedResult(db, user, requestId, body, key) { // Tìm kết quả đã lưu theo khóa
  // Dấu vân tay của nội dung gửi lên
  const hash = crypto.createHash("sha256").update(JSON.stringify({ requestId: String(requestId), ...body })).digest("hex");
  await db.execute( // Ghi nhớ khóa; đã có thì giữ nguyên
    // Các cột cần ghi
    "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at)" +
      // Hết hạn sau 1 ngày
      " VALUES (?,'stock-dispatch',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
    [user.id, key, hash], // Giá trị điền vào các dấu ?
  );
  const [[record]] = await db.execute( // Đọc lại và khóa bản ghi khóa
    // Theo người, loại thao tác và khóa
    "SELECT * FROM idempotency_records WHERE user_id=? AND operation='stock-dispatch' AND idempotency_key=? FOR UPDATE",
    [user.id, key], // Giá trị điền vào các dấu ?
  );
  // Cùng khóa nhưng nội dung khác thì báo lỗi
  C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
  // Chưa xử lý xong: coi như lần đầu
  if (record.response_status !== 200) return { id: record.id, result: null };
  // Đã xử lý: lấy kết quả cũ
  const result = typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
  return { id: record.id, result }; // Trả kết quả cũ
}

async function saveResult(db, recordId, result) { // Lưu kết quả theo khóa
  // Đánh dấu thành công và lưu nội dung
  await db.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), recordId]);
  return result; // Trả lại chính kết quả đó
}

function checkRequest(request, user, version) { // Kiểm tra yêu cầu
  // Phải là quản lý kho phụ trách
  C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);
  C.version(request, version); // Người khác vừa sửa thì báo tải lại
  C.state(request, ["PENDING", "PARTIALLY_FULFILLED"]); // Phải còn chờ hoặc mới làm một phần
  // Yêu cầu mua không phân công kho
  C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không phân công kho.", 409);
}

function checkStillEditable(request, current) { // Còn được sửa phân công không?
  // Đã tới giờ thực hiện chưa?
  const started = request.ThoiDiemThucHien && new Date(request.ThoiDiemThucHien).getTime() <= Date.now();
  // Đã có phân công và đã tới giờ thì không cho sửa
  C.fail(current.length > 0 && started, "INVALID_STATE", "Chỉ được sửa phân công trước ngày giờ thực hiện.", 409);
}

async function loadAllocations(db, requestId) { // Đọc phân công còn hiệu lực
  const [rows] = await db.execute( // Chạy câu lệnh
    // Kèm mã công việc
    "SELECT a.*,t.code AS task_code FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      " WHERE a.stock_request_id=? AND t.status<>'CANCELLED'", // Bỏ công việc đã hủy
    [requestId], // Giá trị điền vào các dấu ?
  );
  return rows; // Trả danh sách
}

// Phân công không đổi: chỉ đổi ngày giờ
async function confirmSame(db, user, request, requestId, current, time, auditId) {
  const tasks = pendingTasks(current); // Các công việc còn việc
  // Có đặt giờ thì kiểm tra trùng lịch
  if (!time.immediate) await check.noScheduleConflict(db, unique(tasks.map((task) => task.assignee_id)), time, requestId);

  // Làm ngay thì chuyển sang đang thực hiện
  const startNow = time.immediate ? "status='IN_PROGRESS'," : "";
  for (const task of tasks) // Từng công việc
    await db.execute( // Cập nhật
      // Đổi giờ, tăng phiên bản
      `UPDATE tasks SET start_at=?,end_at=?,${startNow}version=version+1 WHERE id=? AND status IN ('PLANNED','IN_PROGRESS')`,
      [time.start, time.end, task.id], // Giá trị điền vào các dấu ?
    );
  await audit(db, user, requestId, "CONFIRM_DISPATCH", { tasks }, auditId); // Ghi nhật ký
  return { request_id: String(requestId), version: request.version, tasks }; // Trả kết quả
}

function pendingTasks(allocations) { // Các công việc còn phần chưa ghi phiếu
  const tasks = new Map(); // Mã công việc → thông tin
  for (const a of allocations.filter(isPending)) // Duyệt phân công còn việc
    // Mỗi công việc giữ một dòng
    tasks.set(String(a.task_id), { id: String(a.task_id), assignee_id: String(a.user_id), code: a.task_code });
  return [...tasks.values()]; // Trả danh sách
}

// Hủy các công việc còn việc để giao lại
async function cancelPending(db, user, requestId, current, auditId) {
  // Mã các công việc cần hủy
  const taskIds = unique(current.filter(isPending).map((a) => String(a.task_id)));
  for (const taskId of taskIds) // Từng công việc
    await db.execute( // Hủy
      // Đổi trạng thái thành CANCELLED
      "UPDATE tasks SET status='CANCELLED',version=version+1 WHERE id=? AND stock_request_id=? AND status IN ('PLANNED','IN_PROGRESS')",
      [taskId, requestId], // Giá trị điền vào các dấu ?
    );
  // Có hủy thì ghi nhật ký
  if (taskIds.length) await audit(db, user, requestId, "REPLACE_PENDING_DISPATCH", { superseded_task_ids: taskIds }, auditId);
  return current.filter((a) => !taskIds.includes(String(a.task_id))); // Trả các phân công còn giữ
}

// Giao việc cho một nhân viên
async function createTask(db, user, request, requestId, assigneeId, allLines, time) {
  const task = await insertTask(db, user, request, requestId, time); // Tạo công việc
  // Gắn nhân viên với công việc
  await db.execute("INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)", [task.id, assigneeId]);

  // Các dòng của nhân viên này
  const ownLines = allLines.filter((line) => String(line.assignee_id) === assigneeId);
  // Lưu từng dòng: lô, ô, số lượng
  for (const line of ownLines) await insertAllocation(db, requestId, task.id, assigneeId, line);

  await notifyAssignee(db, request, assigneeId, task.id); // Gửi thông báo
  return { id: String(task.id), assignee_id: assigneeId, code: task.code }; // Trả thông tin công việc
}

async function insertTask(db, user, request, requestId, time) { // Tạo một công việc
  const prefix = request.type === "IN" ? "CV-NHAP" : "CV-XUAT"; // Tiền tố mã theo nhập / xuất
  // Sinh mã theo xưởng
  const code = await codes.next(db, "tasks", prefix, await codes.workshop(db, request.workshop_id));
  const [created] = await db.execute( // Thêm dòng công việc
    // Các cột cần ghi
    "INSERT INTO tasks (code,title,description,start_at,end_at,priority,status,stocktake_id,purchase_order_id,stock_request_id,task_type,manager_id,created_by,version)" +
      " VALUES (?,?,?,?,?,'NORMAL',?,NULL,NULL,?,?,?, ?,1)", // Ưu tiên bình thường, phiên bản 1
    [code, `Xử lý yêu cầu kho ${request.code}`, null, time.start, time.end, // Mã, tiêu đề, thời gian
      // Làm ngay thì đang thực hiện, không thì chờ tới giờ
      time.immediate ? "IN_PROGRESS" : "PLANNED", requestId, `WAREHOUSE_${request.type}`, user.id, user.id],
  );
  return { id: created.insertId, code }; // Trả mã công việc
}

async function insertAllocation(db, requestId, taskId, assigneeId, line) { // Lưu một dòng phân công
  await db.execute( // Thêm dòng
    // Yêu cầu, công việc, dòng hàng, nhân viên, lô, ô, số lượng
    "INSERT INTO stock_allocations (stock_request_id,task_id,stock_request_line_id,user_id,lot_id,location_id,quality_bucket,quantity,posted_quantity)" +
      " VALUES (?,?,?,?,?,?,'AVAILABLE',?,0)", // Hàng khả dụng, chưa ghi phiếu
    // Giá trị điền vào các dấu ?
    [requestId, taskId, line.stock_request_line_id, assigneeId, line.lot_id, line.location_id, C.decimal(C.qty(line.quantity))],
  );
}

async function notifyAssignee(db, request, assigneeId, taskId) { // Thông báo cho nhân viên
  const isInbound = request.type === "IN"; // Là nhập kho?
  const where = positions.describe(await positions.load(db, { taskId })); // Mô tả vị trí: kho › khu › ô
  // Tiêu đề thông báo
  const subject = "Phân công " + (isInbound ? "nhập" : "xuất") + " kho " + request.code;
  const text = "Vị trí " + (isInbound ? "nhập hàng" : "lấy hàng") + ": " + where + // Nội dung có vị trí
    ". Đối chiếu giấy tờ và ghi lượng thực tế trong công việc được giao."; // Lời nhắc
  await db.execute( // Thêm thông báo
    // Trùng khóa thì không thêm lần nữa
    "INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'tasks',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",
    // Cắt nội dung tối đa 5000 ký tự
    [assigneeId, subject, text.slice(0, 5000), taskId, "warehouse-task-" + taskId + "-assigned"],
  );
}

async function audit(db, user, requestId, action, data, auditId) { // Ghi nhật ký của yêu cầu
  await db.execute( // Thêm dòng nhật ký
    // Ai, yêu cầu nào, thao tác gì
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,?,?,?)",
    [user.id, requestId, action, JSON.stringify(data), auditId], // Dữ liệu lưu dạng JSON
  );
}

async function cancelAllocation(flow, user, taskId, body, auditId) { // HỦY PHÂN CÔNG
  P.role(user, ["WAREHOUSE_MANAGER"]); // Chỉ Quản lý kho
  C.fields(body, ["version"]); // Chỉ nhận số phiên bản
  const requestId = await findRequestOfTask(flow.pool, taskId); // Công việc thuộc yêu cầu nào

  return transaction(flow.pool, async (db) => { // Cùng lưu hoặc cùng hủy
    const request = await flow.requests.load(db, user, requestId, true); // Đọc và khóa yêu cầu
    // Phải là người phụ trách
    C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Không phụ trách yêu cầu.", 403);
    // Khóa kho
    await db.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [request.warehouse_id]);
    // Đọc và khóa công việc
    const [[task]] = await db.execute("SELECT * FROM tasks WHERE id=? FOR UPDATE", [taskId]);
    C.version(task, body.version); // Người khác vừa sửa thì báo tải lại
    C.state(task, ["PLANNED", "IN_PROGRESS"]); // Chỉ hủy công việc chưa xong

    // Hủy công việc, lượng giữ chỗ được trả lại
    await db.execute("UPDATE tasks SET status='CANCELLED',version=version+1 WHERE id=?", [taskId]);
    // Tăng phiên bản yêu cầu
    await db.execute("UPDATE stock_requests SET version=version+1 WHERE id=?", [request.id]);
    await db.execute( // Ghi nhật ký
      // Thao tác giải phóng phân công
      "INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'tasks',?,'RELEASE_RESERVATION',?,?)",
      // Giá trị điền vào các dấu ?
      [user.id, taskId, JSON.stringify({ stock_request_id: String(request.id) }), auditId],
    );
    return { task_id: String(taskId), status: "CANCELLED" }; // Báo đã hủy
  });
}

async function findRequestOfTask(pool, taskId) { // Tìm yêu cầu của công việc
  // Đọc công việc
  const [[task]] = await pool.execute("SELECT stock_request_id FROM tasks WHERE id=?", [taskId]);
  // Không phải công việc kho thì báo lỗi
  C.fail(!task?.stock_request_id, "NOT_FOUND", "Không tìm thấy phân công kho.", 404);
  return task.stock_request_id; // Trả mã yêu cầu
}

module.exports = { dispatchRequest, cancelAllocation }; // Cho WarehouseFlowService dùng
```

## 28. src/modules/warehouse/uc08-09-kiem-tra.js

**Các kiểm tra khi phân công**

```js
const C = require("../../services/domain/core"); // Hàm kiểm tra dùng chung
// Điều kiện lô thuộc báo cáo của kế hoạch bán
const saleReportScope = require("../../shared/sale-report-scope");
const { saleReadiness } = require("../stock-requests/sale-readiness"); // Kiểm tra đã sẵn sàng xuất bán

const isId = (value) => /^[1-9]\d*$/.test(String(value)); // Có phải số nguyên dương không?
const amount = (value) => C.qty(String(value), false); // Đổi số lượng sang số nguyên 1/1000
const unique = (values) => [...new Set(values)]; // Bỏ phần tử trùng
const marks = (values) => values.map(() => "?").join(","); // Tạo các dấu ? cho câu SQL
// Viết tắt: điều kiện đúng thì báo lỗi dữ liệu
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

function allocationCount(lines) { // Số dòng phân công
  // Phải từ 1 đến 200 dòng
  invalid(!Array.isArray(lines) || !lines.length || lines.length > 200, "Phân công cần 1 đến 200 dòng.");
}

function allocationFormat(lines) { // Dạng của từng dòng
  const seen = new Set(); // Các dòng đã gặp
  for (const line of lines) { // Duyệt từng dòng
    // Không nhận trường lạ
    C.fields(line, ["assignee_id", "stock_request_line_id", "lot_id", "location_id", "quality_bucket", "quantity"]);
    // Bốn mã của dòng
    const ids = [line.assignee_id, line.stock_request_line_id, line.lot_id, line.location_id];
    // Mã sai hoặc không phải hàng khả dụng thì báo lỗi
    invalid(ids.some((id) => !isId(id)) || line.quality_bucket !== "AVAILABLE", "Phân công lô, vị trí hoặc nhân viên không hợp lệ.");
    C.qty(line.quantity); // Số lượng phải hợp lệ và lớn hơn 0

    const key = ids.join(":"); // Khóa nhận biết dòng
    invalid(seen.has(key), "Dòng phân công trùng."); // Trùng dòng trước thì báo lỗi
    seen.add(key); // Ghi nhớ dòng này
  }
}

async function warehouseNotCounting(db, warehouseId) { // Kho có đang kiểm kê không?
  // Khóa kho trong lúc phân công
  await db.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [warehouseId]);
  const [counting] = await db.execute( // Tìm phiếu kiểm kê của kho
    // Đang đếm hoặc đã đếm xong
    "SELECT id FROM stocktake_warehouses WHERE warehouse_id=? AND status IN ('COUNTING','COMPLETED') LIMIT 1",
    [warehouseId], // Giá trị điền vào các dấu ?
  );
  C.fail(counting.length, "WAREHOUSE_FROZEN", "Kho đang kiểm kê.", 409); // Có thì báo kho đang kiểm kê
}

async function productionSource(db, requests, request) { // Nguồn sản xuất
  // Không phải yêu cầu của sản xuất thì bỏ qua
  if (!["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT"].includes(request.purpose)) return;
  // Nguồn là kế hoạch hay báo cáo?
  const byPlan = ["PLAN", "MANUAL"].includes(request.production_source_mode);
  C.fail(!request.production_report_id && !byPlan, "SOURCE_REQUIRED", // Thiếu nguồn thì báo lỗi
    "Yêu cầu lịch sử thiếu báo cáo nguồn; không được suy đoán lượng xuất.", 409); // Thông báo lỗi
  const sourceId = byPlan ? request.production_plan_id : request.production_report_id; // Mã nguồn
  // Kiểm tra nguồn còn hợp lệ
  await requests.source(db, request.purpose, sourceId, request.workshop_id, request.production_source_mode);
}

async function saleSource(db, request) { // Nguồn bán
  if (request.purpose !== "SALE_ISSUE") return null; // Không phải xuất bán thì bỏ qua
  await saleReadiness(db, request.business_plan_id, request.workshop_id); // Sản xuất đã hoàn tất chưa?
  // Đọc và khóa kế hoạch bán
  const [[plan]] = await db.execute("SELECT * FROM business_plans WHERE id=? FOR UPDATE", [request.business_plan_id]);
  // Đã duyệt và có báo cáo thành phẩm?
  const approved = plan && plan.finished_report_id && ["APPROVED", "IN_PROGRESS"].includes(plan.status);
  // Chưa thì báo lỗi
  C.fail(!approved, "INVALID_STATE", "Cần kế hoạch bán đã duyệt có nguồn báo cáo.", 409);
  return plan.finished_report_id; // Trả mã báo cáo
}

async function warehouseStaff(db, assigneeIds) { // Người được giao
  const [users] = await db.execute( // Tìm người dùng
    // Ghép vai trò
    "SELECT DISTINCT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id" +
      // Đang hoạt động và là nhân viên kho
      ` WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_STAFF' AND u.id IN (${marks(assigneeIds)})`,
    assigneeIds, // Giá trị điền vào các dấu ?
  );
  // Thiếu ai thì báo lỗi
  invalid(users.length !== assigneeIds.length, "Người được giao không phải nhân viên kho.");
}

async function noScheduleConflict(db, assigneeIds, time, requestId) { // Trùng lịch
  if (!assigneeIds.length) return; // Không có ai thì bỏ qua
  const [busy] = await db.execute( // Tìm công việc chồng giờ
    // Công việc và người làm
    "SELECT t.code,u.full_name FROM tasks t JOIN task_assignments a ON a.task_id=t.id JOIN users u ON u.id=a.user_id" +
      ` WHERE a.user_id IN (${marks(assigneeIds)})` + // Của các nhân viên được giao
      // Còn hiệu lực và chồng khung giờ
      " AND t.status IN ('PLANNED','IN_PROGRESS') AND t.start_at<? AND t.end_at>?" +
      // Không tính công việc của chính yêu cầu này
      " AND (t.stock_request_id IS NULL OR t.stock_request_id<>?) LIMIT 1",
    [...assigneeIds, time.end, time.start, requestId], // Giá trị điền vào các dấu ?
  );
  C.fail(busy.length, "SCHEDULE_CONFLICT", // Có thì báo trùng lịch
    // Nêu tên nhân viên và mã công việc
    `Lịch trùng: ${busy[0]?.full_name} đã có công việc ${busy[0]?.code} trong khung giờ này. Chọn giờ hoặc nhân viên khác.`, 409);
}

// KIỂM TRA TỪNG DÒNG PHÂN CÔNG
async function allocationLines(db, { request, detail, kept, lines, saleReportId }) {
  const remaining = remainingByLine(detail, kept); // Lượng còn được giao của từng dòng hàng
  const lots = await loadLots(db, lines); // Đọc và khóa các lô
  const locations = await loadLocations(db, lines); // Đọc các ô
  const reserved = new Map(); // Lượng các dòng trước đã giữ

  for (const line of lines) { // Duyệt từng dòng
    // Dòng hàng của yêu cầu
    const requestLine = detail.lines.find((row) => row.id === String(line.stock_request_line_id));
    const lot = lots.get(String(line.lot_id)); // Lô được chọn
    const location = locations.get(String(line.location_id)); // Ô được chọn

    // Xuất bán: lô phải thuộc nguồn bán
    if (saleReportId) await lotInSaleSource(db, saleReportId, line.lot_id);
    lotFitsRequest(request, requestLine, lot, location); // Lô và ô hợp với yêu cầu
    zoneFitsItem(request, lot, location); // Ô đúng khu
    lotNotExpired(lot); // Lô còn hạn
    await lotInRequestSource(db, request, lot); // Lô đúng chứng từ nguồn

    const quantity = C.qty(line.quantity); // Số lượng của dòng
    takeRemaining(remaining, requestLine.id, quantity); // Trừ vào lượng còn lại
    if (request.type === "OUT") await enoughStock(db, line, quantity, reserved); // Xuất: đủ tồn
    else await enoughPassedQuantity(db, line, lot, quantity, reserved); // Nhập: đủ lượng đạt QC
  }
}

function remainingByLine(detail, kept) { // Lượng còn được giao của từng dòng hàng
  // Bắt đầu bằng lượng còn phải làm
  const remaining = new Map(detail.lines.map((line) => [line.id, amount(line.remaining_quantity)]));
  for (const a of kept) { // Duyệt các phân công còn giữ
    const lineId = String(a.stock_request_line_id); // Thuộc dòng hàng nào
    // Phần đang giao chưa ghi phiếu
    const assigned = C.qty(String(a.quantity)) - amount(a.posted_quantity);
    remaining.set(lineId, (remaining.get(lineId) || 0n) - assigned); // Trừ đi
  }
  return remaining; // Trả kết quả
}

function takeRemaining(remaining, lineId, quantity) { // Trừ lượng của một dòng phân công
  const rest = (remaining.get(lineId) || 0n) - quantity; // Còn lại sau khi trừ
  // Âm thì báo vượt yêu cầu
  C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Phân công vượt lượng yêu cầu còn lại.");
  remaining.set(lineId, rest); // Ghi lại
}

async function loadLots(db, lines) { // Đọc và khóa các lô
  // Xếp theo mã để hai người không khóa chéo nhau
  const ids = unique(lines.map((line) => String(line.lot_id))).sort((a, b) => Number(a) - Number(b));
  const [rows] = await db.execute( // Chạy câu lệnh
    // Thông tin lô và lượng đạt QC
    "SELECT l.id,l.item_id,i.category_id,l.received_quantity,l.expiry_date,l.qc_status,l.purchase_order_line_id,l.production_plan_id,q.passed_quantity" +
      // Ghép mặt hàng và kết quả QC
      " FROM lots l JOIN items i ON i.id=l.item_id JOIN qc_inspection_lines q ON q.lot_id=l.id" +
      ` WHERE l.id IN (${marks(ids)}) ORDER BY l.id FOR UPDATE`, // Khóa lô tới khi xong
    ids, // Giá trị điền vào các dấu ?
  );
  return new Map(rows.map((lot) => [String(lot.id), lot])); // Bảng tra: mã lô → lô
}

async function loadLocations(db, lines) { // Đọc các ô
  const ids = unique(lines.map((line) => String(line.location_id))); // Mã các ô, bỏ trùng
  const [rows] = await db.execute( // Chạy câu lệnh
    // Chỉ ô đang dùng
    `SELECT id,warehouse_id,zone_category_id FROM warehouse_locations WHERE is_active=1 AND id IN (${marks(ids)})`,
    ids, // Giá trị điền vào các dấu ?
  );
  return new Map(rows.map((row) => [String(row.id), row])); // Bảng tra: mã ô → ô
}

function lotFitsRequest(request, requestLine, lot, location) { // Lô và ô hợp với yêu cầu không?
  const fits = requestLine && lot && location && // Phải có đủ dòng hàng, lô và ô
    String(location.warehouse_id) === String(request.warehouse_id) && // Ô thuộc kho của yêu cầu
    String(lot.item_id) === requestLine.item_id && // Lô đúng mặt hàng
    ["PASSED", "PARTIAL"].includes(lot.qc_status); // Lô đạt QC
  invalid(!fits, "Lô hoặc vị trí không phù hợp yêu cầu."); // Không hợp thì báo lỗi
}

function zoneFitsItem(request, lot, location) { // Ô đúng khu không?
  // Nhập kho và ô thuộc khu riêng
  const wrongZone = request.type === "IN" && location.zone_category_id != null &&
    String(location.zone_category_id) !== String(lot.category_id); // Mà khác nhóm hàng
  // Thì báo lỗi
  C.fail(wrongZone, "ZONE_ITEM_MISMATCH", "Vị trí không thuộc khu của mặt hàng này. Chọn đúng khu khi phân công nhập.", 422);
}

function lotNotExpired(lot) { // Lô còn hạn không?
  const today = new Date().toISOString().slice(0, 10); // Ngày hôm nay
  // Hạn dùng trước hôm nay?
  const expired = lot.expiry_date && lot.expiry_date.toISOString().slice(0, 10) < today;
  C.fail(expired, "INVALID_STATE", "Dòng lô đã hết hạn.", 409); // Hết hạn thì báo lỗi
}

async function lotInSaleSource(db, saleReportId, lotId) { // Lô thuộc nguồn bán?
  const [found] = await db.execute( // Tìm trong báo cáo thành phẩm
    // Câu lệnh
    "SELECT o.id FROM finished_report_outputs o WHERE " + saleReportScope("o") + " AND o.lot_id=?",
    [saleReportId, lotId], // Giá trị điền vào các dấu ?
  );
  invalid(!found.length, "Dòng lô không thuộc nguồn kế hoạch bán."); // Không có thì báo lỗi
}

async function lotInRequestSource(db, request, lot) { // Lô thuộc chứng từ nguồn?
  // Nhập nguyên vật liệu: theo đơn mua
  if (request.purpose === "PURCHASE_RECEIPT") return lotInPurchaseOrder(db, request, lot);
  // Nhập thành phẩm: theo sản xuất
  if (request.purpose === "PRODUCTION_RECEIPT") return lotInProduction(db, request, lot);
}

async function lotInPurchaseOrder(db, request, lot) { // Lô thuộc đơn mua?
  const [found] = await db.execute( // Tìm dòng đơn mua
    // Đúng dòng, đúng đơn, đúng mặt hàng
    "SELECT id FROM purchase_order_lines WHERE id=? AND purchase_order_id=? AND item_id=?",
    [lot.purchase_order_line_id, request.purchase_order_id, lot.item_id], // Giá trị điền vào các dấu ?
  );
  invalid(!found.length, "Lô không thuộc đơn mua nguồn."); // Không có thì báo lỗi
}

async function lotInProduction(db, request, lot) { // Lô thuộc sản xuất?
  // Phải cùng kế hoạch sản xuất
  invalid(String(lot.production_plan_id) !== String(request.production_plan_id), "Lô không thuộc kế hoạch sản xuất.");
  if (request.production_source_mode === "MANUAL") { // Nhập từng phần
    // Lô phải do chính yêu cầu này tạo
    const [found] = await db.execute("SELECT id FROM lots WHERE id=? AND production_receipt_request_id=?", [lot.id, request.id]);
    invalid(!found.length, "Lô không thuộc đợt nhập thành phẩm này."); // Không phải thì báo lỗi
    return; // Xong
  }
  const [found] = await db.execute( // Nhập theo báo cáo: tìm lô trong báo cáo
    // Đúng báo cáo, đúng lô
    "SELECT id FROM finished_report_outputs WHERE finished_report_id=? AND lot_id=?",
    [request.production_report_id, lot.id], // Giá trị điền vào các dấu ?
  );
  invalid(!found.length, "Dòng lô không thuộc báo cáo thành phẩm nguồn."); // Không có thì báo lỗi
}

async function enoughStock(db, line, quantity, reserved) { // Đủ tồn để xuất?
  const [balances] = await db.execute( // Đọc và khóa tồn của lô tại ô
    // Chỉ hàng khả dụng
    "SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE' FOR UPDATE",
    [line.lot_id, line.location_id], // Giá trị điền vào các dấu ?
  );
  const [[held]] = await db.execute( // Tổng đang giữ chỗ
    // Đã giao trừ đã ghi
    "SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      // Cùng lô, cùng ô, công việc xuất còn hiệu lực
      " WHERE a.lot_id=? AND a.location_id=? AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'",
    [line.lot_id, line.location_id], // Giá trị điền vào các dấu ?
  );
  const inStock = balances.length ? amount(balances[0].quantity) : 0n; // Không có dòng tồn thì bằng 0
  // Tổng muốn lấy trong lần lưu này
  const wanted = addReserved(reserved, `${line.lot_id}:${line.location_id}`, quantity);
  // Vượt phần còn trống thì báo lỗi
  C.fail(wanted > inStock - amount(held.quantity), "INSUFFICIENT_STOCK", "Không đủ tồn khả dụng để phân công.", 409);
}

async function enoughPassedQuantity(db, line, lot, quantity, reserved) { // Đủ lượng đạt QC để nhập?
  const [[posted]] = await db.execute( // Tổng đã nhập của lô
    // Cộng các phiếu
    "SELECT COALESCE(SUM(dl.quantity),0) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id" +
      " WHERE dl.lot_id=? AND d.type='IN'", // Chỉ phiếu nhập
    [line.lot_id], // Giá trị điền vào các dấu ?
  );
  const [[held]] = await db.execute( // Tổng đang giao nhập
    // Đã giao trừ đã ghi
    "SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      // Công việc nhập còn hiệu lực
      " WHERE a.lot_id=? AND t.task_type='WAREHOUSE_IN' AND t.status<>'CANCELLED'",
    [line.lot_id], // Giá trị điền vào các dấu ?
  );
  // Còn lại = đạt − đã nhập − đang giao
  const left = amount(lot.passed_quantity) - amount(posted.quantity) - amount(held.quantity);
  // Tổng muốn nhập trong lần lưu này
  const wanted = addReserved(reserved, String(line.lot_id), quantity);
  // Vượt thì báo lỗi
  C.fail(wanted > left, "SOURCE_LIMIT_EXCEEDED", "Lô không còn đủ lượng QC đạt để nhập.");
}

function addReserved(reserved, key, quantity) { // Cộng dồn lượng trong cùng lần lưu
  const total = (reserved.get(key) || 0n) + quantity; // Đã giữ + thêm
  reserved.set(key, total); // Ghi lại
  return total; // Trả tổng
}

module.exports = { // Cho file khác dùng
  // Kiểm tra dữ liệu, kho, nguồn
  allocationCount, allocationFormat, warehouseNotCounting, productionSource, saleSource,
  warehouseStaff, noScheduleConflict, allocationLines, // Kiểm tra nhân viên, lịch, từng dòng
};
```

## 29. src/shared/warehouse-allocation-plan.js

**So phân công cũ và mới**

```js
const C=require('../services/domain/core'); // Hàm kiểm tra dùng chung
// Khóa nhận biết một dòng: nhân viên, dòng hàng, lô, ô, chất lượng
function signature(line){return [line.assignee_id??line.user_id,line.stock_request_line_id,line.lot_id,line.location_id,line.quality_bucket].map(String).join(':');}
// Tổng số lượng theo khóa; phân công cũ thì trừ phần đã ghi phiếu
function quantities(rows,existing=false){const result=new Map();for(const row of rows){const n=C.qty(String(row.quantity),false)-(existing?C.qty(String(row.posted_quantity),false):0n);if(n>0n){const key=signature(row);result.set(key,(result.get(key)||0n)+n);}}return result;}
// So phân công cũ và mới: cùng số khóa và cùng số lượng thì là không đổi
function unchanged(existing,submitted){const a=quantities(existing,true),b=quantities(submitted);return a.size===b.size&&[...a].every(([key,n])=>b.get(key)===n);}
module.exports={unchanged}; // Cho file khác dùng
```

## 30. src/shared/assigned-positions.js

**Vị trí được phân công, dùng cho thông báo**

```js
// =============================================================================
// VỊ TRÍ TRONG KHO ĐƯỢC PHÂN CÔNG (UC-08/09 phân công → UC-10/11 nhân viên thực hiện)
// Mỗi phần phân công còn hiệu lực: mặt hàng, lô, kho, khu, ô và số lượng.
// Dùng cho chi tiết yêu cầu / nhập xuất kho, chi tiết công việc, biểu mẫu ghi phiếu và thông báo.
// =============================================================================
const C = require("../services/domain/core"); // Hàm kiểm tra dùng chung
const numbers = require("../../public/js/number-format"); // Hàm hiển thị số kiểu Việt Nam

const zoneLabel = (zone) => (zone || "Khu chung").replace(/^Khu [A-Z] · /, "Khu "); // Rút gọn tên khu
// Tên ô: mã ô và tên ô, bỏ phần trùng
const positionLabel = (row) => [row.location_code, row.location_name].filter((v, i, all) => v && all.indexOf(v) === i).join(" · ");

/** @param scope { requestId | taskId, userId? } — userId: chỉ lấy phần giao cho nhân viên đó. */
async function load(connection, { requestId, taskId, userId }) { // Đọc các vị trí được phân công
  const where = ["t.status<>'CANCELLED'"], params = []; // Điều kiện: bỏ công việc đã hủy
  if (requestId) { where.push("a.stock_request_id=?"); params.push(requestId); } // Lọc theo yêu cầu
  if (taskId) { where.push("a.task_id=?"); params.push(taskId); } // Lọc theo công việc
  if (userId) { where.push("a.user_id=?"); params.push(userId); } // Lọc theo nhân viên
  const [rows] = await connection.execute( // Chạy câu lệnh
    // Số lượng, mặt hàng, lô, kho
    "SELECT a.quantity,a.posted_quantity,i.name AS item_name,un.name AS unit,l.code AS lot_code,w.name AS warehouse_name," +
      // Khu, ô và nhân viên
      "loc.zone_name,loc.code AS location_code,loc.name AS location_name,us.full_name AS assignee_name" +
      // Ghép các bảng liên quan
      " FROM stock_allocations a JOIN tasks t ON t.id=a.task_id JOIN lots l ON l.id=a.lot_id JOIN items i ON i.id=l.item_id" +
      // Ghép thêm bảng
      " JOIN units un ON un.id=i.unit_id JOIN warehouse_locations loc ON loc.id=a.location_id JOIN warehouses w ON w.id=loc.warehouse_id" +
      // Nối điều kiện
      " JOIN users us ON us.id=a.user_id WHERE " + where.join(" AND ") + " ORDER BY a.id",
    params, // Giá trị điền vào các dấu ?
  );
  return rows.map((row) => ({ // Chuẩn hóa từng dòng
    item_name: row.item_name, // Tên mặt hàng
    zone_name: zoneLabel(row.zone_name), // Tên khu
    location_name: positionLabel(row), // Tên ô
    quantity: C.decimal(C.qty(String(row.quantity), false)), // Số lượng được giao
    // Còn lại = được giao − đã ghi
    remaining_quantity: C.decimal(C.qty(String(row.quantity), false) - C.qty(String(row.posted_quantity), false)),
    unit: row.unit, // Đơn vị tính
    lot_code: row.lot_code, // Mã lô
    warehouse_name: row.warehouse_name, // Tên kho
    ...(userId ? {} : { assignee_name: row.assignee_name }), // nhân viên chỉ xem phần của mình
  }));
}

/** Câu mô tả ngắn cho thông báo: "Bột mì: 56 kg tại Kho A › Khu bột › A-01". */
function describe(positions) { // Câu mô tả ngắn cho thông báo
  return positions // Ghép mô tả của từng dòng
    // Ví dụ: Bột mì: 56 kg tại Kho A › Khu bột › A-01
    .map((p) => `${p.item_name}: ${numbers.display(p.quantity)} ${p.unit} tại ${p.warehouse_name} › ${p.zone_name} › ${p.location_name}`)
    .join("; "); // Nối các dòng bằng dấu ;
}

module.exports = { load, describe, zoneLabel, positionLabel }; // Cho file khác dùng
```
