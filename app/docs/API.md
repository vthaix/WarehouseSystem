# API monolith

[Routes](generated/API_ROUTES.md) | [Fields](generated/API_CONTRACT_FIELDS.md) | [Architecture](MONOLITH.md)

POST /api/v1/purchase-orders: source_mode=PLAN (business_plan_id required; approved PURCHASE plan only; each line supplies business_plan_line_id, supplier_id, unit_price; quantity and delivery date follow the plan) or source_mode=MANUAL (no plan/report; each line supplies item_id, quantity, supplier_id with a price offer, unit_price; expected_delivery_date not in the past). Other modes are rejected with VALIDATION_ERROR.
GET /api/v1/stock-documents accepts q, type, status, warehouse_id, item_id, from, to; GET /api/v1/stock-documents/export?format=csv exports the same filter (one row per document line).
