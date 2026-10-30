const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'../docs');
function section(file,heading,body){const p=path.join(root,file);let s=fs.readFileSync(p,'utf8');const start=s.indexOf('\n'+heading+'\n');if(start>=0){const end=s.indexOf('\n## ',start+heading.length+2);s=s.slice(0,start)+(end<0?'':s.slice(end));}fs.writeFileSync(p,s.trimEnd()+'\n\n'+heading+'\n\n'+body.trim()+'\n');}
const rules=`Mỗi xưởng có ba kho: nguyên vật liệu, thành phẩm và hàng trả về. Mỗi kho có nhiều khu A, B, C… với nhãn nhóm hàng; mỗi khu mẫu có mười vị trí như A01–A10. Số nhỏ ở ngoài, số lớn ở trong. Ba xưởng có tổng cộng chín kho; màn hình tra cứu chọn một xưởng rồi hiển thị ba kho tương ứng.

Khi phân công nhập (UC-08), hệ thống gợi ý khu đúng nhóm hàng, hạn dùng xa ở trong, hạn dùng gần hoặc chưa rõ ở ngoài. Cùng hạn dùng với hàng đang có thì gợi ý đặt sau lô nhập trước. Quản lý chọn nhân viên, vị trí và lượng của từng phần, xác nhận trước khi giao thực hiện; không tự di chuyển hàng đang có.

Khi phân công xuất (UC-09), các lô đủ điều kiện của đúng nguồn và kho được gợi ý theo hạn dùng sớm trước; cùng hạn dùng dùng thời điểm ghi phiếu nhập đầu tiên tại kho đó sớm trước. Không dùng thời điểm tạo lô. Lô chưa có hạn dùng xếp sau lô có hạn dùng; các mốc bằng nhau giữ thứ tự ổn định theo bản ghi lô.

Form phân công xuất có bảng thứ tự và nút Bổ sung phân bổ theo hạn dùng và thứ tự nhập. Nút giữ các dòng đang nhập, bổ sung phần thiếu từ lô tiếp theo và trừ lượng đã có trên form. Quản lý chọn nhân viên cho từng phần và vẫn có thể điều chỉnh lựa chọn hợp lệ. Gợi ý không tự ghi phiếu, không tăng/trừ tồn và không bỏ qua QC, nguồn, tồn khả dụng, giữ chỗ, lịch, phân quyền hoặc khóa kiểm kê.

Nhân viên chỉ ghi phần được giao tại UC-10/UC-11.01/UC-11.02; không tự đổi lô/vị trí ngoài phân công. Ghi một phần giữ lượng còn lại để thực hiện tiếp. Phiếu đã ghi sổ và lịch sử tồn không được viết lại.

Chi tiết: [WORKSHOP_STORAGE.md](WORKSHOP_STORAGE.md). Bản Word và kiểm tra bảo toàn: [review-20261030](review-20261030/README.md).`;
const ucPath=path.join(root,'USE_CASES.md');let ucText=fs.readFileSync(ucPath,'utf8');
for(const [id,title,direction]of [['08','Quản lý nhập kho','nhập'],['09','Quản lý xuất kho','xuất']]){
 const heading='## UC-'+id+' '+title,start=ucText.indexOf(heading+'\n'),end=ucText.indexOf('\n## ',start+heading.length);
 if(start<0||end<0)throw Error('Missing UC '+id);
 const flow=direction==='nhập'?'Gợi ý khu đúng nhóm hàng và vị trí theo hạn dùng: xa ở trong, gần hoặc chưa rõ ở ngoài; cùng hạn dùng đặt sau lô đã nhập trước.':'Hiển thị bảng thứ tự lô: hạn dùng sớm trước; cùng hạn dùng thì ghi phiếu nhập đầu tiên tại kho hiện tại sớm trước. Có thể bổ sung phân bổ phần thiếu từ các lô tiếp theo.';
 const block=`${heading}

**Actor chính:** Quản lý kho

**Tiền điều kiện:** đã đăng nhập, phụ trách yêu cầu và có nguồn/lượng đủ điều kiện.

### Luồng cơ bản

1. Mở ${title}; xem yêu cầu ${direction} thuộc phạm vi và các phiếu đã ghi sổ. (PhieuYeuCauNhapXuat, PhieuKho)
2. Chọn yêu cầu; xem nguồn, xưởng, kho, ngày giờ, phần lô và lượng còn phải thực hiện. (ChiTietPhieuYeuCauNhapXuat, Xuong, Kho, LoHang, ChiTietLo, PhanCongKho)
3. Chọn Phân công kho; chọn nhân viên, từng dòng lô, vị trí, lượng và lịch. ${flow} (NguoiDung, ViTriKho, TonKho, PhanCongKho, PhieuKho, ChiTietPhieuKho)
4. Quản lý kiểm tra, điều chỉnh lựa chọn hợp lệ rồi xác nhận. Hệ thống kiểm tra lại, lưu phân công và thông báo; nhân viên thực hiện phiếu ${direction}. (CongViec, PhanCongCongViec, PhanCongKho, ThongBao)

**Hậu điều kiện:** phân công được lưu; chưa tự tăng/trừ tồn. Nhân viên ghi phiếu thực ${direction} mới cập nhật tồn; quản lý xem được kết quả trong Phiếu đã ghi sổ.

### Luồng thay thế và ngoại lệ

Tìm kiếm/lọc, xem phiếu đã ghi sổ, thêm/xóa dòng, phân nhiều nhân viên, điều chỉnh gợi ý hợp lệ, giải phóng phần chưa thực hiện rồi phân lại, hoặc hủy trước xác nhận. Phần đã ghi phiếu giữ nguyên. Không đủ nguồn/lô/vị trí/lượng, sai người phụ trách, lịch trùng, sai nhóm hàng, hàng không đủ điều kiện hoặc dữ liệu vừa thay đổi thì không lưu phân công sai; tải lại và kiểm tra. Các nhánh chi tiết được bổ sung tại cuối tài liệu và trong Word cập nhật ngày 30/10/2026.
`;
 ucText=ucText.slice(0,start)+block+ucText.slice(end);
}
ucText=ucText.replace('1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.\n2. Xem hàng/lô/vị trí, bucket, tồn và khả dụng; không lấy lượng cách ly/hết hạn/giữ chỗ thành lượng xuất.\n3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.','1. Chọn xưởng, một trong ba kho NVL/thành phẩm/hàng trả về, rồi chọn khu hoặc tất cả khu. Chủ xưởng được tra cứu kho theo quyền hiện hành. (Xuong, Kho, ViTriKho)\n2. Xem nhãn nhóm hàng từng khu và các vị trí A01–A10, B01–B10…; lọc nhóm hàng/danh mục hoặc tìm mặt hàng/mã lô. (LoaiHang, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo)\n3. Chọn vị trí để xem hàng/lô, hạn dùng, đơn vị, tồn, giữ chỗ và khả dụng. Vị trí trống hiển thị chưa có hàng. Tra cứu không tự di chuyển hàng hoặc ghi phiếu. (DonViTinh, TonKho, PhanCongKho, ViTriKho)');
fs.writeFileSync(ucPath,ucText);
section('SRS.md','## Cập nhật 30/10/2026 — kho theo xưởng và điều phối theo hạn dùng',rules);
section('UI_SPEC.md','## Cập nhật 30/10/2026 — tra cứu và phân công kho',`Tra cứu kho: chọn xưởng → một trong ba kho → khu → vị trí. Mặc định xem một khu; có thể chọn tất cả. Tiêu đề khu ghi nhóm hàng, ô vị trí chỉ dùng mã ngắn; phân biệt có hàng, trống, đang chọn. Bảng chi tiết hiển thị lô, hạn dùng, tồn, giữ chỗ và khả dụng. Quản lý kho dùng Quản lý nhập kho/Quản lý xuất kho; Chủ xưởng dùng Yêu cầu nhập/xuất.

Trong form phân công xuất, bảng Thứ tự xuất đề xuất hiển thị số ưu tiên, mã lô, hạn dùng, thời điểm nhập đầu tiên. Nút Bổ sung phân bổ theo hạn dùng và thứ tự nhập chia phần thiếu qua các lô; quản lý chọn nhân viên và xác nhận. Form nhập hiển thị vị trí gợi ý và lý do theo hạn dùng. Có thể điều chỉnh lựa chọn hợp lệ; gợi ý không tự ghi phiếu.

Card đặt bánh có ảnh/thông tin ở phần trên; số lượng và ghi chú dùng toàn bộ chiều ngang phía dưới. Tham khảo [WORKSHOP_STORAGE.md](WORKSHOP_STORAGE.md).`);
section('DOMAIN_MODEL.md','## Cập nhật 30/10/2026 — tổ chức kho và thứ tự điều phối',`Kho liên kết Xuong bằng MaXuong, phân biệt ba loại bằng LoaiKho: MATERIAL, FINISHED_PRODUCT, RETURN. Một xưởng không có hai kho cùng loại. ViTriKho giữ TenKhu, MaLoaiHangPhuTrach và DoSau; chưa tạo entity Khu riêng. Dữ liệu mẫu A01–A10 có DoSau 1–10.

Thời điểm nhập đầu tiên được tính từ PhieuKho loại nhập và ChiTietPhieuKho tại kho đang điều phối; không thêm một bảng hàng đợi và không lấy NgayTao của lô làm ngày nhập. PhanCongKho tiếp tục lưu nhân viên, phần lô, vị trí và lượng. Quy tắc chỉ sắp thứ tự gợi ý; quyền và kiểm tra khi lưu không đổi.

Migration 007_workshop_warehouses.sql bổ sung liên kết kho/xưởng và loại kho; dữ liệu và vị trí cũ vẫn được bảo toàn. MatHang có hai bảng con NguyenVatLieu và ThanhPham; LoHang/ChiTietLo vẫn dùng chung, không tách lại bảng lô NVL/thành phẩm. Chi tiết: [WORKSHOP_STORAGE.md](WORKSHOP_STORAGE.md).`);
section('USE_CASES.md','## Bổ sung 30/10/2026 — các nhánh điều phối kho',rules+`

Các nhánh thay thế: thêm/xóa dòng phân bổ, phân nhiều nhân viên, bổ sung phần thiếu qua nhiều lô, điều chỉnh gợi ý hợp lệ, xem phiếu đã ghi sổ, giải phóng phần chưa thực hiện để phân lại, hủy trước xác nhận. Phần đã ghi phiếu luôn giữ nguyên.

Ngoại lệ: không có nguồn/lô/vị trí phù hợp, lượng vượt khả dụng hoặc phần đạt còn chưa nhập, sai khu/nhóm hàng, sai quyền/người phụ trách, lịch trùng hoặc sai thời gian, hàng hết hạn/cách ly/chưa đạt, nguồn hết lượng, kho khóa hoặc dữ liệu bị thay đổi. Không lưu phân công/phiếu không hợp lệ; người dùng kiểm tra lại dữ liệu. Không coi thiếu hạn dùng tự nó là lệnh cấm xuất; vẫn kiểm tra các điều kiện khác.

Không thêm hoặc bỏ UC trong đợt cập nhật này.`);
section('TEST_CASES.md','## Bổ sung 30/10/2026 — kho theo xưởng và thứ tự phân công',`Các ca dưới đây mô tả kỳ vọng; không mặc định tất cả đã được chạy trong đợt sửa tài liệu.

| Mã | UC | Thiết lập/thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| KQ-01 | UC-22 | Đổi giữa ba xưởng | Mỗi xưởng hiển thị ba kho đúng loại; không nhầm ba loại kho với ba khu |
| KQ-02 | UC-22 | Mở kho NVL, chọn khu A | Có nhãn nhóm hàng, vị trí A01–A10; chọn vị trí xem tồn/giữ chỗ/khả dụng |
| KQ-03 | UC-08 | Nhập cùng NVL có hạn dùng xa hơn hàng đang có | Gợi ý khu đúng nhóm, phía trong; quản lý vẫn chọn nhân viên và xác nhận |
| KQ-04 | UC-08 | Lô nhập có hạn dùng gần hơn hoặc chưa rõ | Gợi ý phía ngoài; không tự chuyển hàng cũ |
| KQ-05 | UC-08 | Chọn vị trí của nhóm hàng khác | Từ chối phân công, không ghi phiếu/tăng tồn |
| KQ-06 | UC-09 | Hai lô có hạn dùng khác nhau, lô nhập sau lại hết hạn sớm hơn | Lô hết hạn sớm đứng trước |
| KQ-07 | UC-09 | Cùng hạn dùng, tạo lô A trước nhưng ghi nhập B trước | B đứng trước A, dùng phiếu nhập thực tế tại kho hiện tại |
| KQ-08 | UC-09 | Cùng hạn dùng và thời điểm nhập | Thứ tự ổn định theo bản ghi; không đổi ngẫu nhiên khi tải lại |
| KQ-09 | UC-09 | Có lô chưa ghi hạn dùng | Xếp sau lô có hạn dùng, hiển thị chưa có hạn dùng; không bỏ qua QC/tồn/nguồn |
| KQ-10 | UC-09 | Cần 10, lô đầu có 4 và lô sau có 6; bấm bổ sung phân bổ | Hai dòng 4 và 6 theo đúng thứ tự; không nhân đôi dòng cũ hoặc tạo lượng 0 |
| KQ-11 | UC-09 | Giao hai phần cho hai nhân viên | Mỗi nhân viên chỉ ghi được phần lô/vị trí/lượng được giao |
| KQ-12 | UC-08/09 | Hủy form, hoặc giải phóng phần chưa thực hiện | Hủy không lưu; giải phóng không sửa phiếu đã ghi sổ |
| KQ-13 | UC-10/11 | Nhân viên ghi một phần, rồi ghi phần còn lại | Cập nhật đúng từng lần, giữ lịch sử; không vượt phân công |
| KQ-14 | UC-09/11 | Lô hết hạn/cách ly, hàng đã giữ chỗ, nguồn sai hoặc kho khóa | Không cấp/ghi lượng không đủ điều kiện; không trừ tồn sai |

Bằng chứng đã chạy ở đợt code trước: 80 kiểm thử đơn vị (có so sánh hạn dùng/thời điểm nhập), bài trình duyệt phân công chia 4+6, bộ MySQL commerce. Bài workshop-storage kiểm tra ba xưởng × ba kho và mười vị trí/khu. Tài liệu này không chứng nhận thêm các ca chưa chạy riêng.`);
console.log('Updated SRS, UI_SPEC, DOMAIN_MODEL, USE_CASES, TEST_CASES.');
