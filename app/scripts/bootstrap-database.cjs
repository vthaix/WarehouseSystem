require('../src/config/env').loadEnv();
const {getPool,closePool}=require('../src/config/database');
require('../src/services/shared/database-bootstrap').prepareDatabase(getPool()).then(()=>console.log('Database ready; existing records retained.')).catch(e=>{console.error({event:'migration_failed',code:e.code||'CONFIG_ERROR'});process.exitCode=1;}).finally(closePool);
