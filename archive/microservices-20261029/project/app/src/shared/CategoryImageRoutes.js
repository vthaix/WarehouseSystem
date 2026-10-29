const express=require('express'),crypto=require('node:crypto'),fs=require('node:fs/promises'),path=require('node:path');
const {csrf}=require('../middlewares/csrf.middleware');
const {requireApiAuth}=require('../middlewares/auth.middleware');
const role=require('../middlewares/role.middleware'),C=require('../services/domain/core'),{ok}=require('../utils/response');
const images=require('../config/category-images');
module.exports=()=>{
 const router=express.Router();
 router.post('/api/v1/category-images',csrf,requireApiAuth,role(['WAREHOUSE_MANAGER']),express.json({limit:'8mb'}),async(req,res)=>{
   const {bytes,extension}=images.decode(req.body),name=crypto.randomUUID()+'.'+extension;
   await fs.mkdir(images.directory(),{recursive:true});await fs.writeFile(path.join(images.directory(),name),bytes,{flag:'wx'});
   ok(req,res,{image_path:'/images/categories/'+name},201);
 });
 router.get('/images/categories/:file',requireApiAuth,async(req,res)=>{
   C.fail(!images.validName(req.params.file),'NOT_FOUND','Không tìm thấy ảnh.',404);
   res.set('Cache-Control','private, max-age=3600');res.sendFile(req.params.file,{root:images.directory(),dotfiles:'deny'});
 });
 return router;
};
