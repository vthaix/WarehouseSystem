# Whitelist dữ liệu từ code

Danh sách trích từ C.fields trong service/helper. Đây là các field được chấp nhận, không nói tất cả bắt buộc hoặc cùng cấp: đọc đường dẫn/method và validation tương ứng để phân biệt body, query và dòng con.

| File | Method gần nhất | Đối tượng | Fields |
| --- | --- | --- | --- |
| src/modules/auth/AccountService.js | list | q | page, per_page, q, status, sort |
| src/modules/auth/AccountService.js | remove | b | version |
| src/modules/auth/AuthService.js | authenticate | body | username, password |
| src/modules/business-plans/BusinessPlanService.js | list | query | page, per_page, q, status, type, sort |
| src/modules/business-plans/BusinessPlanService.js | validateLines | line | item_id, quantity, unit_price |
| src/modules/business-plans/BusinessPlanService.js | create | body | confirm_plan_overage, type, supplier_id, customer_id, customer_order_id, production_plan_id, source_request_id, production_report_id, finished_report_id, planned_date, note, lines |
| src/modules/business-plans/BusinessPlanService.js | update | body | confirm_plan_overage, version, supplier_id, planned_date, note, lines |
| src/modules/business-plans/BusinessPlanService.js | review | body | confirm_plan_overage, version, decision, reason |
| src/modules/customer-orders/OrderService.js | list | query | page, per_page, q, status, from, to, sort |
| src/modules/customer-orders/OrderService.js | validateLines | line | item_id, quantity, note |
| src/modules/customer-orders/OrderService.js | create | body | delivery_address, latest_delivery_date, note, lines |
| src/modules/customer-orders/OrderService.js | update | body | version, delivery_address, latest_delivery_date, note, lines, quantity_change_acknowledged |
| src/modules/customer-orders/OrderService.js | receive | body | version |
| src/modules/exceptions/ExceptionService.js | create | b | stocktake_id, warehouse_id, stocktake_line_id, qc_inspection_line_id, action, quantity, reason, resolution_note, quarantine, allocations |
| src/modules/exceptions/ExceptionService.js | review | b | version, decision, reason |
| src/modules/exceptions/ExceptionService.js | apply | b | version |
| src/modules/exceptions/ExceptionService.js | reinspect | b | version, result, note |
| src/modules/exceptions/minute-exceptions.js | list | q | page, per_page, q, status, sort |
| src/modules/exceptions/quarantine.js | helper | line | location_id, quantity |
| src/modules/notifications/NotificationService.js | seen | body | resource_type, resource_id |
| src/modules/production/FinishedReportService.js | list | query | page, per_page, q, status, sort |
| src/modules/production/FinishedReportService.js | validate | output | item_id, lot_code, quantity, manufactured_date, expiry_date |
| src/modules/production/FinishedReportService.js | validate | line | item_id, used_quantity |
| src/modules/production/FinishedReportService.js | create | body | production_plan_id, completed_date, production_completed, report_mode, note, outputs, materials |
| src/modules/production/FinishedReportService.js | update | body | version, completed_date, production_completed, note, outputs, materials |
| src/modules/production/FinishedReportService.js | submit | body | version |
| src/modules/production/ProductionPlanService.js | list | query | page, per_page, q, status, sort |
| src/modules/production/ProductionPlanService.js | validateLines | line | item_id |
| src/modules/production/ProductionPlanService.js | create | body | confirm_plan_overage, customer_order_id, workshop_id, start_date, end_date, outputs, materials, material_source, note |
| src/modules/production/ProductionPlanService.js | cancel | body | version |
| src/modules/production/ProductionPlanService.js | update | body | confirm_plan_overage, version, workshop_id, start_date, end_date, outputs, materials, note |
| src/modules/production/ProductionPlanService.js | review | body | confirm_plan_overage, version, decision, reason |
| src/modules/production/ProductionReportService.js | list | query | page, per_page, q, status, sort |
| src/modules/production/ProductionReportService.js | validateLines | line | item_id, available_quantity, required_quantity |
| src/modules/production/ProductionReportService.js | create | body | production_plan_id, note, lines, report_purpose, progress_percentage, send_to_planner |
| src/modules/production/ProductionReportService.js | update | body | version, note, lines, progress_percentage, send_to_planner |
| src/modules/production/ProductionReportService.js | submit | body | version |
| src/modules/purchasing/MaterialCatalogService.js | list | q | q, page, per_page, sort, status |
| src/modules/purchasing/MaterialCatalogService.js | update | b | version, unit_id, reference_price, supplier_prices |
| src/modules/purchasing/MaterialCatalogService.js | update | row | supplier_id, unit_price |
| src/modules/purchasing/PurchaseOrderService.js | list | query | page, per_page, q, status, sort |
| src/modules/purchasing/PurchaseOrderService.js | create | body | source_mode, supplier_id, business_plan_id, production_report_id, expected_delivery_date, delivery_terms, lines |
| src/modules/quality/QualityCampaignService.js | list | query | page, per_page, q, status, sort |
| src/modules/quality/QualityCampaignService.js | create | body | campaign_type, quality_kind, planned_date, start_at, end_at, location, assignee_ids, lot_ids, note, source_mode, source_plan_id |
| src/modules/quality/QualityCampaignService.js | bindLots | body | version, lot_ids |
| src/modules/quality/QualityService.js | correct | body | version, reason, lines |
| src/modules/quality/QualityService.js | correct | line | lot_id, passed_quantity, failed_quantity, issue |
| src/modules/quality/QualityService.js | list | query | page, per_page, q, status, sort |
| src/modules/quality/QualityService.js | validateLines | line | lot_id, inspected_quantity, passed_quantity, failed_quantity, issue |
| src/modules/quality/QualityService.js | create | body | campaign_id, inspected_at, note, lines |
| src/modules/reporting/ReportService.js | warehouseLookup | query | format |
| src/modules/reporting/warehouse-lookup.js | lookup | query | warehouse_id, workshop_id |
| src/modules/returns/CustomerReturnService.js | list | q | page, per_page, q, status, sort |
| src/modules/returns/CustomerReturnService.js | deliveries | q | q |
| src/modules/returns/CustomerReturnService.js | create | b | warehouse_id, receiver_id, reason, lines |
| src/modules/returns/CustomerReturnService.js | create | line | original_stock_document_line_id, quantity, location_id |
| src/modules/returns/CustomerReturnService.js | action | b | version |
| src/modules/stock-requests/partial-receipt.js | create | body | purpose, production_source_mode, production_plan_id, workshop_id, warehouse_id, manager_id, requested_date, note, lines, receipt_key |
| src/modules/stock-requests/partial-receipt.js | create | line | item_id, quantity, manufactured_date, expiry_date, note |
| src/modules/stock-requests/StockRequestService.js | list | query | page, per_page, q, status, purpose, sort, type |
| src/modules/stock-requests/StockRequestService.js | validateLines | line | item_id, quantity, note |
| src/modules/stock-requests/StockRequestService.js | create | body | purpose, workflow_source_id, sale_plan_id, workshop_id, warehouse_id, manager_id, requested_date, requested_at, note, lines |
| src/modules/stock-requests/StockRequestService.js | create | body | purpose, warehouse_id, workshop_id, manager_id, requested_date, requested_at, purchase_order_id, business_plan_id, production_plan_id, production_report_id, production_source_mode, note, lines |
| src/modules/stock-requests/StockRequestService.js | update | body | version, requested_date, requested_at, warehouse_id, manager_id, note, lines |
| src/modules/stock-requests/StockRequestService.js | remove | body | version |
| src/modules/stocktakes/inspection-minutes.js | list | q | page, per_page, q, sort, status |
| src/modules/stocktakes/StocktakeService.js | list | q | page, per_page, q, status, sort, campaign_type |
| src/modules/stocktakes/StocktakeService.js | create | b | campaign_type, planned_date, start_at, end_at, item_kind, note, warehouses |
| src/modules/stocktakes/StocktakeService.js | create | w | warehouse_id, assignee_ids, conclusion_assignee_ids |
| src/modules/stocktakes/StocktakeService.js | action | b | version |
| src/modules/stocktakes/StocktakeService.js | counts | b | lines |
| src/modules/stocktakes/StocktakeService.js | counts | l | id, version, actual_quantity, cause |
| src/modules/stocktakes/StocktakeService.js | complete | b | version |
| src/modules/stocktakes/StocktakeService.js | differences | q | page, per_page, stocktake_id, warehouse_id |
| src/modules/tasks/inspection-scope.js | record | line | lot_id, counted_quantity |
| src/modules/tasks/TaskService.js | setMinuteAuthor | b | version, minute_author_id |
| src/modules/tasks/TaskService.js | list | query | page, per_page, q, status, sort |
| src/modules/tasks/TaskService.js | create | b | title, description, priority, start_at, end_at, assignee_ids, inspection_type, lot_header_id, finished_report_ids, material_source, material_lot_ids, location, minute_author_id |
| src/modules/tasks/TaskService.js | update | b | version, title, description, priority, start_at, end_at, assignee_ids, minute_author_id |
| src/modules/tasks/TaskService.js | remove | b | version |
| src/modules/tasks/TaskService.js | progress | b | version, status, count_lines |
| src/modules/warehouse/LotService.js | createLot | body | code, lines |
| src/modules/warehouse/LotService.js | createLot | line | purchase_order_line_id, received_quantity, manufactured_date, expiry_date |
| src/modules/warehouse/LotService.js | createLot | body | code, item_id, purchase_order_id, purchase_order_line_id, received_quantity, manufactured_date, expiry_date, lot_header_id |
| src/modules/warehouse/LotService.js | updateLot | body | version, manufactured_date, expiry_date |
| src/modules/warehouse/WarehouseFlowService.js | cancelAllocation | body | version |
| src/modules/warehouse/WarehouseFlowService.js | preview | query | task_id |
| src/modules/warehouse/WarehouseFlowService.js | dispatch | body | version, start_at, end_at, allocations |
| src/modules/warehouse/WarehouseFlowService.js | dispatch | line | assignee_id, stock_request_line_id, lot_id, location_id, quality_bucket, quantity |
| src/modules/warehouse/WarehouseFlowService.js | documents | query | page, per_page, q, type, sort |
| src/modules/warehouse/WarehouseFlowService.js | post | body | stock_request_id, request_version, task_id, note, allocations |
| src/modules/warehouse/WarehouseFlowService.js | post | line | allocation_id, stock_request_line_id, lot_id, location_id, quality_bucket, quantity, difference_reason |
| src/modules/warehouse/WarehouseRecordService.js | list | query | page, per_page, q, sort |
| src/modules/warehouse/WarehouseRecordService.js | create | body | stock_request_id, note |
| src/services/AuthService.js | helper | body | username, password |
| src/services/domain/business-flow.js | helper | b | purpose, production_report_id, workshop_id, requested_date, note, lines |
| src/services/domain/business-flow.js | helper | b | campaign_type, quality_kind, planned_date, start_at, end_at, location, assignee_ids, lot_ids, purchase_order_id, finished_report_id, note |
| src/services/domain/business-flow.js | helper | b | campaign_id, inspected_at, note, lines |
| src/services/domain/business-flow.js | helper | b | stock_request_id, note |
| src/services/domain/business-flow.js | helper | b | version |
| src/services/domain/business-flow.js | helper | b | version, decision, reason |
| src/services/domain/business-flow.js | helper | b | version |
| src/services/domain/business-flow.js | helper | b | version, title, description, start_at, end_at, priority, assignee_ids |
| src/services/domain/business-flow.js | helper | b | version, requested_date, note, lines |
| src/services/domain/dispatch.js | helper | b | version, start_at, end_at, allocations |
| src/services/domain/dispatch.js | helper | a | assignee_id, stock_request_line_id, lot_id, location_id, quantity, quality_bucket |
| src/services/domain/editing.js | helper | b | version |
| src/services/domain/editing.js | helper | l | item_id, quantity, note |
| src/services/domain/editing.js | helper | l | item_id, quantity, note |
| src/services/domain/inventory.js | helper | b | stock_request_id, request_version, allocations, note |
| src/services/domain/inventory.js | helper | a | stock_request_line_id, lot_id, location_id, quality_bucket, quantity, difference_reason |
| src/services/domain/inventory.js | helper | b | version |
| src/services/domain/inventory.js | helper | b | lines |
| src/services/domain/inventory.js | helper | x | id, version, actual_quantity, cause |
| src/services/domain/service.js | helper | l | item_id, quantity, unit_price, note |
| src/services/domain/workflows.js | helper | b | delivery_address, latest_delivery_date, note, lines |
| src/services/domain/workflows.js | helper | b | type, supplier_id, customer_id, customer_order_id, planned_date, note, lines, source_request_id |
| src/services/domain/workflows.js | helper | b | business_plan_id, expected_delivery_date, delivery_terms, workshop_ids |
| src/services/domain/workflows.js | helper | b | customer_order_id, workshop_id, start_date, end_date, outputs, materials, note |
| src/services/domain/workflows.js | helper | b | purpose, warehouse_id, workshop_id, requested_date, purchase_order_id, business_plan_id, production_plan_id, note, lines, manager_id |
| src/services/domain/workflows.js | helper | b | inspected_at, note, lines |
| src/services/domain/workflows.js | helper | l | lot_id, inspected_quantity, passed_quantity, failed_quantity, issue |
| src/services/domain/workflows.js | helper | b | planned_date, warehouses, start_at, end_at, item_kind, note |
| src/services/domain/workflows.js | helper | w | warehouse_id, assignee_ids |
| src/services/domain/workflows.js | helper | b | stocktake_id, warehouse_id, remarks |
| src/services/domain/workflows.js | helper | b | stocktake_id, warehouse_id, stocktake_line_id, reason, resolution_note |
| src/services/domain/workflows.js | helper | b | title, description, start_at, end_at, priority, assignee_ids |
| src/services/domain/workflows.js | helper | b | production_plan_id, note, lines |
| src/services/domain/workflows.js | helper | l | item_id, available_quantity, required_quantity |
| src/services/domain/workflows.js | helper | b | production_plan_id, completed_date, outputs, materials, note |
| src/services/domain/workflows.js | helper | o | item_id, quantity, lot_code, manufactured_date, expiry_date |
| src/services/domain/workflows.js | helper | m | item_id, used_quantity |
| src/services/domain/workflows.js | helper | b | version |
| src/services/domain/workflows.js | helper | b | version, delivery_address, latest_delivery_date, note, lines, quantity_change_acknowledged |
| src/services/domain/workflows.js | helper | b | version, requested_date, note |
| src/services/domain/workflows.js | helper | b | version, title, description, start_at, end_at, priority, assignee_ids |
| src/services/domain/workflows.js | helper | b | version, remarks |
| src/services/domain/workflows.js | helper | b | version, note, inspected_at |
| src/services/domain/workflows.js | helper | b | version, note |
| src/services/domain/workflows.js | helper | b | version |
| src/shared/ModuleRoutes.js | helper | req.query | page, per_page |
| src/shared/ModuleRoutes.js | helper | query | page, per_page, q, kind, sort |
| src/shared/ModuleRoutes.js | helper | req.body | outputs |
| src/shared/production-recipes.js | helper | output | item_id, quantity |
| src/shared/SourceImportService.js | preview | body | source_id, purpose, production_source_mode, workshop_id, warehouse_id, workflow_source, sale_plan_id |
| src/shared/TestResetRoutes.js | helper | req.body | confirmation |
