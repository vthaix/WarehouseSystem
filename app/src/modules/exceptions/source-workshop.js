const C=require('../../services/domain/core');
async function resolve(c,r){
 const [rows]=await c.execute(`SELECT DISTINCT workshop_id FROM (
 SELECT p.workshop_id FROM production_plans p WHERE p.id=?
 UNION SELECT COALESCE(p.workshop_id,s.workshop_id,p2.workshop_id) FROM business_plans b LEFT JOIN production_reports br ON br.id=b.production_report_id LEFT JOIN production_plans p ON p.id=br.production_plan_id LEFT JOIN stock_requests s ON s.id=b.source_request_id LEFT JOIN production_plans p2 ON p2.id=b.production_plan_id WHERE b.id=?
 UNION SELECT COALESCE(p.workshop_id,s.workshop_id,w.workshop_id) FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id LEFT JOIN production_plans p ON p.id=l.production_plan_id LEFT JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id LEFT JOIN stock_requests s ON s.purchase_order_id=pl.purchase_order_id AND s.purpose='PURCHASE_RECEIPT' AND s.status<>'CANCELLED' LEFT JOIN inventory_balances inv ON inv.lot_id=l.id LEFT JOIN warehouse_locations loc ON loc.id=inv.location_id LEFT JOIN warehouses w ON w.id=loc.warehouse_id WHERE q.campaign_id=?
 UNION SELECT w.workshop_id FROM stocktake_warehouses sw JOIN warehouses w ON w.id=sw.warehouse_id WHERE sw.stocktake_id=?
 ) source WHERE workshop_id IS NOT NULL`,[r.MaKeHoachSanXuatQC||null,r.MaKeHoachMuaQC||null,r.id,r.id]);
 const ids=[...new Set(rows.map(x=>String(x.workshop_id)))];
 if(ids.length!==1)return null;
 const [[w]]=await c.execute('SELECT id,name FROM workshops WHERE id=? AND is_active=1',[ids[0]]);
 return w?{id:String(w.id),name:w.name}:null;
}
function validate(workshop,requested){C.fail(!workshop,'SOURCE_REQUIRED','Chưa xác định duy nhất xưởng phụ trách từ kế hoạch, yêu cầu nhập hoặc kho nguồn. Kiểm tra nguồn trước khi gửi đề xuất.',409);C.fail(requested!==undefined&&String(requested)!==workshop.id,'VALIDATION_ERROR','Người nhận đề xuất phải là chủ xưởng phụ trách nguồn hàng.');return workshop.id;}
module.exports={resolve,validate};
