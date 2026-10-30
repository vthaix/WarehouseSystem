// Generated from src/config/navigation.js by npm run docs:sync.
const warehouseNavigation = {
  "labels": {
    "ADMIN": "Quản trị hệ thống",
    "MINUTE_EXCEPTION": "Ngoại lệ trong biên bản",
    "OPEN": "Chờ quản lý xử lý",
    "RESOLVED": "Đã xử lý",
    "LOT_INSPECTION": "Kiểm tra lô hàng",
    "PART": "Từng phần",
    "FINAL": "Tổng kết trước đây",
    "QC_FAILURE": "Hàng QC lỗi",
    "STOCKTAKE_DIFFERENCE": "Chênh lệch kiểm kê",
    "TIEN_DO": "Tiến độ",
    "SU_CO": "Sự cố",
    "NHU_CAU": "Thiếu / nhu cầu nguyên vật liệu",
    "RELEASE": "Giải phóng / tái kiểm để sử dụng lại",
    "SCRAP": "Tiêu hủy",
    "RETURN_SUPPLIER": "Trả nhà cung cấp",
    "QUARANTINE_DISPOSITION": "Xử lý hàng cách ly",
    "STOCK_QC_CORRECTION": "Điều chỉnh QC hàng đã nhập",
    "CUSTOMER_ACCEPTED": "Đã phê duyệt",
    "ORDER_PENDING_REVIEW": "Chờ phê duyệt",
    "ORDER_SUBMITTED": "Chờ tiếp nhận",
    "QUALITY_CHECK": "Kiểm tra chất lượng",
    "COUNT": "Kiểm đếm tồn kho",
    "PROCUREMENT": "Bổ sung nguyên vật liệu",
    "CLOSED_WITH_RETURNS": "Đã nhận, có trả NCC",
    "CUSTOMER": "Khách hàng",
    "PLANNER": "Lập kế hoạch",
    "PURCHASER": "Mua hàng",
    "WAREHOUSE_MANAGER": "Quản lý kho",
    "WAREHOUSE_STAFF": "Nhân viên kho",
    "QC_INSPECTOR": "QC/AC",
    "STOCKTAKER": "Ban kiểm kê",
    "WORKSHOP_OWNER": "Chủ xưởng",
    "DIRECTOR": "Giám đốc",
    "SUBMITTED": "Đã gửi",
    "RECEIVED": "Đã tiếp nhận",
    "APPROVED": "Đã duyệt",
    "REJECTED": "Bị từ chối",
    "IN_PROGRESS": "Đang thực hiện",
    "COMPLETED": "Hoàn thành",
    "PENDING_APPROVAL": "Chờ duyệt",
    "PENDING": "Chờ xử lý",
    "PARTIALLY_FULFILLED": "Xử lý một phần",
    "FULFILLED": "Đã xử lý đủ",
    "PARTIALLY_RECEIVED": "Nhận một phần",
    "POSTED": "Đã ghi sổ",
    "PLANNED": "Đã lên lịch",
    "COUNTING": "Đang kiểm đếm",
    "CLOSED": "Đã đóng",
    "CANCELLED": "Đã hủy",
    "VOID": "Đã hủy",
    "DRAFT": "Bản nháp",
    "APPLIED": "Đã áp dụng",
    "AVAILABLE": "Khả dụng",
    "QUARANTINE": "Cách ly",
    "PASSED": "Đạt",
    "PARTIAL": "Đạt một phần",
    "FAILED": "Không đạt",
    "IN": "Nhập",
    "OUT": "Xuất",
    "PURCHASE": "Mua",
    "SALE": "Bán",
    "MATERIAL": "Nguyên liệu",
    "FINISHED_PRODUCT": "Thành phẩm"
  },
  "modules": [
    [
      "material-prices",
      "Đơn giá nguyên vật liệu",
      "₫",
      [
        "WAREHOUSE_MANAGER",
        "PURCHASER"
      ],
      [],
      "/catalog/material-prices",
      "Đơn vị tính và đơn giá nguyên vật liệu theo từng nhà cung cấp."
    ],
    [
      "accounts",
      "Quản lý tài khoản",
      "♙",
      [
        "ADMIN"
      ],
      [
        "ADMIN"
      ],
      "/admin/accounts",
      "Thêm, sửa, xóa tài khoản và phân quyền sử dụng hệ thống."
    ],
    [
      "warehouse-lookup",
      "Tra cứu kho",
      "▦",
      [
        "WAREHOUSE_MANAGER",
        "WORKSHOP_OWNER"
      ],
      [],
      "/warehouse/lookup",
      "Xem sơ đồ vị trí, mặt hàng, lô và lượng tồn khả dụng."
    ],
    [
      "inspection-counts",
      "Quản lý kiểm kê",
      "≡",
      [
        "STOCKTAKER"
      ],
      [
        "STOCKTAKER"
      ],
      "/inspection-counts",
      "Chọn công việc và ghi số đếm các dòng lô trong một lần."
    ],
    [
      "customer-returns",
      "Hàng khách trả",
      "↩",
      [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/customer-returns",
      "Nhận hàng theo phiếu giao gốc và cách ly để QC kiểm tra."
    ],
    [
      "customer-orders",
      "Đơn hàng",
      "◫",
      [
        "CUSTOMER",
        "PLANNER"
      ],
      [
        "CUSTOMER"
      ],
      "/customer/orders",
      "Tiếp nhận và theo dõi đơn đặt hàng."
    ],
    [
      "business-plans",
      "Kế hoạch mua / bán",
      "▤",
      [
        "PLANNER",
        "DIRECTOR"
      ],
      [
        "PLANNER"
      ],
      "/plans",
      "Điều phối nhu cầu mua và giao hàng."
    ],
    [
      "purchase-orders",
      "Đơn mua hàng",
      "▧",
      [
        "PURCHASER"
      ],
      [
        "PURCHASER"
      ],
      "/purchases",
      "Tự nhập hoặc lấy kế hoạch mua nguyên vật liệu đã duyệt; chọn NCC theo từng nguyên vật liệu."
    ],
    [
      "categories",
      "Danh mục",
      "▦",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/categories",
      "Phân nhóm nguyên liệu và thành phẩm."
    ],
    [
      "items",
      "Mặt hàng",
      "◇",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/data",
      "Nguyên liệu, thành phẩm và hàng mẫu."
    ],
    [
      "warehouses",
      "Kho hàng",
      "⌂",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/data",
      "Thông tin các kho trong hệ thống."
    ],
    [
      "warehouse-locations",
      "Vị trí lưu kho",
      "⊞",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/data",
      "Quản lý kệ và ô lưu trữ."
    ],
    [
      "suppliers",
      "Nhà cung cấp",
      "◎",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/data",
      "Thông tin đối tác cung ứng."
    ],
    [
      "lots",
      "Lô hàng",
      "▥",
      [
        "WAREHOUSE_MANAGER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/catalog/data",
      "Theo dõi nguồn, hạn dùng và QC."
    ],
    [
      "stock-requests",
      "Yêu cầu nhập / xuất",
      "⇄",
      [
        "WORKSHOP_OWNER"
      ],
      [
        "WORKSHOP_OWNER"
      ],
      "/workshop/requests",
      "Lập yêu cầu theo chứng từ nguồn."
    ],
    [
      "stock-documents",
      "Phiếu nhập / xuất",
      "⇥",
      [
        "DIRECTOR",
        "WORKSHOP_OWNER"
      ],
      [],
      "/warehouse/documents",
      "Tra cứu chứng từ đã ghi sổ."
    ],
    [
      "qc-inspections",
      "Kiểm tra QC / AC",
      "✓",
      [
        "QC_INSPECTOR"
      ],
      [
        "QC_INSPECTOR"
      ],
      "/quality/inspections",
      "Số đạt và lỗi trước khi nhập kho."
    ],
    [
      "production-plans",
      "Kế hoạch sản xuất",
      "⚒",
      [
        "PLANNER",
        "DIRECTOR",
        "WORKSHOP_OWNER"
      ],
      [
        "PLANNER"
      ],
      "/production/plans",
      "Kế hoạch thành phẩm và nguyên liệu."
    ],
    [
      "production-reports",
      "Báo cáo sản xuất",
      "▱",
      [
        "WORKSHOP_OWNER",
        "PLANNER",
        "DIRECTOR"
      ],
      [
        "WORKSHOP_OWNER"
      ],
      "/production/reports",
      "Tiến độ, sự cố hoặc thiếu nguyên vật liệu khi đang sản xuất; gửi Ban giám đốc."
    ],
    [
      "finished-reports",
      "Báo cáo thành phẩm",
      "▣",
      [
        "WORKSHOP_OWNER",
        "DIRECTOR",
        "PLANNER"
      ],
      [
        "WORKSHOP_OWNER"
      ],
      "/production/finished-reports",
      "Sản lượng và lô hoàn thành."
    ],
    [
      "stocktakes",
      "Lập đợt kiểm kê",
      "≡",
      [
        "DIRECTOR"
      ],
      [
        "DIRECTOR"
      ],
      "/stocktakes",
      "Lập đợt, chọn phạm vi và phân công Ban kiểm kê / QC/AC."
    ],
    [
      "stocktake-minutes",
      "Biên bản kiểm kê",
      "▨",
      [
        "QC_INSPECTOR",
        "STOCKTAKER"
      ],
      [
        "STOCKTAKER",
        "QC_INSPECTOR"
      ],
      "/stocktake-minutes",
      "Tổng hợp số đếm và gửi biên bản."
    ],
    [
      "exception-proposals",
      "Xử lý ngoại lệ",
      "△",
      [
        "DIRECTOR",
        "WAREHOUSE_MANAGER",
        "WORKSHOP_OWNER"
      ],
      [
        "WAREHOUSE_MANAGER"
      ],
      "/approvals/exceptions",
      "Đề xuất điều chỉnh chênh lệch kiểm kê."
    ],
    [
      "tasks",
      "Quản lý công việc",
      "▢",
      [
        "DIRECTOR"
      ],
      [],
      "/tasks",
      "Xem, sửa, hủy công việc và theo dõi kết quả thực hiện."
    ],
    [
      "reports/inventory",
      "Báo cáo tồn kho",
      "◴",
      [
        "DIRECTOR",
        "WAREHOUSE_MANAGER",
        "WORKSHOP_OWNER"
      ],
      [],
      "/reports/inventory",
      "Tồn kho tại một mốc thời gian."
    ],
    [
      "reports/stock-documents",
      "Báo cáo nhập / xuất",
      "↗",
      [],
      [],
      "/reports/stock-documents",
      "Đối chiếu phiếu theo kho và ngày."
    ],
    [
      "reports/stocktakes",
      "Báo cáo kiểm kê",
      "▥",
      [
        "DIRECTOR"
      ],
      [],
      "/reports/stocktakes",
      "Snapshot, thực tế và chênh lệch."
    ],
    [
      "warehouse-records",
      "Hồ sơ kho tổng hợp",
      "▨",
      [],
      [],
      "/warehouse/records",
      "Tổng hợp phiếu kho từ các nhân viên."
    ],
    [
      "notifications",
      "Thông báo",
      "♧",
      [
        "*"
      ],
      [],
      "/notifications",
      "Thông tin nghiệp vụ dành cho bạn."
    ],
    [
      "warehouse-inbound",
      "Quản lý nhập kho",
      "⇥",
      [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF"
      ],
      [],
      "/warehouse/inbound",
      "Tiếp nhận, phân công từng lô và đối chiếu phiếu nhập kho."
    ],
    [
      "warehouse-outbound",
      "Quản lý xuất kho",
      "⇤",
      [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF"
      ],
      [],
      "/warehouse/outbound",
      "Phân công xuất nguyên vật liệu, giao thành phẩm và đối chiếu phiếu xuất."
    ]
  ],
  "fieldNames": {
    "zone_name": "Khu lưu kho",
    "zone_category_id": "Nhóm hàng của khu",
    "depth": "Độ sâu vị trí (1 là ngoài cùng)",
    "supplied_items": "Mặt hàng cung cấp",
    "minute_author_id": "Nhân viên lập biên bản chung",
    "minute_conclusion": "Kết luận biên bản",
    "minute_lines": "Kết quả kiểm tra trong biên bản",
    "requested_at": "Ngày giờ đề nghị thực hiện",
    "workflow_source_id": "Nguồn yêu cầu",
    "request_direction": "Thao tác",
    "sale_plan_id": "Kế hoạch bán cần giao",
    "source_lots": "Thông tin lô hàng nguồn",
    "documents": "Các phiếu nhập / xuất",
    "document_lines": "Chi tiết hàng thực nhập / xuất",
    "document_code": "Mã phiếu",
    "exception_mode": "Ngoại lệ",
    "exception_description": "Mô tả ngoại lệ",
    "exception_status": "Trạng thái ngoại lệ",
    "owner_instruction": "Phương án / ý kiến của chủ xưởng",
    "decision_status": "Kết quả xử lý",
    "source_kind": "Nguồn biên bản",
    "source_code": "Mã đợt nguồn",
    "lot_code": "Mã lô",
    "difference_quantity": "Chênh lệch số lượng",
    "counted_quantity": "Số lượng kiểm đếm",
    "counted_by": "Người kiểm đếm",
    "counted_at": "Thời điểm kiểm đếm",
    "KiemSoLuong": "Kiểm số lượng",
    "KiemChatLuong": "Kiểm chất lượng",
    "inspection_type": "Nhóm hàng",
    "inspection_lots": "Các phần / dòng lô được giao",
    "finished_report_code": "Báo cáo thành phẩm",
    "lot_header_code": "Lô tổng",
    "report_mode": "Hình thức báo cáo thành phẩm",
    "material_source": "Nguồn định lượng nguyên vật liệu",
    "customer_order_status": "Trạng thái đơn nguồn",
    "customer_note": "Ghi chú khách hàng",
    "image_path": "Ảnh",
    "quarantine_source": "Hàng / vị trí xử lý",
    "result": "Kết luận tái kiểm",
    "original_stock_document_line_id": "Dòng phiếu giao gốc",
    "returned_lot_detail_id": "Dòng lô nhận trả",
    "return_receiver_id": "Nhân viên nhận",
    "return_warehouse_id": "Kho nhận",
    "return_location_id": "Vị trí cách ly",
    "return_header_id": "Lô trả",
    "return_line_id": "Dòng trả",
    "receiver_id": "Nhân viên nhận",
    "conclusion_assignee_ids": "QC/AC lập kết luận (tùy chọn)",
    "reinspections": "Lịch sử tái kiểm",
    "campaign_type": "Loại đợt",
    "quality_kind": "Loại hàng QC",
    "campaign_id": "Lịch QC được giao",
    "location": "Địa điểm",
    "lot_ids": "Các lô cần kiểm tra",
    "source_request_id": "Yêu cầu bổ sung nguyên vật liệu",
    "production_report_id": "Báo cáo nhu cầu nguyên vật liệu",
    "report_purpose": "Mục đích báo cáo",
    "progress_percentage": "Tiến độ (%)",
    "send_to_planner": "Người nhận báo cáo",
    "production_completed": "Xác nhận hoàn tất sản xuất",
    "source_mode": "Nguồn mua đã được duyệt",
    "material_quality_standard": "Tiêu chuẩn nhập nguyên vật liệu",
    "default_shelf_life_days": "Hạn sử dụng mặc định (ngày)",
    "production_source_mode": "Nguồn xuất nguyên vật liệu",
    "finished_report_id": "Báo cáo thành phẩm",
    "report_kind": "Loại báo cáo",
    "base_quantity": "Nhu cầu gốc",
    "reserve_rate": "Dự phòng (%)",
    "estimated_shortage_quantity": "Thiếu dự kiến",
    "decision_history": "Lịch sử phê duyệt",
    "compensations": "Chứng từ bù QC",
    "detail_kind": "Loại chi tiết",
    "lot_header_id": "Lô hàng",
    "manager_id": "Quản lý kho phụ trách",
    "task_id": "Công việc được giao",
    "stock_request_id": "Yêu cầu kho",
    "task_type": "Loại công việc",
    "returned_supplier_quantity": "Lượng trả NCC",
    "shortage_quantity": "Lượng thiếu",
    "type": "Loại",
    "decision": "Quyết định",
    "difference": "Dòng chênh lệch",
    "code": "Mã",
    "name": "Tên",
    "title": "Tên công việc",
    "description": "Mô tả",
    "note": "Ghi chú",
    "status": "Trạng thái",
    "version": "Phiên bản",
    "item_id": "Mặt hàng",
    "item_name": "Tên hàng",
    "unit": "Đơn vị",
    "quantity": "Số lượng",
    "unit_price": "Đơn giá",
    "fulfilled_quantity": "Đã xử lý",
    "remaining_quantity": "Còn lại",
    "delivery_address": "Địa chỉ giao hàng",
    "latest_delivery_date": "Hạn giao hàng",
    "planned_date": "Ngày kế hoạch",
    "expected_delivery_date": "Ngày dự kiến nhận",
    "delivery_terms": "Điều khoản giao",
    "supplier_id": "Nhà cung cấp",
    "customer_id": "Khách hàng",
    "customer_order_id": "Đơn khách hàng",
    "business_plan_id": "Kế hoạch mua / bán",
    "purchase_order_id": "Đơn mua",
    "production_plan_id": "Kế hoạch sản xuất",
    "warehouse_id": "Kho",
    "workshop_id": "Xưởng",
    "category_id": "Danh mục",
    "unit_id": "Đơn vị",
    "kind": "Loại mặt hàng",
    "reference_price": "Giá tham khảo",
    "is_sample": "Hàng mẫu",
    "is_published": "Đã công bố",
    "is_active": "Đang hoạt động",
    "received_quantity": "Lượng nhận",
    "purchase_order_line_id": "Dòng đơn mua",
    "manufactured_date": "Ngày sản xuất",
    "expiry_date": "Hạn dùng",
    "requested_date": "Ngày yêu cầu",
    "purpose": "Mục đích",
    "inspected_at": "Thời gian kiểm tra",
    "lot_id": "Dòng lô",
    "inspected_quantity": "Số kiểm",
    "passed_quantity": "Số đạt",
    "failed_quantity": "Số lỗi",
    "issue": "Mô tả lỗi",
    "start_date": "Bắt đầu",
    "end_date": "Kết thúc",
    "start_at": "Bắt đầu",
    "end_at": "Kết thúc",
    "assignee_ids": "Người thực hiện",
    "priority": "Ưu tiên",
    "remarks": "Nhận xét biên bản",
    "stocktake_id": "Đợt kiểm kê",
    "stocktake_line_id": "Dòng chênh lệch",
    "reason": "Lý do",
    "resolution_note": "Phương án xử lý",
    "available_quantity": "Tồn khả dụng khi lập báo cáo",
    "required_quantity": "Nhu cầu",
    "used_quantity": "Đã sử dụng",
    "completed_date": "Ngày hoàn thành",
    "lines": "Chi tiết hàng",
    "outputs": "Thành phẩm",
    "materials": "Nguyên vật liệu",
    "system_quantity": "Snapshot",
    "actual_quantity": "Thực tế",
    "created_at": "Ngày tạo",
    "posted_at": "Ngày ghi sổ",
    "quoted_total": "Tổng báo giá",
    "order_total": "Tổng giá trị đơn hàng",
    "created_by_name": "Người lập",
    "customer_name": "Khách hàng",
    "workshop_name": "Xưởng phụ trách",
    "customer_order_code": "Mã đơn khách hàng",
    "production_plan_code": "Mã kế hoạch sản xuất",
    "return_warehouse_name": "Kho nhận",
    "return_receiver_name": "Nhân viên nhận",
    "total_amount": "Tổng tiền",
    "quality_bucket": "Nhóm chất lượng",
    "location_id": "Vị trí"
  },
  "roleLabels": {
    "PLANNER": {
      "customer-orders": "Tiếp nhận đơn hàng",
      "production-reports": "Báo cáo nhu cầu nhận được",
      "finished-reports": "Báo cáo thành phẩm nhận được"
    },
    "DIRECTOR": {
      "production-plans": "Phê duyệt kế hoạch sản xuất",
      "business-plans": "Phê duyệt kế hoạch mua / bán",
      "production-reports": "Báo cáo sản xuất nhận được",
      "finished-reports": "Báo cáo thành phẩm nhận được",
      "stock-documents": "Hồ sơ nhập / xuất kho",
      "exception-proposals": "Phê duyệt xử lý hàng cách ly"
    },
    "WAREHOUSE_STAFF": {
      "warehouse-inbound": "Nhập kho",
      "warehouse-outbound": "Xuất kho"
    },
    "STOCKTAKER": {
      "inspection-counts": "Thực hiện kiểm kê"
    },
    "WORKSHOP_OWNER": {
      "stock-requests": "Yêu cầu nhập / xuất kho",
      "production-plans": "Kế hoạch được giao",
      "stock-documents": "Hồ sơ nhập / xuất kho",
      "exception-proposals": "Phê duyệt đề xuất ngoại lệ"
    }
  }
};
