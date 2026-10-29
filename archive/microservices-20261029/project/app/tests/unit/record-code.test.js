const test = require('node:test');
const assert = require('node:assert/strict');
const codes = require('../../src/shared/record-code');

test('business codes use Vietnamese customer names and a readable sequence', () => {
  assert.equal(codes.code('KHSX', 'Trần Văn A', 2), 'KHSX-TRANVANA-02');
  assert.equal(codes.code('DH', 'Đặng Thị Mỹ Linh', 12), 'DH-DANGTHIMYLINH-12');
  assert.ok(codes.code('TRANCC', 'Một tên rất dài của nhà cung cấp', 3).length <= 40);
});

test('related documents continue their own sequence', async () => {
  const connection = {
    async execute(sql, values) {
      assert.match(sql, /FROM stock_documents WHERE code LIKE \? FOR UPDATE/);
      assert.deepEqual(values, ['PN-YCKTRANVANA01-%']);
      return [[{ code: 'PN-YCKTRANVANA01-01' }, { code: 'PN-YCKTRANVANA01-03' }]];
    },
  };
  assert.equal(await codes.next(connection, 'stock_documents', 'PN', 'YCK-TRANVANA-01'), 'PN-YCKTRANVANA01-04');
});

test('customers with identical names keep distinct readable codes', async () => {
  const connection = { async execute(_sql, values) { assert.deepEqual(values, ['DH-TRANVANA-01']); return [[{id: 1}]]; } };
  const code = await codes.distinguishNames(connection, 'customer_orders', 'DH-TRANVANA-01', 7);
  assert.equal(code, 'DH-TRANVANA-01-KH7');
  assert.equal(codes.displayCode(code, 'DH-TRANVANA-01'), code);
});

test('older orders and plans receive the same readable references in API responses', () => {
  const user = { id: '7', roles: ['PLANNER'], workshop_ids: [] };
  const OrderService = require('../../src/services/business-service/modules/customer-orders/OrderService');
  const ProductionPlanService = require('../../src/services/business-service/modules/production/ProductionPlanService');
  const order = new OrderService({}).present(user, {id: 6, customer_id: 2, customer_name: 'Trần Văn A', customer_user_id: 7, order_sequence: 2, code: 'DH-7EAE62C6D16CCE32', status: 'APPROVED'});
  const plan = new ProductionPlanService({}).present(user, {id: 5, customer_order_id: 6, workshop_id: 1, created_by: 2, customer_name: 'Trần Văn A', order_sequence: 2, plan_sequence: 1, code: 'KSX-B1059C67896A0487', status: 'IN_PROGRESS'});
  assert.equal(order.display_code, 'DH-TRANVANA-02');
  assert.equal(plan.display_code, 'KHSX-TRANVANA-02');
  assert.equal(plan.customer_order_display_code, order.display_code);
});
