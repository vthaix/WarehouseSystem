# Giao diện hiện hành

Cập nhật 27/10: yêu cầu nhập/xuất tự chọn tên xưởng thật theo tài khoản chủ xưởng, khóa ô khi chỉ có một xưởng. Màn hình Biên bản vẫn mở được với QC/AC và Ban kiểm kê; chỉ người được chỉ định có đợt đã hoàn tất mới được tạo. Người được chỉ định thấy phân công trên màn hình và nhận thông báo riêng. Chi tiết: [XUONG_PHU_TRACH_VA_NGUOI_LAP_BIEN_BAN.md](XUONG_PHU_TRACH_VA_NGUOI_LAP_BIEN_BAN.md).

Lập đợt kiểm kê của giám đốc có ô chọn phần lô NVL thực nhận ngay trong form, bên dưới nguồn lô/kế hoạch mua. Chọn các phần chờ QC cần kiểm, không phải lưu rồi mở Công việc để gắn lại. Chưa có hàng thực nhận thì hiển thị hướng dẫn lập đợt dự kiến. Hướng dẫn bù QC và kịch bản kiểm thử tại [TEST_BU_QC_VA_CHON_LO_KIEM_KE.md](TEST_BU_QC_VA_CHON_LO_KIEM_KE.md).

Cảnh báo số lượng kế hoạch vượt nguồn: khi lưu hoặc duyệt KHSX/kế hoạch mua/bán, chọn Đồng ý để tiếp tục hoặc Hủy để sửa lại. Không tự điều chỉnh số lượng người dùng nhập. Xem [XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md](XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md).

Hợp nhất 14/10/2026. Giao diện cập nhật theo mẫu dashboard người dùng cung cấp: sidebar trắng, thanh trên gọn, nền trắng/xám nhạt, đỏ vừa làm điểm nhấn và chữ đen. Xưởng bánh ngọt đóng gói; bảng/form responsive và cuộn ngang khi cần. Gateway render EJS; JavaScript bổ sung tương tác, không có ứng dụng frontend riêng.

Theme chung trong public/css/admin.css, áp dụng sau CSS cơ sở. Dashboard có ba thẻ đếm nghiệp vụ/vai trò/thông báo từ dữ liệu thật; không dùng số liệu doanh thu hay biểu đồ minh họa làm dữ liệu vận hành. Thanh tìm chức năng lọc theo quyền, sidebar thu gọn trên desktop và mở dạng drawer trên điện thoại. Kiểm thử giao diện: npm run test:theme:browser.

## Nguồn cấu hình

UC-22 có sơ đồ `/warehouse/lookup` dành riêng quản lý kho/chủ xưởng: chọn kho/loại hàng, chọn vị trí xem các lô và lượng tồn/giữ chỗ/khả dụng, trạng thái trống, tải lại và responsive. Menu chỉ hiện lối vào UC được cấp, khác quyền đọc dữ liệu nguồn. Vai trò hiện tên; timestamp dùng `HH:mm - dd/MM/yyyy` theo giờ Việt Nam, ngày thuần `dd/MM/yyyy`. Quy tắc và ma trận actor: [GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md](GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md).

Kiểm kê 23/10/2026: thêm **Quản lý kiểm kê → Tạo mới** cho Ban kiểm kê, chọn công việc và nhập mọi dòng lô chưa đếm một lần. Giám đốc chọn một người lập biên bản chung ngay lúc lập đợt; chỉ người đó được lập/sửa/gửi biên bản tổng hợp QC và số đếm. Danh sách ngoại lệ hiện vấn đề; Chi tiết của hồ sơ đang chờ quản lý mở ngay form xử lý và kết quả nguồn. Sidebar/thẻ/nút thông báo có huy hiệu tròn đỏ số trắng, cập nhật theo tài khoản. Quy tắc đếm và kịch bản: [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md).

Menu, vai trò, nhãn và field names lấy src/config/navigation.js. Browser dùng public/js/navigation-data.js được sinh bởi npm run docs:sync; không giữ một bộ menu/vai trò khác với server. API vẫn kiểm quyền/scope độc lập.

Danh sách module/route/vai trò hiện hành nằm ở [generated/PROJECT_MANIFEST.json](generated/PROJECT_MANIFEST.json). UI-01…UI-32 và UI-23B là mã truy vết trong MODULE_MATRIX; nhiều mã dùng chung list/detail/modal, không giả định mỗi mã có URL riêng. Hàng khách trả là màn bổ sung hiện có, không tự đổi số UC.

## Màn hình và thao tác chính

Form kế hoạch MUA hiện mã báo cáo thay `[object Object]`, ẩn NCC và dùng nhãn **Ngày mong nhận NVL**. Form đơn mua chỉ Tự nhập/Kế hoạch mua NVL; mỗi dòng NVL có NCC và giá, ngày PLAN tự điền/chỉ đọc. Nhận lô chọn NCC để lọc dòng. Lịch mới có min hôm nay, KHSX có max hạn giao đơn; backend kiểm lại. Chi tiết [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md).

Development có nút tạm **Xóa dữ liệu test** cạnh Đăng xuất cho mọi actor. Hộp thoại nêu phạm vi toàn hệ thống, danh mục giữ lại, yêu cầu nhập `XOA DU LIEU TEST`, có Hủy và khóa nút khi đang chạy. Thành công hiển thị backup và Đăng nhập lại. Trên điện thoại nhóm nút xuống hàng để tránh tràn. Tắt bằng `ENABLE_TEST_RESET=false`; production không hiện nút và endpoint bị chặn. Chi tiết [RESET_DU_LIEU_TEST.md](RESET_DU_LIEU_TEST.md).

UC-31 thực hiện tại **Kế hoạch sản xuất**, chọn đúng KHSX → **Phê duyệt**. Form gửi version của KHSX; không chuyển sang API duyệt đơn. Đơn hàng không có nút duyệt; khách tự thấy trạng thái đã phê duyệt sau khi giám đốc duyệt KHSX nguồn. Từ chối KHSX có lý do, trả planner chỉnh sửa và giữ đơn ở trạng thái hiện tại.

UC-02 có trang riêng `/customer/orders/create`, mở từ mục **Đặt hàng** trên sidebar hoặc nút **Đặt hàng** trong danh sách đơn của khách. Hiển thị thành phẩm mẫu đang công bố/hoạt động, giá và đơn vị; chọn nhiều loại, số lượng, ghi chú từng loại, địa chỉ, ngày nhận và ghi chú chung. Tổng tiền trên trang là dự kiến; server lấy lại giá khi gửi. Gửi thành công mở chi tiết đơn chờ tiếp nhận. Chỉ CUSTOMER truy cập trang; UC-03 vẫn dùng `/customer/orders`.

| Nhóm | Dữ liệu / thao tác |
| --- | --- |
| Đăng nhập/dashboard | Login theo session/CSRF, menu đúng actor, đăng xuất; không tự chọn vai trò để vượt quyền |
| Đơn hàng | Khách tạo/xem/sửa trước duyệt; planner tiếp nhận; BGĐ xem KHSX liên quan rồi duyệt |
| Kế hoạch | SX lấy đơn, nhập NVL gốc; MUA/BAN lấy báo cáo đúng loại; sửa/hủy theo trạng thái |
| Mua/nhận lô | PLAN/MANUAL; đổi chế độ xóa nguồn cũ; nhận lô theo đơn mua và lượng chưa nhận |
| Yêu cầu nhập/xuất | Bốn nhánh rõ ràng: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán |
| Phân công/phiếu/công việc | Quản lý chọn lô/vị trí/người/lượng; nhân viên chỉ ghi phần được giao; hủy phân bổ chưa ghi |
| QC | Lịch/phân công, kiểm từng dòng lô, đạt+lỗi=kiểm; bù/tái kiểm có lịch sử |
| Kiểm kê/kết luận | Snapshot theo kho, đếm phân biệt trống/0, hoàn tất/gửi kết luận từng kho, chênh lệch và đóng |
| Ngoại lệ | Nguồn/lượng/vị trí/phương án; giám đốc duyệt, QC xác nhận khi cần, quản lý thực hiện |
| Báo cáo SX | TIEN_DO/SU_CO/NHU_CAU khi chưa xong; BGĐ mặc định, còn thiếu NVL tự gửi planner; hỗ trợ dán ảnh/chụp đối chiếu; chỉ nhu cầu có bảng NVL |
| Báo cáo TP từng phần | Mỗi báo cáo tạo phần mới cùng lô tổng/KHSX; nhập lượng phần này/NVL dùng; chỉ đánh dấu hoàn tất ở phần cuối |
| Hàng khách trả | Dòng giao gốc, kho/vị trí/người nhận, nhận cách ly một lần; chưa tự hoàn tiền/giao bù |
| Tra cứu/báo cáo | Tồn/hồ sơ/kiểm kê theo quyền/bộ lọc, export trong giới hạn, không tạo entity hồ sơ mới |
| Thông báo | Danh sách/chi tiết/đánh dấu đọc đúng người nhận |

## Form nhập từng phần và lấy nguồn

Chủ xưởng lập báo cáo thành phẩm theo phần hoàn thành: nhập lượng phần mới, ngày sản xuất/hạn dùng; cùng đầu lô/KHSX, dòng riêng theo báo cáo. Gửi báo cáo để giám đốc chọn trong Công việc; QC rồi lập yêu cầu nhập từ chính báo cáo, không tạo lại một đợt nhập tay trùng phần.

Báo cáo thành phẩm có cột **Còn lại** cập nhật theo lượng kế hoạch, các báo cáo khác và lượng đang nhập. Tick đợt cuối tự điền phần chưa báo cáo của từng mặt hàng; đủ toàn bộ thì tự tick. Đối chiếu NVL hiển thị tổng xuất đã ghi sổ, đã dùng trước, dùng đợt này và phần chưa dùng. Gợi ý tiêu hao khi đợt cuối được sửa theo thực tế; không tự nhập lại NVL dư vào tồn kho.

Chọn nguồn chỉ tự điền form, không lưu/ghi tồn. Đổi nguồn bỏ phản hồi cũ; đang tải nguồn khóa lưu. Trước gửi người dùng kiểm/chỉnh sửa; backend kiểm lại nhu cầu/tồn/QC/trạng thái trong transaction.

NVL xuất có PLAN/REPORT; thành phẩm xuất có BAN/tổng kết hoàn tất, QC/tồn và kết quả kiểm kê gần nhất nếu có. Không bắt kiểm kê mới cho mỗi lần giao và không cộng số đếm vào tồn.

## Trạng thái và lỗi

Form có label, trường bắt buộc, lỗi giữ input; dữ liệu rỗng và không kết quả có thông báo rõ. Trong khi gửi tránh gửi trùng. Version cũ yêu cầu tải lại, không ghi đè. Lỗi mạng có thể chưa xác định kết quả, không tự retry mutation.

Phiếu đã ghi/báo cáo đã gửi không cho sửa đè; action theo server. Kho kiểm kê/hết hạn/giữ chỗ được chặn ở backend dù UI thiếu banner. APPLIED nghĩa đã thực hiện, APPROVED chỉ đã duyệt.

Chi tiết ngoại lệ hiển thị phân bổ, lịch sử quyết định và tái kiểm. Bộ nhãn lấy chung server/browser; không dùng màu thay chữ trạng thái.

## Mức nghiệm thu

Đã có test form import, nhập từng phần, tổng kết, cách ly/tiêu hủy/trả NCC/điều chỉnh QC và lịch sử. Chưa chứng nhận mọi nhánh keyboard/mobile/bộ lọc/xuất báo cáo hoặc toàn bộ yêu cầu phiếu chấm. Test browser mock write được kết hợp acceptance SQL riêng.

API: [API.md](API.md). Tiến độ: [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md). Không có UI quản lý nhân viên/bộ phận trong phạm vi hoàn thiện.


Ảnh danh mục: LoaiHang.DuongDanAnh / image_path, chọn/xem trước/bỏ ảnh, PNG/JPEG/WebP ≤5 MB. Migration service 007; file ở src/images/categories, Docker lưu volume category_images. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
# Cập nhật form lịch QC ngày 22/10/2026

Giám đốc vào **Lập đợt kiểm kê → Tạo mới**, chọn nhóm hàng Thành phẩm/Nguyên vật liệu để lấy nguồn lô. Thành phẩm chọn lô tổng rồi tích phần theo báo cáo thành phẩm đã gửi; NVL chọn lô theo kế hoạch MUA. Không chọn loại đợt QC/kiểm đếm. Chọn nhân viên qua hồ sơ hai nhóm: QC/AC kiểm chất lượng, Ban kiểm kê kiểm số lượng, cả hai thì thực hiện cả hai; có mô tả cụ thể. Lưu đồng thời đợt và công việc liên kết. **Quản lý công việc không có Tạo mới**, chỉ xem/sửa/hủy và thực hiện theo quyền, trạng thái. Chi tiết [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md).

Biên bản kiểm tra lô có chọn ngoại lệ; textarea chỉ hiện và bắt buộc khi chọn nhập mô tả. QC/AC và Ban kiểm kê không có chức năng Xử lý ngoại lệ. Quản lý xử lý trực tiếp hoặc tick gửi đề xuất tới chủ xưởng. Chủ xưởng từ chối phải nhập phương án khác; quản lý xác nhận thực hiện phương án đó. Chi tiết [NGOAI_LE_TRONG_BIEN_BAN.md](NGOAI_LE_TRONG_BIEN_BAN.md).

Yêu cầu kho của chủ xưởng gom thành Nhập/Xuất và bốn nhánh nguồn: mua NVL, báo cáo thành phẩm, KHSX cấp NVL, KHSX giao thành phẩm. Chọn ngày giờ đề nghị, xem lô/QC và gửi quản lý. Quản lý được gợi ý đúng giờ, chọn nhân viên/lô/vị trí/lượng. Nhân viên đối chiếu giấy, số lượng tự điền phần còn được giao và sửa được; hồ sơ tổng hợp ngay sau phiếu đã ghi. Chi tiết [YEU_CAU_NHAP_XUAT_CHU_XUONG.md](YEU_CAU_NHAP_XUAT_CHU_XUONG.md).

C?p nh?t danh m?c b?nh, ??n v?/gi? NVL v? qu?n tr? t?i kho?n: [QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md](QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md).
