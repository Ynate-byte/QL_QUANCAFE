import type { BillDto } from '../interfaces/Bill';
import '../styles/components/BillModal.css';

// #region Khai báo kiểu dữ liệu toàn cục cho thư viện bên ngoài (Global Type Declarations)
/**
 * @summary Tùy chọn cho JsPDF.
 */
interface JsPDFOptions {
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | number[];
}

/**
 * @summary Interface cho đối tượng JsPDF.
 */
interface JsPDF {
    addImage: (imageData: string | HTMLCanvasElement, format: string, x: number, y: number, width: number, height: number) => this;
    save: (filename: string) => void;
}

/**
 * @summary Tùy chọn cho Html2Canvas.
 */
interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
}

// Khai báo global để TypeScript nhận diện các thư viện được tải qua script tag
declare global {
    interface Window {
        html2canvas: (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>;
        jspdf: {
            jsPDF: new (options?: JsPDFOptions) => JsPDF;
        };
    }
}
// #endregion

// #region Props Interface
/**
 * @summary Props cho component BillModal.
 */
interface Props {
    isOpen: boolean;
    onClose: () => void;
    billData: BillDto | null;
}
// #endregion

/**
 * @summary Component Modal hiển thị chi tiết hóa đơn và cho phép xuất ra PDF.
 * @param {Props} { isOpen, onClose, billData } Props của component.
 * @returns {JSX.Element | null} Component React hoặc null nếu modal không mở/không có dữ liệu.
 */
function BillModal({ isOpen, onClose, billData }: Props) {
    if (!isOpen || !billData) return null;

    // #region Xử lý Download PDF
    /**
     * @summary Xử lý việc tải hóa đơn dưới dạng file PDF.
     * Sử dụng html2canvas để render nội dung hóa đơn thành hình ảnh và jspdf để tạo file PDF.
     */
    const handleDownloadPdf = () => {
        const billElement = document.getElementById('bill-to-print');
        if (!billElement) {
            console.error("Không tìm thấy phần tử hóa đơn để xuất PDF.");
            return;
        }

        const { jsPDF } = window.jspdf;

        window.html2canvas(billElement, { 
            scale: 3, // Tăng scale để hình ảnh nét hơn
            useCORS: true 
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            
            const pdfWidth = 80; // Khổ giấy 80mm
            // Tính toán chiều cao PDF dựa trên tỷ lệ khung hình của hình ảnh canvas
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight] // Đặt định dạng tùy chỉnh theo chiều rộng và chiều cao tính toán
            });

            // Thêm hình ảnh của hóa đơn vào PDF
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Tạo tên file PDF với mã đơn hàng đệm số 0
            const fileName = `HoaDon-${String(billData.maDonHang).padStart(6, '0')}.pdf`;
            pdf.save(fileName); // Lưu file PDF
        });
    };
    // #endregion

    // #region Render Component
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content bill-modal" onClick={(e) => e.stopPropagation()}>
                {/* Phần nội dung hóa đơn để in hoặc xuất PDF */}
                <div id="bill-to-print">
                    <div className="bill-header">
                        <h2>{billData.tenCuaHang}</h2>
                        <p>{billData.diaChiCuaHang}</p>
                        <p>ĐT: {billData.soDienThoaiCuaHang}</p>
                        <hr />
                        <h3>HÓA ĐƠN THANH TOÁN</h3>
                    </div>
                    <div className="bill-info">
                        <p><span>Số HD:</span> {String(billData.maDonHang).padStart(6, '0')}</p>
                        <p><span>Ngày:</span> {new Date(billData.thoiGianThanhToan).toLocaleString('vi-VN')}</p>
                        <p><span>Thu ngân:</span> {billData.tenNhanVien}</p>
                        {billData.tenBan && <p><span>Bàn:</span> {billData.tenBan}</p>}
                        {billData.tenKhachHang && <p><span>Khách hàng:</span> {billData.tenKhachHang}</p>}
                    </div>
                    <hr />
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billData.chiTiet.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.tenSP}</td>
                                    <td className="center">{item.soLuong}</td>
                                    <td className="right">{item.donGia.toLocaleString('vi-VN')}</td>
                                    <td className="right">{item.thanhTien.toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr />
                    <div className="bill-summary">
                        <p><span>Tổng tiền hàng:</span> <span className="right">{billData.tongTienHang.toLocaleString('vi-VN')} đ</span></p>
                        {billData.phuPhi > 0 && <p className="sub-line"><span>Phụ phí:</span> <span className="right">+ {billData.phuPhi.toLocaleString('vi-VN')} đ</span></p>}
                        {billData.giamGia > 0 && <p className="sub-line"><span>Giảm giá ({billData.tenKhuyenMai || ''}):</span> <span className="right">- {billData.giamGia.toLocaleString('vi-VN')} đ</span></p>}
                        <hr className="summary-hr"/>
                        <p className="total"><span>TỔNG CỘNG:</span> <span className="right">{billData.tongCong.toLocaleString('vi-VN')} đ</span></p>
                    </div>
                    <hr />
                    <div className="bill-footer">
                        <p>{billData.loiCamOn}</p>
                    </div>
                </div>
                {/* Phần footer modal với các nút hành động */}
                <div className="modal-footer no-print">
                    <button onClick={onClose} className="action-btn cancel-btn">Đóng</button>
                    <button onClick={handleDownloadPdf} className="action-btn save-btn">Tải Hóa Đơn (PDF)</button>
                </div>
            </div>
        </div>
    );
    // #endregion
}

export default BillModal;