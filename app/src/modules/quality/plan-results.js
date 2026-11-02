const C=require('../../services/domain/core');
// Present staged checks alongside lot checks without manufacturing lots or
// duplicating the passed-only QC records created later by the warehouse.
const source=`(
 SELECT CAST(q.id AS CHAR) AS id,q.code,q.inspector_id,q.inspected_at,q.note,q.status,q.version,q.campaign_id,q.created_at,q.updated_at,'LOT' AS record_source
 FROM qc_inspections q WHERE NOT EXISTS (
  SELECT 1 FROM ThucKiemKeHoachMua s WHERE s.MaDot=q.campaign_id AND s.ThucNhan IS NOT NULL
 )
 UNION ALL
 SELECT CONCAT('PLAN-',st.id) AS id,CONCAT('QC-',st.code) AS code,MIN(s.NguoiQC) AS inspector_id,
 MAX(s.NgayQC) AS inspected_at,NULL AS note,'RECORDED' AS status,st.version,st.id AS campaign_id,
 MIN(s.NgayQC) AS created_at,MAX(s.NgayQC) AS updated_at,'PURCHASE_PLAN' AS record_source
 FROM stocktakes st JOIN ThucKiemKeHoachMua s ON s.MaDot=st.id
 WHERE st.KiemTheoKeHoach=1 AND s.ThucNhan IS NOT NULL
 GROUP BY st.id,st.code,st.version
) q`;
async function get(connection,user,id){
 const campaignId=id.slice(5);
 const [[campaign]]=await connection.execute("SELECT * FROM stocktakes WHERE id=? AND KiemTheoKeHoach=1",[campaignId]);
 C.fail(!campaign,'NOT_FOUND','Không tìm thấy kết quả QC.',404);
 let allowed=user.roles.includes('DIRECTOR');
 if(!allowed&&user.roles.includes('QC_INSPECTOR')){
  const [assigned]=await connection.execute('SELECT id FROM quality_campaign_assignments WHERE campaign_id=? AND user_id=?',[campaignId,user.id]);
  allowed=assigned.length>0;
 }
 C.fail(!allowed,'NOT_FOUND','Không tìm thấy kết quả QC.',404);
 const [[header]]=await connection.execute('SELECT q.* FROM '+source+' WHERE q.id=?',[id]);
 C.fail(!header,'NOT_FOUND','Không tìm thấy kết quả QC.',404);
 const lines=(await require('./purchase-plan-check').lines(connection,campaign)).filter(l=>l.received_quantity!==null);
 const [users]=await connection.execute('SELECT id,full_name FROM users WHERE id IN (SELECT NguoiQC FROM ThucKiemKeHoachMua WHERE MaDot=? AND NguoiQC IS NOT NULL)',[campaignId]);
 return {...header,id:String(header.id),campaign_id:String(campaignId),inspector_id:String(header.inspector_id),
  inspector_name:users.find(u=>String(u.id)===String(header.inspector_id))?.full_name||'',
  lines:lines.map(l=>({item_name:l.item_name,unit:l.unit,planned_quantity:l.planned_quantity,inspected_quantity:l.received_quantity,passed_quantity:l.passed_quantity,failed_quantity:l.failed_quantity,issue:l.issue,manufactured_date:l.manufactured_date,expiry_date:l.expiry_date,
   inspector_name:users.find(u=>String(u.id)===String(l.inspector_id))?.full_name||'',inspected_at:l.inspected_at})),actions:[]};
}
module.exports={source,get};
