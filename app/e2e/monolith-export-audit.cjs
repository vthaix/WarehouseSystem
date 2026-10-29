process.env.EXPORT_AUDIT_OUT=require('node:path').resolve(__dirname,'../artifacts/monolith-review/export-results.json');
require('./docx-export-probe.cjs');
