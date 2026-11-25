// Bảng tra: muốn test UC nào thì đăng nhập tài khoản nào, vào màn hình nào, chọn bản ghi nào.
function writeGuide(rows) {
  const order = (uc) => { const n = uc.match(/\d+/g); return !n ? 99999 : n.length > 1 ? Number(n[0]) * 100 + Number(n.at(-1)) : Number(n[0]) * 100; };
  const sorted = rows.map((r, i) => ({ ...r, i })).sort((a, b) => order(a.uc) - order(b.uc) || a.i - b.i);
  const lines = sorted.map((r) => `| ${r.uc} | ${r.name} | ${r.account} | ${r.screen} | ${r.how} | ${r.records.join("<br>")} |`);
  return `# Dữ liệu test mặc định

Bấm nút **XÓA DỮ LIỆU TEST** là toàn bộ dữ liệu trở về đúng bộ này: đơn hàng, kế hoạch, kho, danh mục, nhà cung cấp và tài khoản. Những gì tự thêm hoặc sửa trước đó sẽ mất; hệ thống tự sao lưu trước khi khôi phục. Sau khi bấm, mọi người đăng nhập lại.

- Mật khẩu tất cả tài khoản: **123456**.
- Mỗi UC có dữ liệu riêng, test UC nào trước cũng được, không cần làm UC khác.
- Các bản ghi có nhãn **[UC-..]** trong ghi chú hoặc tên. Mã trong bảng dưới luôn giữ nguyên sau mỗi lần khôi phục.
- Ngày tháng tự dời theo ngày bấm nút: hạn giao sau khoảng 8 tháng, giờ thực hiện sau hơn 3 tháng, hạn dùng của lô từ 2 tháng trở lên. Vì vậy các thao tác "chỉ được làm trước ngày thực hiện" luôn còn thời gian. Nên bấm lại nút ít nhất mỗi 2 tháng.
- Riêng đơn để **xuất bán** có ngày giao là hôm trước, vì hệ thống chỉ cho xuất khi đã tới ngày giao.
- Kho KHO-KD-1 đến KHO-KD-7 dành riêng cho kiểm đếm tồn kho: kho đang kiểm kê bị khóa nhập/xuất nên không dùng chung với các UC khác.

| UC | Chức năng | Tài khoản | Màn hình | Cách test | Bản ghi dùng |
| --- | --- | --- | --- | --- | --- |
${lines.join("\n")}
`;
}
module.exports = { writeGuide };
