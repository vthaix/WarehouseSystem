const C=require('../../services/domain/core'),P=require('../../services/domain/policy'),paginate=require('../../utils/pagination');
const parse=value=>typeof value==='string'?JSON.parse(value):value||[];
class MaterialCatalogService{
  constructor(pool){this.pool=pool;}
  async metadata(u){P.role(u,['WAREHOUSE_MANAGER','PURCHASER']);const [units]=await this.pool.execute('SELECT id,name FROM units ORDER BY name');const [suppliers]=await this.pool.execute('SELECT id,code,name FROM suppliers WHERE is_active=1 ORDER BY name');return {units:units.map(r=>({...r,id:String(r.id)})),suppliers:suppliers.map(r=>({...r,id:String(r.id)}))};}
  dto(r){const out={...r,id:String(r.id),unit_id:String(r.unit_id),supplier_prices:parse(r.BangGiaNCC),actions:['edit']};delete out.BangGiaNCC;return out;}
  async get(u,id,c=this.pool){P.role(u,['WAREHOUSE_MANAGER','PURCHASER']);C.fail(!/^[1-9]\d*$/.test(String(id)),'NOT_FOUND','Không tìm thấy nguyên vật liệu.',404);const [[r]]=await c.execute("SELECT i.*,n.BangGiaNCC,u.name AS unit FROM items i JOIN NguyenVatLieu n ON n.MaMatHang=i.id JOIN units u ON u.id=i.unit_id WHERE i.id=? AND i.kind='MATERIAL' AND i.is_active=1",[id]);C.fail(!r,'NOT_FOUND','Không tìm thấy nguyên vật liệu đang hoạt động.',404);const dto=this.dto(r);if(!u.roles.includes('WAREHOUSE_MANAGER'))dto.actions=[];return dto;}
  async list(u,q={}){P.role(u,['WAREHOUSE_MANAGER','PURCHASER']);C.fields(q,['q','page','per_page','sort','status']);const p=paginate(q),args=[],where=["i.kind='MATERIAL'","i.is_active=1"];
    if(q.q){C.text(q.q,'q',150);where.push('(i.name LIKE ? OR i.code LIKE ?)');args.push('%'+q.q+'%','%'+q.q+'%');}
    const base=' FROM items i JOIN NguyenVatLieu n ON n.MaMatHang=i.id JOIN units u ON u.id=i.unit_id WHERE '+where.join(' AND ');const [[count]]=await this.pool.execute('SELECT COUNT(*) AS total'+base,args);const [rows]=await this.pool.execute('SELECT i.*,n.BangGiaNCC,u.name AS unit'+base+' ORDER BY i.name LIMIT ? OFFSET ?',[...args,String(p.per_page),String(p.offset)]);return {data:rows.map(r=>{const d=this.dto(r);if(!u.roles.includes('WAREHOUSE_MANAGER'))d.actions=[];return d;}),meta:{...p,total:Number(count.total),total_pages:Math.ceil(Number(count.total)/p.per_page)}};
  }
  async update(u,id,b,requestId){
    P.role(u,['WAREHOUSE_MANAGER']);C.fields(b,['version','unit_id','reference_price','supplier_prices']);C.price(b.reference_price);
    C.fail(!Array.isArray(b.supplier_prices)||b.supplier_prices.length>100,'VALIDATION_ERROR','Bảng giá nhà cung cấp không hợp lệ.');const seen=new Set();
    for(const row of b.supplier_prices){C.fields(row,['supplier_id','unit_price']);C.fail(!/^[1-9]\d*$/.test(String(row.supplier_id))||seen.has(String(row.supplier_id)),'VALIDATION_ERROR','Nhà cung cấp không hợp lệ hoặc trùng.');seen.add(String(row.supplier_id));C.price(row.unit_price);}
    C.fail(!/^[1-9]\d*$/.test(String(b.unit_id)),'VALIDATION_ERROR','Đơn vị tính không hợp lệ.');
    const c=await this.pool.getConnection();try{await c.beginTransaction();await this.get(u,id,c);const [[r]]=await c.execute('SELECT * FROM items WHERE id=? FOR UPDATE',[id]);C.version(r,b.version);
      const [[unit]]=await c.execute('SELECT id FROM units WHERE id=?',[b.unit_id]);C.fail(!unit,'VALIDATION_ERROR','Đơn vị tính không tồn tại.');
      if(String(r.unit_id)!==String(b.unit_id)){const [[used]]=await c.execute('SELECT (SELECT COUNT(*) FROM lots WHERE item_id=?)+(SELECT COUNT(*) FROM purchase_order_lines WHERE item_id=?)+(SELECT COUNT(*) FROM business_plan_lines WHERE item_id=?) AS total',[id,id,id]);C.fail(Number(used.total)>0,'IN_USE','nguyên vật liệu đã có chứng từ; không đổi đơn vị để tránh sai số lượng lịch sử.',409);}
      if(seen.size){const [suppliers]=await c.execute('SELECT id FROM suppliers WHERE is_active=1 AND id IN ('+[...seen].map(()=>'?').join(',')+')',[...seen]);C.fail(suppliers.length!==seen.size,'VALIDATION_ERROR','Nhà cung cấp không tồn tại hoặc ngừng hoạt động.');}
      const prices=b.supplier_prices.map(r=>({supplier_id:String(r.supplier_id),unit_price:C.money(C.price(r.unit_price))}));
      await c.execute('UPDATE items SET unit_id=?,reference_price=?,version=version+1 WHERE id=?',[b.unit_id,C.money(C.price(b.reference_price)),id]);
      await c.execute('UPDATE NguyenVatLieu SET BangGiaNCC=? WHERE MaMatHang=?',[JSON.stringify(prices),id]);
      await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,request_id) VALUES (?,'material-prices',?,'UPDATE',?)",[u.id,id,requestId]);await c.commit();
    }catch(e){await c.rollback();throw e;}finally{c.release();}return this.get(u,id);
  }
}
module.exports=MaterialCatalogService;
