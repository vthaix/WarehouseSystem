const test=require('node:test'),assert=require('node:assert/strict');
const AccountService=require('../../src/modules/auth/AccountService'),{canonical}=require('../../public/js/decimal-inputs');
const body={username:'tester',full_name:'Người thử nghiệm',email:'',password:'123456',roles:['CUSTOMER'],workshop_ids:[],status:'ACTIVE'};
test('account validation rejects unknown fields, duplicate roles, missing workshop and short passwords',()=>{
  const s=new AccountService({});s.validate(body,true);s.validate({...body,roles:['WORKSHOP_OWNER'],workshop_ids:['1']},true);
  for(const b of [{...body,password_hash:'injected'},{...body,roles:['CUSTOMER','CUSTOMER']},{...body,password:'123'},{...body,roles:['WORKSHOP_OWNER'],workshop_ids:[]},{...body,workshop_ids:['1']},{...body,roles:['WORKSHOP_OWNER'],workshop_ids:['1','2']}])assert.throws(()=>s.validate(b,true));
  const dto=s.dto({id:1,username:'admin',password_hash:'secret',full_name:'Admin',roles:['ADMIN'],workshop_ids:[],status:'ACTIVE',version:1,DaXoa:0});assert.equal(dto.password_hash,undefined);assert.equal(dto.password,undefined);
});
test('comma decimals keep exact digits and reject ambiguous grouping or exponents',()=>{
  assert.equal(canonical('1,250'),'1.250');assert.equal(canonical('100'),'100');assert.equal(canonical('0,0001'),'0.0001');assert.equal(canonical('2.5'),'2.5');
  for(const value of ['1.000,5','1,000.5','1e3','-1','abc','1,,5'])assert.throws(()=>canonical(value));
});
test('requested bakery dataset has 12 categories, 33 unique items, valid units and product recipes',()=>{
  const d=require('../../src/config/bakery-catalog'),recipes=require('../../src/config/production-recipes.json').recipes;
  assert.equal(d.categories.length,12);assert.equal(d.items.length,33);assert.equal(new Set(d.items.map(i=>i[0])).size,33);
  for(const i of d.items){assert.ok(d.units.some(u=>u[0]===i[3]));assert.ok(d.categories.some(c=>c[0]===i[2]));if(i[0].startsWith('TP-'))assert.ok(recipes[i[0]],i[0]+' needs a recipe');}
});
