// Build a reviewable content-only annotation plan. Word writing is a separate step.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '../docs/review-20261029');
const tables = JSON.parse(fs.readFileSync(path.join(dir, 'entity-source-lines.json'), 'utf8').replace(/^\uFEFF/, ''));
const split = s => s ? s.split(' ') : [];
const item = 'MatHang NguyenVatLieu ThanhPham';
const request = 'PhieuYeuCauNhapXuat ChiTietPhieuYeuCauNhapXuat';
const doc = 'PhieuKho ChiTietPhieuKho';
const report = 'BanBaoCaoSanXuat ChiTietBaoCaoSanXuat';
const plan = 'KeHoachSanXuat ChiTietKeHoachSanXuat';
const commerce = 'KeHoachMuaBan ChiTietKeHoachMuaBan';
const qc = 'KetQuaKiemTraQCAC ChiTietKetQuaKiemTraQCAC';
const count = 'PhieuKiemKe ChiTietPhieuKiemKe';
const task = 'CongViec PhanCongCongViec';
const lot = 'LoHang ChiTietLo';
const exception = 'BanDeXuatXuLyNgoaiLe KetQuaXuLyNgoaiLe';
// Core is used only for a step that explicitly reads/checks/changes domain data.
const core = {
 '29':'DonHang', '06':'LoaiHang','06.1':'LoaiHang','06.2':'LoaiHang','06.3':'LoaiHang',
 '07':item,'07.1':item,'07.2':item,'07.3':item,
 '08':doc,'09':doc,'13':'DotKiemKe '+task+' LoLichKiemTra PhanCongLichKiemTra',
 '17':exception,'18':'TonKho','19':doc,'20':doc,'21':count,
 '25':task,'25.1':task,'25.2':task,'31':'KeHoachSanXuat DonHang',
 '14':'DonMuaHang ChiTietDonMuaHang','23':request,'24':request,'24.1':request,'24.2':request,
 '27':'DonMuaHang ChiTietDonMuaHang','04':commerce,'05':commerce+' '+plan,'05.1':commerce+' '+plan,'05.2':commerce+' '+plan,
 '10':request+' PhanCongKho','11':task+' PhanCongKho','11.01':request+' PhanCongKho','11.02':request+' PhanCongKho',
 '35':report,'01':'NguoiDung','12':qc,'12.1':qc,'12.2':'ChungTuBuQC '+qc,'12.3':qc,
 '34':report,'15':count,'28':count,'32':commerce,
 '02':'DonHang ChiTietDonHang','03':'DonHang ChiTietDonHang','03.1':'DonHang ChiTietDonHang',
 '22':'Kho ViTriKho TonKho '+lot+' '+item,
 '16':count+' '+exception,
 'BS01':'NguoiDung NguoiDungVaiTro VaiTro NguoiDungXuong',
 'BS02':'DonViTinh MatHang NguyenVatLieu NhaCungCap',
 'BS03':request+' '+task+' PhanCongKho',
 'BS04':'DonMuaHang ChiTietDonMuaHang '+lot,
 'BS05':'LoHang ChiTietLo ChiTietLoTraVe',
 'BS06':exception+' PhanBoXuLy','BS07':'ThongBao',
 'BS08':'DonHang ChiTietDonHang KeHoachSanXuat ChiTietKeHoachSanXuat KeHoachMuaBan ChiTietKeHoachMuaBan DonMuaHang ChiTietDonMuaHang '+report+' ChiTietLoBaoCaoSanXuat '+request+' '+doc+' '+lot+' '+qc+' TonKho BienDongKho DotKiemKe '+count+' '+task+' '+exception,
};
// Exact main-flow assignments are intentionally separate from text inference.
// Keys are the displayed basic-flow step numbers; an empty string means no access.
const basic = {
 '29':{2:'DonHang',3:'DonHang',4:'DonHang ChiTietDonHang MatHang ThanhPham KhachHang',5:'DonHang',6:'DonHang'},
 '06':{2:'LoaiHang',3:'LoaiHang',4:'LoaiHang '+item},
 '06.1':{2:'LoaiHang',3:'LoaiHang',4:'LoaiHang',5:'LoaiHang'},
 '06.2':{1:'LoaiHang',2:'LoaiHang',3:'LoaiHang',4:'LoaiHang MatHang',5:'LoaiHang'},
 '06.3':{1:'LoaiHang',2:'LoaiHang',3:'LoaiHang',4:'LoaiHang',5:'LoaiHang',6:'LoaiHang'},
 '07':{2:'LoaiHang',3:'LoaiHang',4:'LoaiHang '+item+' DonViTinh'},
 '07.1':{2:item+' LoaiHang DonViTinh',3:item,4:item+' LoaiHang DonViTinh',5:item},
 '07.2':{1:item,2:item+' TonKho ChiTietPhieuKho ChiTietDonHang ChiTietDonMuaHang ChiTietKeHoachSanXuat ChiTietKeHoachMuaBan',3:item,4:item,5:item},
 '07.3':{1:item,2:item+' LoaiHang DonViTinh',3:item+' LoaiHang DonViTinh',4:item+' LoaiHang DonViTinh',5:item},
 '08':{2:'PhieuKho',3:'PhieuKho',4:doc+' MatHang NguyenVatLieu ThanhPham '+lot+' Kho ViTriKho'},
 '09':{2:'PhieuKho',3:'PhieuKho',4:doc+' MatHang NguyenVatLieu ThanhPham '+lot+' Kho ViTriKho'},
 '13':{2:'KeHoachMuaBan KeHoachSanXuat '+lot+' '+report+' NguoiDung NguoiDungVaiTro VaiTro NhanVien BoPhan',3:'KeHoachMuaBan KeHoachSanXuat '+lot+' '+report+' NguoiDung NguoiDungVaiTro VaiTro',4:'NguoiDung NguoiDungVaiTro VaiTro '+lot+' LoLichKiemTra PhanCongLichKiemTra PhanCongCongViec',6:'DotKiemKe '+task+' LoLichKiemTra PhanCongLichKiemTra ThongBao'},
 '17':{2:'BanDeXuatXuLyNgoaiLe',3:'BanDeXuatXuLyNgoaiLe',4:exception+' PhieuKiemKe ChiTietPhieuKiemKe '+qc+' '+lot+' '+item+' LoaiHang',5:'BanDeXuatXuLyNgoaiLe',6:exception+' ThongBao'},
 '18':{2:'Kho MatHang',3:'Kho MatHang',4:'TonKho Kho ViTriKho '+lot+' '+item+' DonViTinh'},
 '19':{2:'Kho MatHang PhieuKho',3:'Kho MatHang PhieuKho',4:doc+' MatHang ThanhPham NguyenVatLieu '+lot+' Kho ViTriKho'},
 '20':{2:'Kho MatHang PhieuKho',3:'Kho MatHang PhieuKho',4:doc+' MatHang ThanhPham NguyenVatLieu '+lot+' Kho ViTriKho'},
 '21':{2:'DotKiemKe CongViec PhieuKiemKe Kho',3:'DotKiemKe PhieuKiemKe Kho',4:count+' DotKiemKe Kho MatHang '+qc},
 '25':{2:'CongViec',3:'CongViec',4:task+' NguoiDung NhanVien'},
 '25.1':{1:'CongViec',2:task+' NguoiDung',3:'CongViec',4:'CongViec',5:'CongViec',6:task+' NguoiDung NguoiDungVaiTro VaiTro LoLichKiemTra PhanCongLichKiemTra '+lot,7:task+' LoLichKiemTra PhanCongLichKiemTra ThongBao'},
 '25.2':{1:'CongViec',2:'CongViec',3:'CongViec',4:'CongViec',5:task+' LoLichKiemTra PhanCongLichKiemTra'},
 '31':{2:'KeHoachSanXuat',3:'KeHoachSanXuat',4:plan+' DonHang ChiTietDonHang MatHang ThanhPham NguyenVatLieu Xuong',5:'KeHoachSanXuat',6:'KeHoachSanXuat DonHang NguoiDungXuong ThongBao'},
 '14':{2:'DonMuaHang'},
 '23':{2:'NguoiDungXuong Xuong Kho NguoiDung NguoiDungVaiTro KeHoachMuaBan DonMuaHang KeHoachSanXuat BanBaoCaoSanXuat',3:request+' KeHoachMuaBan DonMuaHang KeHoachSanXuat BanBaoCaoSanXuat '+lot+' Kho NguoiDung',4:request+' KeHoachMuaBan DonMuaHang KeHoachSanXuat BanBaoCaoSanXuat Xuong '+item+' '+lot,6:request,7:request+' NguoiDungXuong PhanCongKho '+doc+' '+lot+' '+qc,8:'PhieuYeuCauNhapXuat',9:'ChiTietPhieuYeuCauNhapXuat',10:'ThongBao'},
 '24':{2:'PhieuYeuCauNhapXuat',3:'PhieuYeuCauNhapXuat',4:request+' MatHang '+lot+' PhanCongKho CongViec'},
 '24.1':{1:'PhieuYeuCauNhapXuat',2:request+' PhanCongKho CongViec',3:request,4:request,5:request,6:request+' PhanCongKho',7:request},
 '24.2':{1:'PhieuYeuCauNhapXuat',2:'PhieuYeuCauNhapXuat',3:'PhieuYeuCauNhapXuat',4:request+' ThongBao'},
 '27':{2:'',3:'KeHoachMuaBan',4:commerce+' MatHang NguyenVatLieu DonViTinh '+report,5:'MatHang NguyenVatLieu NhaCungCap DonViTinh',6:commerce+' MatHang NguyenVatLieu NhaCungCap DonViTinh DonMuaHang ChiTietDonMuaHang',8:'DonMuaHang ChiTietDonMuaHang KeHoachMuaBan BanBaoCaoSanXuat'},
 '04':{2:'BanBaoCaoSanXuat KeHoachSanXuat DonHang',3:report,4:report+' MatHang NguyenVatLieu DonViTinh',5:report+' '+commerce,6:'ChiTietKeHoachMuaBan',8:commerce+' BanBaoCaoSanXuat ThongBao'},
 '05':{2:'KeHoachMuaBan KeHoachSanXuat',3:'KeHoachMuaBan KeHoachSanXuat',4:commerce+' '+plan+' DonHang ChiTietDonHang Xuong '+report+' '+item},
 '05.1':{1:'KeHoachMuaBan KeHoachSanXuat',2:commerce+' '+plan,3:commerce+' '+plan,4:commerce+' '+plan+' '+report,5:commerce+' '+plan},
 '05.2':{1:'KeHoachMuaBan KeHoachSanXuat',2:'KeHoachMuaBan KeHoachSanXuat DonMuaHang BanBaoCaoSanXuat PhieuYeuCauNhapXuat',3:'KeHoachMuaBan KeHoachSanXuat',4:'KeHoachMuaBan KeHoachSanXuat',5:commerce+' '+plan},
 '10':{2:task+' PhanCongKho '+request+' '+lot,3:task+' PhanCongKho '+lot+' ViTriKho',4:task+' PhanCongKho Kho ViTriKho '+lot+' '+qc+' ChiTietPhieuKho',6:doc+' TonKho BienDongKho PhanCongKho '+request+' CongViec'},
 '11':{2:task+' PhanCongKho PhieuYeuCauNhapXuat'},
 '11.01':{2:task+' PhanCongKho',3:task+' PhanCongKho',4:request+' '+plan+' '+report+' '+lot+' ViTriKho PhanCongKho',6:'TonKho '+lot+' PhanCongKho',7:doc+' TonKho BienDongKho PhanCongKho',8:request+' PhanCongKho CongViec',9:doc},
 '11.02':{2:task+' PhanCongKho',3:task+' PhanCongKho',4:request+' DonHang ChiTietDonHang '+plan+' '+commerce+' '+lot+' '+qc+' PhanCongKho',6:'TonKho '+lot+' PhanCongKho',7:doc+' TonKho BienDongKho PhanCongKho',8:request+' PhanCongKho CongViec DonHang KeHoachMuaBan',9:doc},
 '35':{2:plan+' Xuong '+report+' '+doc+' MatHang ThanhPham NguyenVatLieu',3:report+' ChiTietLoBaoCaoSanXuat '+lot,4:report+' ChiTietLoBaoCaoSanXuat '+lot+' '+plan+' '+doc,6:report+' ChiTietLoBaoCaoSanXuat '+lot+' KeHoachSanXuat ThongBao'},
 '01':{2:'',3:'',4:'NguoiDung NguoiDungVaiTro VaiTro LanThuDangNhap',6:'NguoiDung NguoiDungVaiTro VaiTro NguoiDungXuong PhienDangNhap'},
 '12':{2:'KetQuaKiemTraQCAC',3:'KetQuaKiemTraQCAC',4:qc+' '+lot+' '+item},
 '12.1':{2:'LoLichKiemTra PhanCongLichKiemTra '+task+' '+lot+' '+qc,3:'ChiTietKetQuaKiemTraQCAC ChiTietLo',4:qc+' '+lot+' LoLichKiemTra CongViec PhanCongLichKiemTra ChiTietLoTraVe DonMuaHang'},
 '12.2':{1:'ChungTuBuQC '+qc,2:qc+' ChiTietLo',3:'ChungTuBuQC ChiTietKetQuaKiemTraQCAC',4:'ChungTuBuQC '+qc+' ChiTietLo'},
 '12.3':{1:'KetQuaKiemTraQCAC',2:qc,3:'',4:''},
 '34':{2:'KeHoachSanXuat Xuong',3:'KeHoachSanXuat',4:plan+' Xuong MatHang NguyenVatLieu',5:'TonKho PhanCongKho ChiTietLo MatHang NguyenVatLieu',6:'BanBaoCaoSanXuat',7:'BanBaoCaoSanXuat',8:plan+' TonKho PhanCongKho MatHang NguyenVatLieu',9:'ChiTietKeHoachSanXuat TonKho PhanCongKho MatHang NguyenVatLieu',10:'BanBaoCaoSanXuat NguoiDung NguoiDungVaiTro VaiTro',11:'BanBaoCaoSanXuat NguoiDung NguoiDungVaiTro VaiTro',13:plan+' NguoiDungXuong '+report,14:'BanBaoCaoSanXuat',15:'ChiTietBaoCaoSanXuat',16:'BanBaoCaoSanXuat ThongBao NguoiDung NguoiDungVaiTro VaiTro',17:'BanBaoCaoSanXuat ThongBao NguoiDung NguoiDungVaiTro VaiTro'},
 '15':{2:task+' LoLichKiemTra PhanCongLichKiemTra '+lot+' MatHang DonViTinh '+count+' TonKho',3:count+' PhanCongLichKiemTra',4:count,6:count+' CongViec LoLichKiemTra PhanCongLichKiemTra'},
 '28':{2:task+' LoLichKiemTra PhanCongLichKiemTra '+count+' '+qc,3:'PhieuKiemKe LoLichKiemTra',4:'PhieuKiemKe LoLichKiemTra PhanCongLichKiemTra PhanCongKetLuanKiemKe '+qc+' ChiTietPhieuKiemKe ThongBao'},
 '32':{2:'KeHoachMuaBan',3:'KeHoachMuaBan',4:commerce+' '+report+' MatHang NguyenVatLieu ThanhPham TonKho '+lot+' '+qc,5:'KeHoachMuaBan',6:'KeHoachMuaBan ThongBao'},
 '02':{2:'MatHang ThanhPham LoaiHang DonViTinh',3:'MatHang ThanhPham DonViTinh',4:'',5:'MatHang ThanhPham KhachHang',6:'DonHang ChiTietDonHang KhachHang ThongBao'},
 '03':{2:'DonHang KhachHang',3:'DonHang',4:'DonHang ChiTietDonHang MatHang ThanhPham'},
 '03.1':{1:'DonHang',2:'DonHang ChiTietDonHang MatHang ThanhPham',3:'DonHang ChiTietDonHang',4:'DonHang ChiTietDonHang',5:'DonHang ChiTietDonHang KeHoachSanXuat ChiTietKeHoachSanXuat',6:'DonHang ChiTietDonHang'},
 '22':{2:'Kho LoaiHang MatHang',3:'Kho LoaiHang MatHang NguyenVatLieu ThanhPham '+lot,4:'Kho ViTriKho LoaiHang '+item+' '+lot+' TonKho',5:'Kho ViTriKho MatHang ChiTietLo',6:'Kho ViTriKho '+item+' DonViTinh '+lot+' TonKho PhanCongKho'},
 '16':{2:count+' LoLichKiemTra BanDeXuatXuLyNgoaiLe',3:'PhieuKiemKe LoLichKiemTra BanDeXuatXuLyNgoaiLe',4:count+' '+qc+' '+lot+' '+item+' BanDeXuatXuLyNgoaiLe',5:'PhieuKiemKe LoLichKiemTra BanDeXuatXuLyNgoaiLe',7:'PhieuKiemKe LoLichKiemTra '+exception+' ThongBao'},
 'BS01':{2:core.BS01,3:core.BS01+' Xuong',4:core.BS01,5:'NguoiDung',6:core.BS01+' Xuong'},
 'BS02':{1:core.BS02,2:core.BS02,3:core.BS02,4:core.BS02,5:core.BS02,6:core.BS02},
 'BS03':{1:'PhieuYeuCauNhapXuat',2:request+' Xuong Kho '+lot+' PhanCongKho',3:'NguoiDung NguoiDungVaiTro '+lot+' ViTriKho PhanCongKho',4:request+' '+qc+' TonKho PhanCongKho NguoiDung',5:task+' PhanCongKho',6:task+' PhanCongKho ThongBao'},
 'BS04':{1:'DonMuaHang ChiTietDonMuaHang',2:'DonMuaHang ChiTietDonMuaHang MatHang NguyenVatLieu DonViTinh NhaCungCap '+lot,3:lot,4:'DonMuaHang ChiTietDonMuaHang '+lot,5:lot,6:lot},
 'BS05':{2:doc+' DonHang MatHang ThanhPham',3:'ChiTietPhieuKho ChiTietLoTraVe Kho',4:doc+' '+lot+' ChiTietLoTraVe',5:'LoHang ChiTietLoTraVe',6:lot+' ChiTietLoTraVe TonKho BienDongKho'},
 'BS06':{1:exception+' PhanBoXuLy',2:lot+' TonKho '+qc+' '+doc+' PhanBoXuLy',3:exception,4:exception+' ThongBao',5:'TaiKiemChatLuong '+exception+' PhanBoXuLy',6:'TaiKiemChatLuong '+exception+' PhanBoXuLy '+doc+' TonKho BienDongKho '+qc},
 'BS07':{2:'ThongBao CongViec KeHoachSanXuat KeHoachMuaBan PhieuYeuCauNhapXuat LoLichKiemTra',3:'ThongBao',4:'ThongBao NguoiDungVaiTro',5:'ThongBao',6:'ThongBao'},
 'BS08':{2:'',4:'NguoiDung NguoiDungVaiTro',6:core.BS08},
};
function infer(id, text, branch) {
 const s=text.replace(/^\d+(?:\.\d+)*\.?\s*/, '').replace(/Chủ xưởng|chủ xưởng/g,'người phụ trách');
 if (/^(?:Không tự|Không dùng|Không bắt buộc|Chưa |Báo cáo không tự|Hệ thống hủy thông tin|Hệ thống hủy dữ liệu|Hệ thống không ghi phần hàng|Hệ thống không nhận hoặc hủy trùng)/.test(s)) return '';
 if (/yêu cầu nhập lại|yêu cầu chỉnh sửa|thông báo lỗi.*thông tin/.test(s)) return core[id];
 if (/Kết thúc|Quay lại|Đi đến bước|Tiếp tục bước|Hệ thống thực hiện UC|chuyển sang.*UC-|thử tải lại|Chọn Hủy|chọn Hủy|hủy form|Hủy trước khi|Không thực hiện thay đổi|không kết nối|kết nối trở lại|chưa có kết quả xác định|Chưa lưu|Không lưu dữ liệu sai|Không xóa dữ liệu|Giữ nguyên dữ liệu|không thông báo đã xóa|Giữ nguyên tài khoản/.test(s)) return '';
 if (/phiên đăng nhập|đăng nhập lại|không có quyền|Kiểm tra quyền|còn quyền|người dùng.*quyền|quyền sử dụng/.test(s)) return 'NguoiDung NguoiDungVaiTro VaiTro PhienDangNhap';
 if (/^Hệ thống yêu cầu sửa\.?$|^Hệ thống yêu cầu chỉnh sửa\.?$|^Hệ thống từ chối\.?$|^Hệ thống dừng thao tác\.?$|^Không áp dụng thay đổi\.?$|^Chưa ghi nhận hàng\.?$/.test(s)) return '';
 let a=[]; const add=v=>a.push(...split(v));
 if (/đơn hàng/.test(s) && !/đơn hàng mua|đơn hàng đã đặt/.test(s)) add('DonHang');
 if (/đơn mua|đơn hàng mua|đơn hàng đã đặt|lượng đã đặt/.test(s)) add('DonMuaHang ChiTietDonMuaHang');
 if (/kế hoạch sản xuất|sản lượng|công thức/.test(s)) add(plan);
 if (/kế hoạch mua|kế hoạch bán|kế hoạch BAN|kế hoạch MUA/.test(s)) add(commerce);
 if (/báo cáo/.test(s) && ['34','35','04','05','05.1','32'].includes(id)) add(report);
 if (/từng phần|phần lô|dòng lô|mã lô|lô thành phẩm|lô nguyên vật liệu|lô thực|cả lô/.test(s)) add(lot);
 if (/phiếu nhập|phiếu xuất|phiếu kho|phiếu giao|dòng giao gốc|chứng từ.*ghi|phiếu đã ghi/.test(s)) add(doc);
 if (/yêu cầu nhập kho|yêu cầu nhập hoặc xuất|yêu cầu xuất|yêu cầu còn|yêu cầu đã|yêu cầu chưa/.test(s)) add(request);
 if (/tồn kho|lượng có thể cấp|lượng còn có thể|lượng khả dụng|trống.*hàng|đã dành|dành hàng/.test(s)) add('TonKho PhanCongKho');
 if (/vị trí/.test(s)) add('ViTriKho Kho');
 if (/danh mục/.test(s)) add('LoaiHang');
 if (/mặt hàng|nguyên vật liệu|thành phẩm/.test(s)) {
   add('MatHang');
   if (/nguyên vật liệu/.test(s)) add('NguyenVatLieu');
   if (/thành phẩm/.test(s)) add('ThanhPham');
 }
 if (/đơn vị/.test(s)) add('DonViTinh');
 if (/nhà cung cấp/.test(s)) add('NhaCungCap');
 if (/xưởng/.test(s)) add('Xuong');
 if (/nhân viên|người được giao|người thực hiện|người lập biên bản|phân công/.test(s)) add('NguoiDung NguoiDungVaiTro '+task);
 if (/kết quả.*chất lượng|kết quả.*QC|QC.*kết quả|lượng đạt|lượng lỗi|số đạt|số lỗi/.test(s)) add(qc);
 if (/chứng từ bù|điều chỉnh kết quả/.test(s)) add('ChungTuBuQC '+qc);
 if (/số đếm|thực đếm|chênh lệch|số lượng.*kiểm kê/.test(s)) add(count);
 if (/biên bản/.test(s)) add('PhieuKiemKe LoLichKiemTra');
 if (/đợt kiểm kê|ngày bắt đầu|thời gian bắt đầu/.test(s)) add('DotKiemKe CongViec LoLichKiemTra');
 if (/đề xuất|phương án|quyết định/.test(s)) add(exception);
 if (/thông báo (?:cho|đến)|gửi thông báo|Gửi báo cáo đến|Gửi thêm Bộ phận/.test(s)) add('ThongBao');
 if (/thông báo.*đã đọc|tình trạng đọc|số việc mới|số liệu mới/.test(s)) add('ThongBao');
 if (/lưu|cập nhật|ghi nhận|xóa.*khỏi|không tìm thấy|không có.*(?:nào|trong|danh)|hiển thị|kiểm tra|Kiểm tra|chọn.*(?:cụ thể|cần|để xem)|mở.*(?:chi tiết|dòng|vấn đề)|nhập.*(?:thông tin|tên|số|lượng)|dữ liệu|kết quả|đề xuất|quyết định|đã.*(?:duyệt|xử lý)|xuất.*file/i.test(s)) {
   // A named source can supplement but never replace the UC's actual document.
   add(branch || core[id]);
 }
 return [...new Set(a)].join(' ');
}
const changes=[];const review=[];
for(const table of tables) {
 const id=table.title.match(/^UC-([\d.]+|BS\d+)/)[1];
 if(!core[id])throw Error('Unmapped UC '+id);
 let basicFlow=false, section='', branch='';
 for(const l of table.lines) {
   const s=l.text.trim();
   if(s==='Basic flow'){basicFlow=true;section='basic';continue;}
   if(s==='Alternative flow'||s==='Exception flow'){basicFlow=false;section=s;branch='';continue;}
   if(l.row<7 || !/^\d/.test(s))continue;
   if(/^\d+\.\d+/.test(s)) {branch='';continue;}
   const num=Number(s.match(/^\d+/)[0]);
   let names;
   if(basicFlow && Object.hasOwn(basic[id]||{},num))names=basic[id][num];
   else if(basicFlow && /Kết thúc|thành công|Chọn xác nhận|Chọn Xác nhận|Xác nhận|Gửi yêu cầu|Xác nhận mua|Chọn Gửi|Xem kết quả/.test(s)) names='';
   else names=infer(id,s,branch);
   if(!names){review.push({uc:id,...l,reason:'Không truy cập dữ liệu hoặc chỉ điều hướng/thông báo giao diện'});continue;}
   names=[...new Set(split(names))];
   const after=l.text+' ('+names.join(', ')+')';
   changes.push({uc:id,table:table.index,...l,entities:names,after});
 }
}
const planOut={source:'Tuan6_WarehouseTeam_ChiDacTaUC_SuaDungMau.docx',tables:tables.length,changes,unannotated:review};
const ddl=fs.readFileSync(path.resolve(__dirname,'../database/schema.sql'),'utf8');
const known=new Set([...ddl.matchAll(/CREATE TABLE\s+`?([A-Za-z0-9_]+)/g)].map(m=>m[1]));
for(const c of changes)for(const name of c.entities){if(!known.has(name))throw Error('Entity not in current schema: '+name);}
fs.writeFileSync(path.join(dir,'entity-annotation-plan.json'),JSON.stringify(planOut,null,2)+'\n');
const md=['# Đối chiếu entity bổ sung trong đặc tả','',
 'Chỉ bổ sung tên entity trong ngoặc sau bước có dữ liệu; giữ nguyên câu chữ trước ngoặc, bảng, ô, đoạn, ngắt dòng và định dạng của bản SuaDungMau.',
 '', 'Mô hình hiện tại: `MatHang` giữ thông tin chung; `NguyenVatLieu`, `ThanhPham` giữ thông tin riêng. `LoHang`, `ChiTietLo` thay cho các tên bảng lô nguyên vật liệu/thành phẩm cũ. Biên bản được lưu trên `PhieuKiemKe` hoặc `LoLichKiemTra` tùy loại đợt, không tạo bảng biên bản mới.',
 '', 'Các entity liệt kê theo nhánh được thực hiện; một bước có nhiều loại nguồn không đồng nghĩa mọi bảng đều được ghi trong cùng một lần. Trường hợp điều hướng, kết thúc, hủy chưa lưu hoặc thông báo lỗi kết nối không tự phát sinh entity.',
 '',`Đã bổ sung ${changes.length} bước trong ${tables.length} bảng UC.`, ''];
for(const table of tables){md.push('## '+table.title,'');for(const c of changes.filter(c=>c.table===table.index))md.push('- '+c.after);md.push('');}
fs.writeFileSync(path.join(dir,'DOI_CHIEU_ENTITY.md'),md.join('\n'));
console.log(JSON.stringify({tables:tables.length,annotated:changes.length,ucs:new Set(changes.map(c=>c.uc)).size,unannotated:review.length}));
