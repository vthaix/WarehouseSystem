const { test } = require('node:test'), assert = require('node:assert/strict');
const dates = require('../../src/shared/planning-dates'), C = require('../../src/services/domain/core');
const today=C.today(), shift=n=>new Date(Date.parse(today+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
test('production window accepts delivery boundary and rejects past, reversed dates and late completion',()=>{
  assert.doesNotThrow(()=>dates.window(today,shift(2),shift(2)));
  for(const args of [[shift(-1),today,shift(2)],[shift(2),today,shift(2)],[today,shift(3),shift(2)]]) assert.throws(()=>dates.window(...args));
});
test('purchase arrival and sale dates cannot pass the source production/delivery deadline',async()=>{
  const c={execute:async()=>[[{end_date:shift(2),latest_delivery_date:shift(4)}]]};
  await assert.doesNotReject(()=>dates.businessDate(c,{type:'PURCHASE',production_plan_id:'1'},shift(2)));
  await assert.rejects(()=>dates.businessDate(c,{type:'PURCHASE',production_plan_id:'1'},shift(3)));
  await assert.rejects(()=>dates.businessDate(c,{type:'SALE',customer_order_id:'1'},shift(5)));
  await assert.rejects(()=>dates.businessDate(c,{type:'PURCHASE'},shift(-1)));
});
