// A final partial report represents the completed series. A non-final report
// continues to cover only its own portion. Only submitted parts can participate.
module.exports=(alias,seed='?')=>`${alias}.finished_report_id IN (SELECT part.id FROM finished_reports part JOIN finished_reports seed ON seed.id=${seed} WHERE part.status='SUBMITTED' AND (part.id=seed.id OR (seed.KieuThanhPham='PART' AND seed.production_completed=1 AND part.KieuThanhPham='PART' AND part.production_plan_id=seed.production_plan_id)))`;
