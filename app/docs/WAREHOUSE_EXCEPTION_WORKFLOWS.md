# Xử lý hàng cách ly và điều chỉnh QC sau nhập kho

Cập nhật 14/10/2026. Phạm vi nghiệp vụ kho; quản lý nhân viên/bộ phận không thuộc đợt triển khai này.

## Hàng khách trả

Nhận trả vẫn tạo lô riêng và phiếu nhập QUARANTINE đúng một lần. QC kiểm toàn bộ dòng lô. QC đạt không tự chuyển tồn thành AVAILABLE.

Tại Xử lý ngoại lệ → Lập đề xuất → Xử lý hàng cách ly, quản lý chọn dòng QC/vị trí và lượng:
- RELEASE: giải phóng tối đa phần QC đạt chưa xử lý.
- SCRAP: loại bỏ tối đa phần QC lỗi chưa xử lý.

Giám đốc duyệt; quản lý thực hiện riêng. Tồn cách ly giảm; RELEASE tạo biến động AVAILABLE tăng bằng lượng giảm, SCRAP chỉ giảm tồn. Các đề xuất đang chờ/đã duyệt cùng nguồn được tính để chống vượt lượng. Không tự giao bù/hoàn tiền và không sửa đơn/lịch sử giao gốc.

## QC phát hiện sai sau khi đã nhập

Tại Xử lý ngoại lệ chọn Điều chỉnh QC hàng đã nhập:
1. Quản lý đề xuất QUARANTINE từ phần AVAILABLE còn trong kho.
2. Giám đốc duyệt.
3. QC phụ trách kết quả nguồn tái kiểm đúng lượng, kết luận FAILED.
4. Quản lý áp dụng: chuyển lượng đó AVAILABLE → QUARANTINE; ghi ChungTuBuQC với ảnh trước/sau, cập nhật kết luận hiện hành và phiên bản.
5. Lượng cách ly có thể lập SCRAP hoặc RELEASE. Với RELEASE của hàng điều chỉnh, phải có tái kiểm PASSED trước khi áp dụng và ghi chứng từ bù ngược lại.

NVL cách ly có dòng mua gốc còn được xử lý RETURN_SUPPLIER sau giám đốc duyệt: giảm tồn cách ly, tạo lô trả NCC và dòng truy vết lô gốc. Không tự tạo đơn mua bù.

Phiếu nhập cũ, dòng phiếu và sản lượng thực tế giữ nguyên. Không điều chỉnh lượng đã giao; không cách ly phần còn đang giữ chỗ cho xuất kho. Phải giải phóng phân công trước. Chặn kho đang kiểm kê, kho/vị trí ngừng hoạt động và giải phóng hàng hết hạn.

## API

POST /api/v1/exception-proposals:

```json
{
  "quarantine": true,
  "qc_inspection_line_id": "123",
  "action": "QUARANTINE",
  "quantity": "0.100",
  "reason": "Phát hiện lỗi bao bì sau nhập",
  "resolution_note": "Cách ly để xử lý",
  "allocations": [{"location_id": "5", "quantity": "0.100"}]
}
```

Backend cho phép nhiều vị trí, không trùng; tổng phân bổ phải bằng lượng đề xuất. Form hiện chọn một vị trí mỗi đề xuất; có thể lập nhiều đề xuất cho các vị trí khác.

POST /exception-proposals/:id/review dùng version/decision.
POST /exception-proposals/:id/reinspect dùng version/result/note.
POST /exception-proposals/:id/apply dùng version.
Đường dẫn đầy đủ có tiền tố /api/v1.

Lookup quarantine-lines và stock-qc-lines thuộc warehouse-service. Không expose root/SQL qua RPC. Ghi phiếu từ công việc có endpoint POST /tasks/:id/postTask; kiểm task_id khớp URL và dùng cùng cơ chế Idempotency-Key như stock-documents.

## Migration và kiểm thử

005_quarantine_disposition mở loại đề xuất, tái dùng PhanBoXuLy; 006_stock_qc_correction mở hành động QUARANTINE. Không thêm bản sao tồn hoặc bảng báo cáo mới. Đủ sáu checkpoint tại mọi schema trước khởi động.

Kiểm thử: Node validation; acceptance split MySQL kiểm cạnh tranh nguồn, duyệt/áp dụng, kho khóa, chứng từ bù, giữ nguyên phiếu nhập/giao và không ghi trùng; browser kiểm ba form với request ghi được mock.

Nguồn nghiệp vụ: SRS, USE_CASES, DOMAIN_MODEL. Trạng thái toàn UC cần đối chiếu phiếu chấm; không coi các kịch bản này chứng minh mọi nhánh đã hoàn chỉnh.

Phần QC lỗi chưa nhập có thể xử lý từng phần nhiều lần. Chỉ một đề xuất chưa hoàn tất mỗi dòng; tổng tiêu hủy/trả đã áp dụng được trừ khỏi lượng lỗi còn lại. Lookup không hiển thị lượng đã xử lý.