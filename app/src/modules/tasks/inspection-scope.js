const C=require('../../services/domain/core');
async function infer(c,ids){
  const [roles]=await c.execute('SELECT DISTINCT r.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id IN ('+ids.map(()=>'?').join(',')+") AND r.code IN ('STOCKTAKER','QC_INSPECTOR')",ids);
  return {count:roles.some(r=>r.code==='STOCKTAKER'),quality:roles.some(r=>r.code==='QC_INSPECTOR')};
}
async function sync(c,id,ids){
  const scope=await infer(c,ids);
  await c.execute('UPDATE stocktakes SET KiemSoLuong=?,KiemChatLuong=? WHERE id=?',[scope.count,scope.quality,id]);
  return scope;
}
async function finish(c,id){
  const [[campaign]]=await c.execute('SELECT KiemSoLuong,KiemChatLuong FROM stocktakes WHERE id=? FOR UPDATE',[id]);
  const [[pending]]=await c.execute("SELECT COUNT(*) AS total,SUM(CASE WHEN q.SoLuongDem IS NULL THEN 1 ELSE 0 END) AS count_pending,SUM(CASE WHEN l.qc_status='PENDING' THEN 1 ELSE 0 END) AS quality_pending FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id WHERE q.campaign_id=?",[id]);
  if(!Number(pending.total)||(campaign.KiemSoLuong&&Number(pending.count_pending))||(campaign.KiemChatLuong&&Number(pending.quality_pending)))return;
  await c.execute("UPDATE stocktakes SET status='COMPLETED',version=version+1 WHERE id=? AND status='IN_PROGRESS'",[id]);
  await c.execute("UPDATE tasks SET status='COMPLETED',version=version+1 WHERE stocktake_id=? AND task_type='LOT_INSPECTION' AND status='IN_PROGRESS'",[id]);
  await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) SELECT NguoiLapBienBanDuocChon,CONCAT('Lập biên bản đợt ',code),'Số đếm và kết quả QC theo phạm vi được giao đã đầy đủ. Bạn được chỉ định lập biên bản chung.','stocktake-minutes',id,CONCAT('minute-ready-',id,'-',NguoiLapBienBanDuocChon) FROM stocktakes WHERE id=? AND NguoiLapBienBanDuocChon IS NOT NULL ON DUPLICATE KEY UPDATE id=notifications.id",[id]);
}
async function record(c,user,row,b){
  C.fail(!row.actions.includes('recordCount'),'FORBIDDEN','Bạn không được ghi số đếm cho công việc này.',403);
  C.fail(!Array.isArray(b.count_lines)||!b.count_lines.length||b.count_lines.length>100,'VALIDATION_ERROR','Cần chọn dòng lô và số lượng đếm.');
  C.fail(b.count_lines.some(x=>!x||typeof x!=='object'),'VALIDATION_ERROR','Dòng kiểm đếm không hợp lệ.');
  const [[campaign]]=await c.execute('SELECT status FROM stocktakes WHERE id=? FOR UPDATE',[row.stocktake_id]);
  C.fail(campaign.status!=='IN_PROGRESS','INVALID_STATE','Đợt chưa bắt đầu hoặc đã kết thúc.',409);
  const [unrecordedLots]=await c.execute('SELECT lot_id FROM quality_campaign_lots WHERE campaign_id=? AND SoLuongDem IS NULL FOR UPDATE',[row.stocktake_id]);
  C.fail(unrecordedLots.length!==b.count_lines.length||unrecordedLots.some(l=>!b.count_lines.some(x=>String(x.lot_id)===String(l.lot_id))),'VALIDATION_ERROR','Nhập đầy đủ các dòng lô chưa kiểm đếm trong công việc và xác nhận một lần.');
  const seen=new Set();
  for(const line of b.count_lines){
    C.fields(line,['lot_id','counted_quantity']);
    C.fail(!/^[1-9]\d*$/.test(String(line.lot_id)),'VALIDATION_ERROR','Dòng lô không hợp lệ.');
    C.fail(seen.has(String(line.lot_id)),'VALIDATION_ERROR','Dòng lô bị trùng.');seen.add(String(line.lot_id));
    C.qty(line.counted_quantity,false);
    const [[lot]]=await c.execute('SELECT SoLuongDem FROM quality_campaign_lots WHERE campaign_id=? AND lot_id=? FOR UPDATE',[row.stocktake_id,line.lot_id]);
    C.fail(!lot||lot.SoLuongDem!==null,'INVALID_STATE','Dòng không thuộc đợt hoặc đã được ghi số đếm.',409);
    await c.execute('UPDATE quality_campaign_lots SET SoLuongDem=?,NguoiDem=?,ThoiDiemDem=NOW(6) WHERE campaign_id=? AND lot_id=?',[line.counted_quantity,user.id,row.stocktake_id,line.lot_id]);
  }
  await c.execute('UPDATE tasks SET version=version+1 WHERE id=?',[row.id]);
  await finish(c,row.stocktake_id);
}
module.exports={infer,sync,finish,record};
