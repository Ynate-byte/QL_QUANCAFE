import { useState, useEffect, useCallback, useMemo } from "react";
import type { Ban } from "../interfaces/Ban";
import type { SanPham } from "../interfaces/SanPham";
import type { GioHangItem } from "../interfaces/GioHangItem";
import type { KhuyenMai } from "../interfaces/KhuyenMai";
import type { PhuongThucThanhToan } from "../interfaces/PhuongThucThanhToan";
import type { DonHang } from "../interfaces/DonHang";
import type { LoaiBanVoiBan, DanhMucVoiSanPham } from "../interfaces/LoaiBan";
import type { TaoDonHangChiTietDto } from "../interfaces/Dto";
import type { KhachHang, KhachHangLoyalty } from "../interfaces/KhachHang";
import type { BillDto } from "../interfaces/Bill";

import {
    layDanhSachBanTheoLoai,
    laySanPhamTheoDanhMuc,
    layKhuyenMaiHienCo,
    layPhuongThucThanhToan,
    getDonHangHienTai,
    getChiTietDonHangApi,
    taoDonHangApi,
    thanhToanApi,
    capNhatTrangThaiDonHangApi,
    checkStockApi,
    capNhatSoLuongApi,
    xoaSanPhamApi,
    themNhieuSanPhamVaoDonHangApi,
    capNhatKhachHangApi,
    thanhToanGopApi,
    getBillDetailsApi
} from "../api/banHangApi";

import { timKiemKhachHang, getKhachHangs } from "../api/khachHangApi";

import ModalThanhToan from "../components/ModalThanhToan";
import BillModal from "../components/BillModal";
import QrPaymentModal from "../components/QrPaymentModal";
import { useAuth } from "../context/AuthContext";
import '../styles/pages/TrangBanHang.css';

// #region --- Interfaces & Initial States ---
interface MergedTable { name: string; originalTables: Ban[]; originalOrders: DonHang[]; combinedCart: GioHangItem[]; }
interface ItemChoThem { sanPham: SanPham; soLuong: number; }
interface ConfirmationState { message: string; onConfirm: () => void; }
interface UIMessage { text: string; type: 'success' | 'error' | 'info'; }
interface PaymentData { maKhuyenMai?: number | null; maPhuongThucThanhToan: number; diemSuDung?: number }
// #endregion

function TrangBanHang() {
    // #region --- States ---
    const { auth } = useAuth();
    const [danhSachBanTheoLoai, setDanhSachBanTheoLoai] = useState<LoaiBanVoiBan[]>([]);
    const [danhSachSPTheoDanhMuc, setDanhSachSPTheoDanhMuc] = useState<DanhMucVoiSanPham[]>([]);
    const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState<KhuyenMai[]>([]);
    const [danhSachPTTT, setDanhSachPTTT] = useState<PhuongThucThanhToan[]>([]);
    const [toanBoKhachHang, setToanBoKhachHang] = useState<KhachHangLoyalty[]>([]);
    const [banDangChon, setBanDangChon] = useState<Ban | null>(null);
    const [isTakeAway, setIsTakeAway] = useState(false);
    const [donHangHienTai, setDonHangHienTai] = useState<DonHang | null>(null);
    const [gioHang, setGioHang] = useState<GioHangItem[]>([]);
    const [itemsChoThem, setItemsChoThem] = useState<ItemChoThem[]>([]);
    const [tablesToMerge, setTablesToMerge] = useState<Set<number>>(new Set());
    const [mergedTableInfo, setMergedTableInfo] = useState<MergedTable | null>(null);
    const [khachHangDonHang, setKhachHangDonHang] = useState<KhachHang | null>(null);
    const [tuKhoaTimKiemKH, setTuKhoaTimKiemKH] = useState('');
    const [ketQuaTimKiemKH, setKetQuaTimKiemKH] = useState<KhachHang[]>([]);
    const [dangTimKiemKH, setDangTimKiemKH] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billData, setBillData] = useState<BillDto | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const [tuKhoaTimKiemSP, setTuKhoaTimKiemSP] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [currentOrderForQr, setCurrentOrderForQr] = useState<BillDto | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);
    // #endregion

    // #region --- Data Fetching and State Management ---
    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const taiDuLieuBanDau = useCallback(async () => {
        setIsProcessing(true);
        try {
            const [dsBan, dsSanPham, dsKhuyenMai, dsPTTT, dsKhachHang] = await Promise.all([
                layDanhSachBanTheoLoai(), laySanPhamTheoDanhMuc(), layKhuyenMaiHienCo(), layPhuongThucThanhToan(), getKhachHangs()
            ]);
            setDanhSachBanTheoLoai(dsBan);
            setDanhSachSPTheoDanhMuc(dsSanPham);
            setDanhSachKhuyenMai(dsKhuyenMai);
            setDanhSachPTTT(dsPTTT);
            setToanBoKhachHang(dsKhachHang);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            showMessage("Không thể tải dữ liệu bán hàng, vui lòng kiểm tra kết nối server.", 'error');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    useEffect(() => { taiDuLieuBanDau(); }, [taiDuLieuBanDau]);

    useEffect(() => {
        if (!tuKhoaTimKiemKH.trim()) { setKetQuaTimKiemKH([]); return; }
        const handler = setTimeout(async () => {
            try {
                const ketQua = await timKiemKhachHang(tuKhoaTimKiemKH);
                setKetQuaTimKiemKH(ketQua);
            } catch (error) {
                console.error("Lỗi tìm kiếm khách hàng:", error);
                showMessage("Lỗi khi tìm kiếm khách hàng.", 'error');
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [tuKhoaTimKiemKH]);

    const napGioHang = useCallback((chiTiet: TaoDonHangChiTietDto[]) => {
        const danhSachSanPhamFlat = danhSachSPTheoDanhMuc.flatMap(dm => dm.danhSachSanPham);
        const gioHangMoi = chiTiet.map(ct => {
            const sp = danhSachSanPhamFlat.find(s => s.ma === ct.maSanPham);
            return { maSanPham: ct.maSanPham, tenSP: sp?.tenSP || 'N/A', soLuong: ct.soLuong, giaBan: ct.giaBan, thanhTien: ct.soLuong * ct.giaBan };
        });
        setGioHang(gioHangMoi);
        setItemsChoThem([]);
    }, [danhSachSPTheoDanhMuc]);

    const resetOrderState = useCallback((shouldReload = true) => {
        setDonHangHienTai(null);
        setBanDangChon(null);
        setIsTakeAway(false);
        setGioHang([]);
        setItemsChoThem([]);
        setIsPaymentModalOpen(false);
        setConfirmation(null);
        setTablesToMerge(new Set());
        setMergedTableInfo(null);
        setKhachHangDonHang(null);
        setTuKhoaTimKiemKH('');
        setKetQuaTimKiemKH([]);
        setDangTimKiemKH(false);
        if (shouldReload) { taiDuLieuBanDau(); }
    }, [taiDuLieuBanDau]);
    // #endregion

    // #region --- Order and Table Actions ---
    const handleHuyDon = (confirmFirst = true) => {
        const executeCancel = async () => {
            if (donHangHienTai && !mergedTableInfo) {
                await capNhatTrangThaiDonHangApi(donHangHienTai.ma, 'DaHuy');
            }
            resetOrderState();
            showMessage('Đã hủy đơn hàng/bỏ chọn.', 'info');
        };
        if (confirmFirst && (donHangHienTai || gioHang.length > 0 || itemsChoThem.length > 0 || mergedTableInfo)) {
            setConfirmation({ message: "Hủy thao tác hiện tại và xóa mọi món đã chọn?", onConfirm: executeCancel });
        } else {
            resetOrderState(false);
        }
    };

    const switchContext = (action: () => void) => {
        if (mergedTableInfo) {
            setConfirmation({ message: "Bạn muốn hủy gộp bàn hiện tại?", onConfirm: () => { resetOrderState(false); setConfirmation(null); action(); } });
            return;
        }
        if (itemsChoThem.length > 0 || (gioHang.length > 0 && !donHangHienTai)) {
            setConfirmation({ message: "Bạn có các món chưa lưu. Hủy bỏ để chuyển sang đơn khác?", onConfirm: () => { setConfirmation(null); setItemsChoThem([]); setGioHang([]); action(); } });
        } else {
            action();
        }
    };

    const handleChonBan = async (ban: Ban) => {
        if (isProcessing) return;

        // Nếu click lại vào bàn đang chọn, thì hủy chọn
        if (banDangChon?.ma === ban.ma) {
            handleHuyDon(false); // Hủy chọn bàn mà không hỏi xác nhận
            showMessage(`Đã hủy chọn bàn ${ban.tenBan}.`, 'info');
            return;
        }

        const selectAction = async () => {
            resetOrderState(false);
            setIsProcessing(true);
            setBanDangChon(ban);
            if (ban.trangThai === 'DangSuDung') {
                try {
                    const donHang = await getDonHangHienTai(ban.ma);
                    if (donHang) {
                        setDonHangHienTai(donHang);
                        const chiTiet = await getChiTietDonHangApi(donHang.ma);
                        napGioHang(chiTiet);
                        if (donHang.maKhachHang) {
                            const kh = toanBoKhachHang.find(c => c.maKhachHang === donHang.maKhachHang);
                            if (kh) setKhachHangDonHang({ ma: kh.maKhachHang, hoTen: kh.tenKhachHang, soDienThoai: kh.soDienThoai, email: kh.email, diemTichLuy: kh.diemTichLuy, ngaySinh: kh.ngaySinh || null });
                        }
                    } else { setDonHangHienTai(null); setGioHang([]); }
                } catch (error) {
                    console.error("Lỗi tải đơn hàng của bàn:", error);
                    showMessage("Lỗi khi tải đơn hàng của bàn.", 'error');
                }
            } else { setDonHangHienTai(null); setGioHang([]); }
            setIsProcessing(false);
        };
        switchContext(selectAction);
    };


    const handleChonMangVe = () => {
        if (isProcessing || isTakeAway) return;
        switchContext(() => { resetOrderState(false); setIsTakeAway(true); });
    };

    const handleGopBan = async () => {
        const banIds = Array.from(tablesToMerge);
        if (banIds.length < 2) { showMessage("Vui lòng chọn ít nhất 2 bàn để gộp.", 'info'); return; }
        setIsProcessing(true);
        try {
            const ordersToMerge: DonHang[] = [];
            const tablesToMergeInfo: Ban[] = [];
            let combinedCart: GioHangItem[] = [];
            const danhSachSanPhamFlat = danhSachSPTheoDanhMuc.flatMap(dm => dm.danhSachSanPham);
            for (const maBan of banIds) {
                const donHang = await getDonHangHienTai(maBan);
                const banInfo = danhSachBanTheoLoai.flatMap(lb => lb.danhSachBan).find(b => b.ma === maBan);
                if (donHang && banInfo) {
                    ordersToMerge.push(donHang);
                    tablesToMergeInfo.push(banInfo);
                    const details = await getChiTietDonHangApi(donHang.ma);
                    const cartItems = details.map(ct => {
                        const sp = danhSachSanPhamFlat.find(s => s.ma === ct.maSanPham);
                        return { maSanPham: ct.maSanPham, tenSP: sp?.tenSP || 'N/A', soLuong: ct.soLuong, giaBan: ct.giaBan, thanhTien: ct.soLuong * ct.giaBan };
                    });
                    combinedCart = [...combinedCart, ...cartItems];
                } else { throw new Error(`Bàn ${banInfo?.tenBan || maBan} không có đơn hàng hợp lệ để gộp.`); }
            }
            const finalCart = combinedCart.reduce((acc, item) => {
                const existingItem = acc.find(i => i.maSanPham === item.maSanPham);
                if (existingItem) {
                    existingItem.soLuong += item.soLuong;
                    existingItem.thanhTien = existingItem.soLuong * existingItem.giaBan;
                } else { acc.push({ ...item }); }
                return acc;
            }, [] as GioHangItem[]);
            resetOrderState(false);
            setMergedTableInfo({ name: tablesToMergeInfo.map(t => t.tenBan.replace(/Bàn| /gi, '')).join('&'), originalTables: tablesToMergeInfo, originalOrders: ordersToMerge, combinedCart: finalCart });
            setGioHang(finalCart);
            showMessage('Gộp bàn thành công! Đây là trạng thái tạm thời.', 'success');
        } catch (error) {
            console.error("Lỗi khi gộp bàn:", error);
            showMessage(`Lỗi khi gộp bàn: ${error instanceof Error ? error.message : "Lỗi không xác định"}`, 'error');
            setTablesToMerge(new Set());
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChonBanGop = () => {
        if (!mergedTableInfo) return;
        const isAlreadySelected = !banDangChon && !isTakeAway && !!mergedTableInfo;
        if (isAlreadySelected) {
            handleHuyGop();
        } else {
            const selectAction = () => {
                resetOrderState(false);
                setMergedTableInfo(mergedTableInfo);
                setGioHang(mergedTableInfo.combinedCart);
            };
            switchContext(selectAction);
        }
    };

    const handleHuyGop = () => {
        setConfirmation({ message: `Bạn có chắc muốn hủy gộp các bàn này?`, onConfirm: () => { resetOrderState(false); setConfirmation(null); } });
    };
    // #endregion

    // #region --- Cart Actions ---
    const handleThemMon = (sanPham: SanPham) => {
        if (!banDangChon && !isTakeAway && !mergedTableInfo) {
            showMessage("Vui lòng chọn bàn hoặc đơn mang về.", 'info'); return;
        }
        // #region LỖI FIX: Cấm thêm món khi bàn đã gộp
        if (banDangChon?.trangThai === 'DaGop') { // Kiểm tra trạng thái của bàn đang chọn
            showMessage(`Bàn ${banDangChon.tenBan} đã được gộp. Không thể thêm món.`, 'error');
            return;
        }
        // #endregion

        if (donHangHienTai && !mergedTableInfo) {
            setItemsChoThem(prev => {
                const itemTonTai = prev.find(item => item.sanPham.ma === sanPham.ma);
                return itemTonTai ? prev.map(item => item.sanPham.ma === sanPham.ma ? { ...item, soLuong: item.soLuong + 1 } : item) : [...prev, { sanPham, soLuong: 1 }];
            });
        } else {
            const newCart = [...gioHang];
            const idx = newCart.findIndex(item => item.maSanPham === sanPham.ma);
            if (idx > -1) {
                newCart[idx].soLuong++;
                newCart[idx].thanhTien = newCart[idx].soLuong * newCart[idx].giaBan;
            } else {
                newCart.push({ maSanPham: sanPham.ma, tenSP: sanPham.tenSP, soLuong: 1, giaBan: sanPham.gia, thanhTien: sanPham.gia });
            }
            setGioHang(newCart);
            if (mergedTableInfo) setMergedTableInfo(prev => prev ? { ...prev, combinedCart: newCart } : null);
        }
    };

    const handleXacNhanThemMon = async () => {
        if (!donHangHienTai || itemsChoThem.length === 0) return;
        setIsProcessing(true);
        const chiTietPayload = itemsChoThem.map(item => ({ maSanPham: item.sanPham.ma, soLuong: item.soLuong, giaBan: item.sanPham.gia }));
        try {
            const res = await themNhieuSanPhamVaoDonHangApi(donHangHienTai.ma, chiTietPayload);
            if (!res.ok) throw new Error(await res.text() || "Thêm món thất bại");
            const chiTietMoi = await getChiTietDonHangApi(donHangHienTai.ma);
            napGioHang(chiTietMoi);
            showMessage(`Đã thêm ${itemsChoThem.length} món vào đơn hàng.`, 'success');
        } catch (error) {
            showMessage(error instanceof Error ? error.message : "Thêm món thất bại.", 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCapNhatSoLuong = async (maSanPham: number, soLuongMoi: number) => {
        if (soLuongMoi <= 0) { handleXoaMonKhoiGioHang(maSanPham); return; }
        if (mergedTableInfo) {
            const newCart = gioHang.map(item => item.maSanPham === maSanPham ? { ...item, soLuong: soLuongMoi, thanhTien: soLuongMoi * item.giaBan } : item);
            setGioHang(newCart);
            setMergedTableInfo(prev => prev ? { ...prev, combinedCart: newCart } : null);
            return;
        }
        if (donHangHienTai) {
            setIsProcessing(true);
            try {
                if (!(await checkStockApi(maSanPham, soLuongMoi)).isAvailable) throw new Error(`Sản phẩm không đủ số lượng.`);
                await capNhatSoLuongApi(donHangHienTai.ma, maSanPham, soLuongMoi);
                const chiTietMoi = await getChiTietDonHangApi(donHangHienTai.ma);
                napGioHang(chiTietMoi);
            } catch (error) {
                showMessage(`Lỗi cập nhật: ${error instanceof Error ? error.message : "Lỗi không xác định"}`, 'error');
            } finally { setIsProcessing(false); }
        } else {
            const newCart = gioHang.map(item => item.maSanPham === maSanPham ? { ...item, soLuong: soLuongMoi, thanhTien: soLuongMoi * item.giaBan } : item);
            setGioHang(newCart);
        }
    };

    const handleXoaMonKhoiGioHang = (maSanPham: number) => {
        const item = gioHang.find(i => i.maSanPham === maSanPham);
        if (!item) return;
        const executeDelete = async () => {
            setIsProcessing(true);
            try {
                if (donHangHienTai && !mergedTableInfo) {
                    await xoaSanPhamApi(donHangHienTai.ma, maSanPham);
                    const chiTietMoi = await getChiTietDonHangApi(donHangHienTai.ma);
                    if (chiTietMoi.length === 0) {
                        showMessage("Đơn hàng đã hết món, tự động hủy đơn.", 'info');
                        handleHuyDon(false);
                    } else { napGioHang(chiTietMoi); }
                } else {
                    const newCart = gioHang.filter(i => i.maSanPham !== maSanPham);
                    setGioHang(newCart);
                    if (mergedTableInfo) setMergedTableInfo(prev => prev ? { ...prev, combinedCart: newCart } : null);
                }
            } catch (error) {
                console.error("Lỗi xóa món:", error)
                showMessage("Xóa món thất bại.", 'error');
            } finally { setIsProcessing(false); setConfirmation(null); }
        };
        setConfirmation({ message: `Bạn chắc chắn muốn xóa món "${item.tenSP}"?`, onConfirm: executeDelete });
    };
    // #endregion

    // #region --- Customer Actions ---
    const handleChonKhachHang = async (kh: KhachHang) => {
        setKhachHangDonHang(kh);
        setTuKhoaTimKiemKH('');
        setKetQuaTimKiemKH([]);
        setDangTimKiemKH(false);
        if (donHangHienTai) {
            setIsProcessing(true);
            try {
                await capNhatKhachHangApi(donHangHienTai.ma, kh.ma);
                showMessage(`Đã gán khách hàng ${kh.hoTen} vào đơn.`, 'success');
            } catch (error) {
                console.error("Lỗi gán khách hàng:", error);
                showMessage("Lỗi khi gán khách hàng.", 'error');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleBoChonKhachHang = async () => {
        setKhachHangDonHang(null);
        if (donHangHienTai) {
            setIsProcessing(true);
            try {
                await capNhatKhachHangApi(donHangHienTai.ma, null);
                showMessage(`Đã bỏ chọn khách hàng.`, 'info');
            } catch (error) {
                console.error("Lỗi bỏ chọn khách hàng:", error);
                showMessage("Lỗi khi bỏ chọn khách hàng.", 'error');
            } finally {
                setIsProcessing(false);
            }
        }
    };
    // #endregion

    // #region --- Main Payment and Order Creation Logic ---
    const handleTaoDonHang = async () => {
        if ((!banDangChon && !isTakeAway) || gioHang.length === 0) return;
        setIsProcessing(true);
        try {
            for (const item of gioHang) {
                if (!(await checkStockApi(item.maSanPham, item.soLuong)).isAvailable) throw new Error(`Sản phẩm "${item.tenSP}" không đủ số lượng.`);
            }
            const donHangData = {
                maNhanVien: auth?.maNhanVien ?? 0,
                maKhachHang: khachHangDonHang?.ma,
                loaiDonHang: isTakeAway ? "MangVe" : "TaiQuan",
                maBan: banDangChon?.ma,
                chiTietDonHang: gioHang.map(item => ({ maSanPham: item.maSanPham, soLuong: item.soLuong, giaBan: item.giaBan }))
            };
            const ketQua = await taoDonHangApi(donHangData);
            showMessage('Đã tạo đơn và gửi bếp thành công!', 'success');
            const donHangMoi: DonHang = {
                ma: ketQua.newOrderID, thoiGianDat: new Date().toISOString(), trangThai: 'DangPhaChe', maNhanVien: auth?.maNhanVien ?? 0, maKhachHang: khachHangDonHang?.ma ?? null,
                loaiDonHang: donHangData.loaiDonHang, maBan: banDangChon?.ma ?? null, ghiChuDonHang: null, maPhuongThucThanhToan: null, maKhuyenMai: null, maDatBan: null, phuPhi: 0
            };
            setDonHangHienTai(donHangMoi);
            setItemsChoThem([]);
            if (banDangChon) {
                setDanhSachBanTheoLoai(prevDs => prevDs.map(loai => ({ ...loai, danhSachBan: loai.danhSachBan.map(ban => ban.ma === banDangChon.ma ? { ...ban, trangThai: 'DangSuDung' } : ban) })));
            }
        } catch (error) {
            showMessage(`Tạo đơn hàng thất bại: ${error instanceof Error ? error.message : String(error)}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleThanhToan = async (data: PaymentData) => {
        setIsProcessing(true);
        setIsPaymentModalOpen(false);
        try {
            const pttt = danhSachPTTT.find(p => p.ma === data.maPhuongThucThanhToan);
            let orderToProcessId: number;

            if (mergedTableInfo) {
                const gopResult = await thanhToanGopApi({ ...data, donHangIds: mergedTableInfo.originalOrders.map(o => o.ma), maKhachHang: khachHangDonHang?.ma });
                if (!gopResult.ok) throw new Error(await gopResult.text() || "Thanh toán gộp thất bại.");
                const resultData = await gopResult.json();
                orderToProcessId = resultData.FinalOrderID;
                showMessage(`Thanh toán gộp thành công!`, 'success');
            } else {
                if (donHangHienTai) {
                    orderToProcessId = donHangHienTai.ma;
                } else {
                    if (gioHang.length === 0) throw new Error("Giỏ hàng trống.");
                    for (const item of gioHang) {
                        if (!(await checkStockApi(item.maSanPham, item.soLuong)).isAvailable) throw new Error(`Sản phẩm "${item.tenSP}" không đủ số lượng.`);
                    }
                    const donHangData = {
                        maNhanVien: auth?.maNhanVien ?? 0, maKhachHang: khachHangDonHang?.ma, loaiDonHang: isTakeAway ? "MangVe" : "TaiQuan",
                        maBan: banDangChon?.ma, chiTietDonHang: gioHang.map(item => ({ maSanPham: item.maSanPham, soLuong: item.soLuong, giaBan: item.giaBan }))
                    };
                    const taoDonHangResult = await taoDonHangApi(donHangData);
                    orderToProcessId = taoDonHangResult.newOrderID;
                }

                if (pttt?.tenPhuongThuc === 'Chuyển khoản ngân hàng') {
                    await processQrPayment(orderToProcessId, data);
                    return;
                } else {
                    await processStandardPayment(orderToProcessId, data);
                }
            }
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            showMessage(`Thanh toán thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`, 'error');
            setIsProcessing(false);
        }
    };

    const processQrPayment = async (orderId: number, paymentData: PaymentData) => {
        setLoadingQr(true);
        setIsQrModalOpen(true);
        try {
            // First, finalize the payment in your system to update order status, etc.
            await thanhToanApi(orderId, paymentData); 
            // Then, fetch the finalized bill details to get the final amount
            const billDetails = await getBillDetailsApi(orderId);
            if (!billDetails) throw new Error("Không thể lấy chi tiết hóa đơn.");
            setCurrentOrderForQr(billDetails);

            // Generate QR code using VietQR API
            const vietQrPayload = { accountNo: "0367931215", accountName: "DOAN VAN VINH", acqId: "970422", amount: billDetails.tongCong, addInfo: `TT DH ${orderId}`, format: "text", template: "compact2" };
            const qrResponse = await fetch('https://api.vietqr.io/v2/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vietQrPayload) });
            if (!qrResponse.ok) throw new Error("Tạo mã QR thất bại.");
            const qrData = await qrResponse.json();
            setQrCodeUrl(qrData.data.qrDataURL);
        } catch (error) {
            console.error(error);
            showMessage(error instanceof Error ? error.message : "Lỗi khi tạo mã QR", 'error');
            setIsQrModalOpen(false);
        } finally {
            setLoadingQr(false);
            setIsProcessing(false);
        }
    };

    const finalizeAndPrint = async (orderId: number) => {
        try {
            const billDetails = await getBillDetailsApi(orderId);
            setBillData(billDetails);
            setIsBillModalOpen(true);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin hóa đơn cuối cùng:", error);
            showMessage("Thanh toán thành công nhưng không thể tải hóa đơn.", 'error');
            resetOrderState(true);
        }
    };

    const processStandardPayment = async (orderId: number, paymentData: PaymentData) => {
        await thanhToanApi(orderId, paymentData);
        showMessage(`Thanh toán thành công đơn hàng #${orderId}`, 'success');
        await finalizeAndPrint(orderId);
        setIsProcessing(false);
    };

    const handleConfirmQrPayment = async () => {
        if (!currentOrderForQr) return;
        setIsQrModalOpen(false);
        showMessage(`Đã xác nhận thanh toán cho đơn #${currentOrderForQr.maDonHang}.`, 'success');
        await finalizeAndPrint(currentOrderForQr.maDonHang);
    };

    const handleCloseBillModal = () => {
        setIsBillModalOpen(false);
        setBillData(null);
        resetOrderState(true);
    };
    // #endregion

    // #region --- Derived State and Render Logic ---
    const allMergedTableIds = new Set(mergedTableInfo?.originalTables.map(t => t.ma) ?? []);
    let orderTitle = "Vui lòng chọn bàn";
    const isViewingMergedTable = mergedTableInfo && !banDangChon && !isTakeAway;
    if (isTakeAway) { orderTitle = "Đơn Hàng Mang Về"; }
    else if (banDangChon) { orderTitle = `Đơn hàng - ${banDangChon.tenBan}`; }
    else if (isViewingMergedTable) { orderTitle = `Đơn hàng - Bàn gộp ${mergedTableInfo.name}`; }

    const sanPhamHienThi = useMemo(() => {
        if (!tuKhoaTimKiemSP) { return danhSachSPTheoDanhMuc; }
        const lowerCaseQuery = tuKhoaTimKiemSP.toLowerCase();
        const sanPhamDaLoc = danhSachSPTheoDanhMuc.flatMap(dm => dm.danhSachSanPham).filter(sp => sp.tenSP.toLowerCase().includes(lowerCaseQuery));
        return [{ maDanhMuc: 0, tenDanhMuc: `Kết quả cho "${tuKhoaTimKiemSP}"`, danhSachSanPham: sanPhamDaLoc }];
    }, [tuKhoaTimKiemSP, danhSachSPTheoDanhMuc]);
    // #endregion

    return (
        <div className="ban-hang-container">
            <div className="cot cot-ban">
                <h2 className="cot-tieu-de">Quản lý Bàn</h2>
                {tablesToMerge.size > 1 && (<div style={{ padding: '0 10px 10px' }}><button className="action-btn confirm-btn" style={{ width: '100%' }} onClick={handleGopBan} disabled={isProcessing}>Gộp {tablesToMerge.size} bàn đã chọn</button></div>)}
                {mergedTableInfo && (<div className="khu-vuc-ban"><h3>Bàn đã gộp</h3><div className="danh-sach-ban"><div className={`ban-item dang-su-dung merged ${isViewingMergedTable ? 'selected' : ''}`} onClick={handleChonBanGop}>Bàn {mergedTableInfo.name}</div></div></div>)}
                <div className="khu-vuc-ban"><h3>Mang Về</h3><div className="danh-sach-ban"><div className={`ban-item trong ${isTakeAway ? "selected" : ""}`} onClick={handleChonMangVe}>Tạo Đơn Mang Về</div></div></div>
                {danhSachBanTheoLoai.map(loaiBan => (
                    <div key={loaiBan.maLoaiBan} className="khu-vuc-ban">
                        <h3>{loaiBan.tenLoaiBan}</h3>
                        <div className="danh-sach-ban">
                            {loaiBan.danhSachBan.filter(ban => !allMergedTableIds.has(ban.ma)).map((ban) => {
                                const isVipAndTrong = ban.loaiBan === 'PhongVIP' && ban.trangThai === 'Trong';
                                const isDangSuDung = ban.trangThai === 'DangSuDung';
                                return (
                                    <div key={ban.ma} className="ban-item-wrapper">
                                        {isDangSuDung && (<input type="checkbox" className="merge-checkbox" checked={tablesToMerge.has(ban.ma)} onChange={() => { setTablesToMerge(prev => { const newSet = new Set(prev); if (newSet.has(ban.ma)) { newSet.delete(ban.ma); } else { newSet.add(ban.ma); } return newSet; }); }} onClick={(e) => e.stopPropagation()} title="Chọn để gộp đơn" disabled={isTakeAway || !!mergedTableInfo} />)}
                                        <div className={`ban-item ${ban.trangThai.toLowerCase().replace(' ', '-')} ${ban.loaiBan.toLowerCase()} ${banDangChon?.ma === ban.ma ? "selected" : ""} ${isVipAndTrong ? "disabled-vip" : ""} ${(isTakeAway || !!mergedTableInfo) ? "disabled-context" : ""}`}
                                            onClick={() => { if (!isVipAndTrong) { handleChonBan(ban); } }}>
                                            {ban.tenBan}
                                            {isVipAndTrong && <div className="ban-status-overlay">Chỉ từ đặt bàn</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="cot cot-san-pham">
                <h2 className="cot-tieu-de">Menu Sản phẩm</h2>
                <div className="menu-search-bar"><input type="text" placeholder="Tìm kiếm sản phẩm..." value={tuKhoaTimKiemSP} onChange={(e) => setTuKhoaTimKiemSP(e.target.value)} /></div>
                <div className="menu-content">
                    {sanPhamHienThi.length === 0 && tuKhoaTimKiemSP && (<p className="no-results-message">Không tìm thấy sản phẩm nào.</p>)}
                    {sanPhamHienThi.map((dm) => (
                        <div key={dm.maDanhMuc} className="danh-muc-sp">
                            <h3>{dm.tenDanhMuc}</h3>
                            <div className="danh-sach-san-pham">
                                {dm.danhSachSanPham.map((sp) => (
                                    <div key={sp.ma} className={`san-pham-item ${!sp.isAvailable ? 'out-of-stock' : ''}`} onClick={() => { if (sp.isAvailable) { handleThemMon(sp); } }}>
                                        <div className="ten-sp">{sp.tenSP}</div>
                                        <div className="gia">{sp.gia.toLocaleString("vi-VN")} đ</div>
                                        {!sp.isAvailable && <div className="stock-status">Hết hàng</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="cot cot-don-hang">
                <h2 className="cot-tieu-de">{orderTitle}{donHangHienTai && ` (#${donHangHienTai.ma})`}</h2>
                {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
                {(banDangChon || isTakeAway || mergedTableInfo) && (
                    <div className="khach-hang-section">
                        <h4>Thông tin Khách hàng</h4>
                        {khachHangDonHang ? (
                            <div className="thong-tin-khach-hang-hien-thi">
                                <span>{khachHangDonHang.hoTen}</span>
                                <button type="button" className="action-btn cancel-btn" onClick={handleBoChonKhachHang} disabled={isProcessing}>Bỏ chọn</button>
                                <p>SĐT: {khachHangDonHang.soDienThoai || 'N/A'}</p>
                            </div>
                        ) : (
                            <div className="khach-hang-search-area">
                                {dangTimKiemKH ? (
                                    <div className="khach-hang-search-input-group">
                                        <input type="text" placeholder="Tìm SĐT/Tên khách hàng..." value={tuKhoaTimKiemKH} onChange={(e) => setTuKhoaTimKiemKH(e.target.value)} autoFocus className="search-input" />
                                        <button className="action-btn cancel-btn search-cancel-btn" onClick={() => setDangTimKiemKH(false)} disabled={isProcessing}>Hủy</button>
                                        {ketQuaTimKiemKH.length > 0 && (<ul className="ket-qua-tim-kiem">{ketQuaTimKiemKH.map(kh => (<li key={kh.ma} className="ket-qua-item" onClick={() => handleChonKhachHang(kh)}>{kh.hoTen} - {kh.soDienThoai}</li>))}</ul>)}
                                    </div>
                                ) : (
                                    <button className="action-btn add-btn" style={{ width: '100%' }} onClick={() => setDangTimKiemKH(true)} disabled={isProcessing}>Tìm/Thêm Khách Hàng (Tích điểm)</button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className="gio-hang-list">
                    {gioHang.length === 0 && itemsChoThem.length === 0 && <p style={{ textAlign: "center", color: "#888" }}>Chưa có sản phẩm</p>}
                    {gioHang.map((item) => (
                        <div key={item.maSanPham} className="gio-hang-item">
                            <span className="gio-hang-item-ten">{item.tenSP}</span>
                            <div className="gio-hang-item-soluong">
                                <button className="soluong-btn" onClick={() => handleCapNhatSoLuong(item.maSanPham, item.soLuong - 1)} disabled={isProcessing}>-</button>
                                <span>{item.soLuong}</span>
                                <button className="soluong-btn" onClick={() => handleCapNhatSoLuong(item.maSanPham, item.soLuong + 1)} disabled={isProcessing}>+</button>
                            </div>
                            <span className="gio-hang-item-gia">{item.thanhTien.toLocaleString("vi-VN")}</span>
                            <button className="xoa-btn" onClick={() => handleXoaMonKhoiGioHang(item.maSanPham)} disabled={isProcessing}>×</button>
                        </div>
                    ))}
                </div>
                <div className="gio-hang-footer">
                    {itemsChoThem.length > 0 && (<div className="items-cho-them"><h3>Chờ xác nhận thêm:</h3><ul>{itemsChoThem.map(item => (<li key={item.sanPham.ma}>{item.sanPham.tenSP} x {item.soLuong}</li>))}</ul><button className="action-btn confirm-btn" onClick={handleXacNhanThemMon} disabled={isProcessing}>Xác nhận thêm món</button></div>)}
                    <div className="tong-tien">
                        <span>Tạm tính</span>
                        <span>{gioHang.reduce((sum, item) => sum + item.thanhTien, 0).toLocaleString("vi-VN")} đ</span>
                    </div>
                    {confirmation && (<div className="confirmation-dialog"><p>{confirmation.message}</p><div className="actions"><button className="action-btn save-btn" onClick={confirmation.onConfirm}>Đồng ý</button><button className="action-btn" onClick={() => setConfirmation(null)}>Hủy bỏ</button></div></div>)}
                    <div className="order-actions">
                        {(gioHang.length > 0 || itemsChoThem.length > 0 || donHangHienTai || mergedTableInfo) && !confirmation && (<button className="action-btn cancel-btn" onClick={() => handleHuyDon(true)} disabled={isProcessing}>Hủy / Bỏ chọn</button>)}
                        {!donHangHienTai && gioHang.length > 0 && !confirmation && !mergedTableInfo && (<button className="action-btn confirm-btn" onClick={handleTaoDonHang} disabled={isProcessing}>Tạo Đơn & Gửi Bếp</button>)}
                    </div>
                    <button className="thanh-toan-btn" onClick={() => setIsPaymentModalOpen(true)} disabled={isProcessing || (gioHang.length === 0) || itemsChoThem.length > 0 || !!confirmation}>Thanh Toán</button>
                </div>
            </div>

            <BillModal isOpen={isBillModalOpen} onClose={handleCloseBillModal} billData={billData} />
            {isPaymentModalOpen && <ModalThanhToan isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} gioHang={gioHang} danhSachKhuyenMai={danhSachKhuyenMai} danhSachPTTT={danhSachPTTT} onConfirm={handleThanhToan} loaiBan={banDangChon?.loaiBan} khachHang={khachHangDonHang} />}
            <QrPaymentModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} onConfirm={handleConfirmQrPayment} qrImageUrl={qrCodeUrl} billData={currentOrderForQr} loading={loadingQr} />
        </div>
    );
}

export default TrangBanHang;