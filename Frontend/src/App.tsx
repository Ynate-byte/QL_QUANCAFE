import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TrangBanHang from './pages/TrangBanHang';
import TrangQuanLyMenu from './pages/quanly/TrangQuanLyMenu';
import TrangQuanLyKho from './pages/quanly/TrangQuanLyKho';
import TrangQuanLyCongThuc from './pages/quanly/TrangQuanLyCongThuc';
import TrangQuanLyNhanSu from './pages/quanly/TrangQuanLyNhanSu';
import TrangQuanLyKhuyenMai from './pages/quanly/TrangQuanLyKhuyenMai';
import TrangBaoCao from './pages/baocao/TrangBaoCao';
import TrangDashboard from './pages/dashboard/TrangDashboard';
import TrangQuanLyKhachHang from './pages/quanly/TrangQuanLyKhachHang';
import TrangQuanLyPhanHoi from './pages/quanly/TrangQuanLyPhanHoi';
import TrangQuanLyDatBan from './pages/quanly/TrangQuanLyDatBan';
import TrangBaoCaoBangLuong from './pages/baocao/TrangBaoCaoBangLuong';
import TrangTraCuuDiem from './pages/TrangTraCuuDiem';
import TrangPhanHoiKhachHang from './pages/TrangPhanHoiKhachHang';

import BaoCaoLoiNhuan from './pages/baocao/BaoCaoLoiNhuan';
import TrangBaoCaoKhuyenMai from './pages/baocao/TrangBaoCaoKhuyenMai';

import TrangQuanLyBan from './pages/quanly/TrangQuanLyBan'; 

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tra-cuu-diem" element={<TrangTraCuuDiem />} />
        <Route path="/phan-hoi" element={<TrangPhanHoiKhachHang />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TrangDashboard />} />
          <Route path="/ban-hang" element={<TrangBanHang />} />
          <Route path="/quan-ly-dat-ban" element={<TrangQuanLyDatBan />} />

          {/* SỬA LỖI: Sử dụng đúng component đã import */}
          <Route path="/quan-ly-ban" element={<TrangQuanLyBan />} />
          
          <Route path="/quan-ly-khach-hang" element={<TrangQuanLyKhachHang />} />
          <Route path="/quan-ly-menu" element={<TrangQuanLyMenu />} />
          <Route path="/quan-ly-kho" element={<TrangQuanLyKho />} />
          <Route path="/quan-ly-cong-thuc" element={<TrangQuanLyCongThuc />} />
          <Route path="/quan-ly-nhan-su" element={<TrangQuanLyNhanSu />} />
          <Route path="/quan-ly-khuyen-mai" element={<TrangQuanLyKhuyenMai />} />
          <Route path="/quan-ly-phan-hoi" element={<TrangQuanLyPhanHoi />} />
          <Route path="/bao-cao" element={<TrangBaoCao />} />
          <Route path="/bao-cao/bang-luong" element={<TrangBaoCaoBangLuong />} />
          
          <Route path="/bao-cao/loi-nhuan-san-pham" element={<div className="quanly-container"><BaoCaoLoiNhuan /></div>} />
          <Route path="/bao-cao/hieu-qua-khuyen-mai" element={<TrangBaoCaoKhuyenMai />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;