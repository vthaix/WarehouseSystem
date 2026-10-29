# API monolith

[Routes](generated/API_ROUTES.md) | [Fields](generated/API_CONTRACT_FIELDS.md) | [Architecture](MONOLITH.md)

POST /api/v1/purchase-orders: source_mode=PLAN, business_plan_id required; approved PURCHASE plan only. Each line supplies business_plan_line_id, supplier_id, unit_price. Quantity and delivery date follow the approved plan. MANUAL/REPORT purchase modes are rejected with PURCHASE_APPROVAL_REQUIRED.
