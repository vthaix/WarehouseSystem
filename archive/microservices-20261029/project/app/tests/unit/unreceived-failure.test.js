const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../../src/services/warehouse-service/modules/exceptions/unreceived-failure');

function connection(passed, receipts) {
  let calls = 0;
  return { async execute(sql) {
    if (++calls === 1) {
      assert.match(sql, /FOR UPDATE/);
      return [[{ lot_id: '9', passed_quantity: passed }]];
    }
    assert.match(sql, /d.type='IN'/);
    assert.match(sql, /d.status='POSTED'/);
    return [receipts];
  } };
}
test('failed portion remains actionable after multiple receipts of the passed portion', async () => {
  await validate(connection('1.000', [
    { quantity: '0.400', quality_bucket: 'AVAILABLE' },
    { quantity: '0.600', quality_bucket: 'AVAILABLE' },
  ]), '1');
  await validate(connection('0.000', []), '1');
});
test('receipt history exceeding QC pass is blocked even if current inventory was shipped', async () => {
  await assert.rejects(() => validate(connection('1.000', [
    { quantity: '1.001', quality_bucket: 'AVAILABLE' },
  ]), '1'), e => e.code === 'INVALID_STATE');
});
test('quarantine receipts stay outside the unreceived failure workflow', async () => {
  await assert.rejects(() => validate(connection('1.000', [
    { quantity: '0.100', quality_bucket: 'QUARANTINE' },
  ]), '1'), e => e.code === 'INVALID_STATE');
});
