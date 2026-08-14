// Dữ liệu mẫu NGHIỆP VỤ của hệ thi OnTest (Phase 7 slice 2).
//
// Khác `exam-sample.ts` (chỉ RBAC + người dùng — luôn seed khi SEED_DB=true), file này
// chứa dữ liệu để CHẠY THỬ đầy đủ luồng: năm học/học kỳ → môn học/chương → phân công →
// nhóm học phần + thành viên → ngân hàng câu hỏi (mcq/essay/reading) → đề thi (thủ công,
// tự động, đề đã kết thúc kèm kết quả để xem thống kê/chấm tự luận).
//
// Ở đây CHỈ có dữ liệu thuần (không đụng DB). Logic ghi nằm ở `exam-demo.seeder.ts`,
// nơi các khoá tự tăng (manamhoc/mahocky/machuong/macauhoi/manhom/made) được tra ngược
// qua các `key` khai báo bên dưới.

// ─────────────────────────────────────────────────────────────────────────────
// Kiểu dữ liệu
// ─────────────────────────────────────────────────────────────────────────────

/** Năm học + số học kỳ tự sinh (giống addNamHoc của AcademicYearsService). */
export interface IDemoNamHoc {
  tennamhoc: string;
  sohocky: number;
}

/** Môn học kèm danh sách tên chương (thứ tự khai báo = thứ tự tạo). */
export interface IDemoMonHoc {
  mamonhoc: string;
  tenmonhoc: string;
  sotinchi: number;
  sotietlythuyet: number;
  sotietthuchanh: number;
  chuong: string[];
}

/** Phân công giảng dạy — năm/kỳ trỏ theo NHÃN, seeder tra ra manamhoc/mahocky. */
export interface IDemoPhanCong {
  manguoidung: string;
  mamonhoc: string;
  tennamhoc: string;
  /** Thứ tự học kỳ trong năm (1..n) — khớp cột `hocky.sohocky`. */
  sohocky: number;
}

/** Nhóm học phần + danh sách sinh viên (ghi vào `chitietnhom`, `siso` tự tính). */
export interface IDemoNhom {
  key: string;
  tennhom: string;
  mamonhoc: string;
  giangvien: string;
  tennamhoc: string;
  sohocky: number;
  /** Mã mời cố định để tiện thử luồng "SV nhập mã tham gia nhóm". */
  mamoi: string;
  ghichu: string;
  sinhvien: string[];
}

/** Một đáp án của câu trắc nghiệm. ladapan = 1 nghĩa là đáp án đúng. */
export interface IDemoDapAn {
  noidungtl: string;
  ladapan: 0 | 1;
}

/** Câu hỏi trắc nghiệm hoặc tự luận. `chuong` là TÊN chương trong cùng môn. */
export interface IDemoCauHoi {
  key: string;
  mamonhoc: string;
  chuong: string;
  loai: 'mcq' | 'essay';
  /** 1 = dễ, 2 = trung bình, 3 = khó. */
  dokho: 1 | 2 | 3;
  noidung: string;
  nguoitao: string;
  /** Bắt buộc với mcq (4 đáp án, đúng 1 cái ladapan = 1); essay bỏ trống. */
  dapan?: IDemoDapAn[];
}

/** Đoạn văn đọc hiểu + các câu hỏi con (mỗi câu con là 1 bản ghi cauhoi loai='reading'). */
export interface IDemoDoanVan {
  key: string;
  mamonhoc: string;
  chuong: string;
  tieude: string;
  noidung: string;
  nguoitao: string;
  dokho: 1 | 2 | 3;
  cauhoi: { key: string; noidung: string; dapan: IDemoDapAn[] }[];
}

/** Số câu theo mức độ cho đề tự động (khớp cột mcq_de/mcq_tb/... của `dethi`). */
export interface IDemoSoCau {
  de: number;
  tb: number;
  kho: number;
}

/** Bài làm mẫu của 1 sinh viên trên đề đã kết thúc. */
export interface IDemoKetQua {
  manguoidung: string;
  /** Số câu trắc nghiệm/đọc hiểu làm đúng (tính từ câu đầu tiên của đề). */
  socaudung: number;
  /** Số phút đã dùng để làm bài. */
  thoigianlambai: number;
  solanchuyentab: number;
  /** Nội dung bài tự luận (nếu đề có câu tự luận). */
  baituluan?: string;
}

/** Đề thi mẫu. Mốc thời gian khai báo dạng "lệch bao nhiêu giờ so với lúc seed". */
export interface IDemoDeThi {
  key: string;
  tende: string;
  mamonhoc: string;
  nguoitao: string;
  /** 0 = thủ công (chọn câu tay), 1 = tự động (random theo độ khó). */
  loaide: 0 | 1;
  /** Thời gian làm bài (phút). */
  thoigianthi: number;
  batdauOffsetHours: number;
  ketthucOffsetHours: number;
  hienthibailam: 0 | 1;
  xemdiemthi: 0 | 1;
  xemdapan: 0 | 1;
  troncauhoi: 0 | 1;
  trondapan: 0 | 1;
  nopbaichuyentab: 0 | 1;
  diem_tracnghiem: number;
  diem_tuluan: number;
  diem_dochieu: number;
  /** Nhóm được giao đề (theo `key` của IDemoNhom). */
  nhom: string[];
  /** Tên chương phủ bởi đề — ghi vào `dethitudong` (đề tự động dùng để random). */
  chuong: string[];
  /** Đề THỦ CÔNG: danh sách `key` câu hỏi theo đúng thứ tự. */
  cauhoi?: string[];
  /** Đề TỰ ĐỘNG: số câu cần random theo loại/mức độ. */
  socau?: Partial<Record<'mcq' | 'essay' | 'reading', IDemoSoCau>>;
  /** Bài làm mẫu (chỉ dùng cho đề đã kết thúc). */
  ketqua?: IDemoKetQua[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu
// ─────────────────────────────────────────────────────────────────────────────

export const demoNamHoc: IDemoNamHoc[] = [
  { tennamhoc: '2024-2025', sohocky: 3 },
  { tennamhoc: '2025-2026', sohocky: 3 },
];

export const demoMonHoc: IDemoMonHoc[] = [
  {
    mamonhoc: 'LTW001',
    tenmonhoc: 'Lập trình Web',
    sotinchi: 3,
    sotietlythuyet: 30,
    sotietthuchanh: 30,
    chuong: [
      'Tổng quan Web và HTML',
      'CSS và giao diện',
      'JavaScript cơ bản',
      'Lập trình phía máy chủ',
    ],
  },
  {
    mamonhoc: 'CSDL01',
    tenmonhoc: 'Cơ sở dữ liệu',
    sotinchi: 3,
    sotietlythuyet: 45,
    sotietthuchanh: 15,
    chuong: [
      'Mô hình quan hệ',
      'Ngôn ngữ SQL',
      'Chuẩn hoá dữ liệu',
      'Giao dịch và toàn vẹn',
    ],
  },
  {
    mamonhoc: 'MMT001',
    tenmonhoc: 'Mạng máy tính',
    sotinchi: 3,
    sotietlythuyet: 45,
    sotietthuchanh: 0,
    chuong: [
      'Mô hình OSI và TCP/IP',
      'Tầng mạng và địa chỉ IP',
      'Tầng giao vận',
    ],
  },
  {
    mamonhoc: 'CTDL01',
    tenmonhoc: 'Cấu trúc dữ liệu và giải thuật',
    sotinchi: 4,
    sotietlythuyet: 45,
    sotietthuchanh: 30,
    chuong: ['Danh sách và ngăn xếp', 'Cây và bảng băm', 'Sắp xếp và tìm kiếm'],
  },
];

/**
 * Phân công quyết định GV thấy môn nào ở trang câu hỏi/tạo đề (mọi listing đều
 * JOIN `phancong` theo người đăng nhập) → admin được phân công cả 4 môn để test nhanh.
 */
export const demoPhanCong: IDemoPhanCong[] = [
  {
    manguoidung: 'gv001',
    mamonhoc: 'LTW001',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'gv001',
    mamonhoc: 'CSDL01',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'gv001',
    mamonhoc: 'LTW001',
    tennamhoc: '2024-2025',
    sohocky: 2,
  },
  {
    manguoidung: 'gv002',
    mamonhoc: 'MMT001',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'gv002',
    mamonhoc: 'CTDL01',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'admin',
    mamonhoc: 'LTW001',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'admin',
    mamonhoc: 'CSDL01',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'admin',
    mamonhoc: 'MMT001',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
  {
    manguoidung: 'admin',
    mamonhoc: 'CTDL01',
    tennamhoc: '2025-2026',
    sohocky: 1,
  },
];

export const demoNhom: IDemoNhom[] = [
  {
    key: 'LTW-N01',
    tennhom: 'Lập trình Web - Nhóm 01',
    mamonhoc: 'LTW001',
    giangvien: 'gv001',
    tennamhoc: '2025-2026',
    sohocky: 1,
    mamoi: 'ltw0001',
    ghichu: 'Lớp thực hành sáng thứ 2',
    sinhvien: ['sv001', 'sv002', 'sv003', 'sv004', 'sv005', 'sv006'],
  },
  {
    key: 'CSDL-N01',
    tennhom: 'Cơ sở dữ liệu - Nhóm 01',
    mamonhoc: 'CSDL01',
    giangvien: 'gv001',
    tennamhoc: '2025-2026',
    sohocky: 1,
    mamoi: 'csdl001',
    ghichu: 'Lớp lý thuyết chiều thứ 4',
    sinhvien: ['sv004', 'sv005', 'sv006', 'sv007', 'sv008', 'sv009', 'sv010'],
  },
  {
    key: 'MMT-N01',
    tennhom: 'Mạng máy tính - Nhóm 01',
    mamonhoc: 'MMT001',
    giangvien: 'gv002',
    tennamhoc: '2025-2026',
    sohocky: 1,
    mamoi: 'mmt0001',
    ghichu: 'Lớp ghép 2 khoa',
    sinhvien: ['sv001', 'sv002', 'sv003', 'sv007', 'sv008'],
  },
];

/** Rút gọn khai báo 4 đáp án: chỉ số đáp án đúng tính từ 0. */
const abcd = (
  a: string,
  b: string,
  c: string,
  d: string,
  dung: 0 | 1 | 2 | 3,
): IDemoDapAn[] =>
  [a, b, c, d].map((noidungtl, i) => ({
    noidungtl,
    ladapan: i === dung ? 1 : 0,
  }));

export const demoCauHoi: IDemoCauHoi[] = [
  // ── LTW001 — Lập trình Web ────────────────────────────────────────────────
  {
    key: 'ltw-mcq-01',
    mamonhoc: 'LTW001',
    chuong: 'Tổng quan Web và HTML',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'HTML là viết tắt của cụm từ nào?',
    dapan: abcd(
      'HyperText Markup Language',
      'HighText Machine Language',
      'HyperTool Multi Language',
      'Home Tool Markup Language',
      0,
    ),
  },
  {
    key: 'ltw-mcq-02',
    mamonhoc: 'LTW001',
    chuong: 'Tổng quan Web và HTML',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'Thẻ HTML nào dùng để tạo liên kết đến một trang khác?',
    dapan: abcd('&lt;link&gt;', '&lt;a&gt;', '&lt;href&gt;', '&lt;nav&gt;', 1),
  },
  {
    key: 'ltw-mcq-03',
    mamonhoc: 'LTW001',
    chuong: 'Tổng quan Web và HTML',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'Thẻ nào dùng để chèn hình ảnh vào trang web?',
    dapan: abcd(
      '&lt;image&gt;',
      '&lt;picture&gt;',
      '&lt;img&gt;',
      '&lt;figure&gt;',
      2,
    ),
  },
  {
    key: 'ltw-mcq-04',
    mamonhoc: 'LTW001',
    chuong: 'CSS và giao diện',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'Thuộc tính CSS nào dùng để đổi màu chữ?',
    dapan: abcd('font-color', 'text-color', 'color', 'foreground', 2),
  },
  {
    key: 'ltw-mcq-05',
    mamonhoc: 'LTW001',
    chuong: 'CSS và giao diện',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Bộ chọn (selector) nào trong CSS chọn phần tử theo thuộc tính id?',
    dapan: abcd('.ten', '#ten', '*ten', 'ten', 1),
  },
  {
    key: 'ltw-mcq-06',
    mamonhoc: 'LTW001',
    chuong: 'CSS và giao diện',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Trong Flexbox, thuộc tính nào canh các phần tử con theo trục chính (main axis)?',
    dapan: abcd(
      'align-items',
      'justify-content',
      'align-content',
      'flex-wrap',
      1,
    ),
  },
  {
    key: 'ltw-mcq-07',
    mamonhoc: 'LTW001',
    chuong: 'CSS và giao diện',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv001',
    noidung:
      'Thuộc tính z-index chỉ có tác dụng khi phần tử có position là gì?',
    dapan: abcd(
      'static',
      'relative, absolute, fixed hoặc sticky',
      'Mọi giá trị position',
      'Chỉ khi position là fixed',
      1,
    ),
  },
  {
    key: 'ltw-mcq-08',
    mamonhoc: 'LTW001',
    chuong: 'JavaScript cơ bản',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung:
      'Từ khoá nào khai báo biến có phạm vi khối (block scope) trong JavaScript?',
    dapan: abcd('var', 'let', 'function', 'global', 1),
  },
  {
    key: 'ltw-mcq-09',
    mamonhoc: 'LTW001',
    chuong: 'JavaScript cơ bản',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung: 'Biểu thức typeof null trong JavaScript trả về giá trị nào?',
    dapan: abcd('"null"', '"undefined"', '"object"', '"number"', 2),
  },
  {
    key: 'ltw-mcq-10',
    mamonhoc: 'LTW001',
    chuong: 'JavaScript cơ bản',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv001',
    noidung: 'Phương thức nào đăng ký một trình xử lý sự kiện cho phần tử DOM?',
    dapan: abcd('attachEvent', 'addEventListener', 'onEvent', 'bindEvent', 1),
  },
  {
    key: 'ltw-mcq-11',
    mamonhoc: 'LTW001',
    chuong: 'Lập trình phía máy chủ',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung: 'Mã trạng thái HTTP 404 có ý nghĩa gì?',
    dapan: abcd(
      'Máy chủ gặp lỗi nội bộ',
      'Không tìm thấy tài nguyên',
      'Truy cập bị từ chối',
      'Yêu cầu được chuyển hướng',
      1,
    ),
  },
  {
    key: 'ltw-mcq-12',
    mamonhoc: 'LTW001',
    chuong: 'Lập trình phía máy chủ',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv001',
    noidung: 'Phương thức HTTP nào sau đây KHÔNG phải là idempotent?',
    dapan: abcd('GET', 'PUT', 'POST', 'DELETE', 2),
  },
  {
    key: 'ltw-essay-01',
    mamonhoc: 'LTW001',
    chuong: 'Lập trình phía máy chủ',
    loai: 'essay',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Trình bày sự khác nhau giữa hai phương thức GET và POST. Nêu ví dụ tình huống nên dùng mỗi phương thức.',
  },
  {
    key: 'ltw-essay-02',
    mamonhoc: 'LTW001',
    chuong: 'JavaScript cơ bản',
    loai: 'essay',
    dokho: 3,
    nguoitao: 'gv001',
    noidung:
      'Giải thích khái niệm bất đồng bộ (asynchronous) trong JavaScript và vai trò của Promise trong việc xử lý bất đồng bộ.',
  },

  // ── CSDL01 — Cơ sở dữ liệu ────────────────────────────────────────────────
  {
    key: 'csdl-mcq-01',
    mamonhoc: 'CSDL01',
    chuong: 'Mô hình quan hệ',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung:
      'Khoá chính (primary key) của một quan hệ có tính chất nào sau đây?',
    dapan: abcd(
      'Có thể nhận giá trị NULL',
      'Xác định duy nhất mỗi bộ và không NULL',
      'Luôn gồm đúng một thuộc tính',
      'Có thể trùng lặp nếu bảng nhỏ',
      1,
    ),
  },
  {
    key: 'csdl-mcq-02',
    mamonhoc: 'CSDL01',
    chuong: 'Mô hình quan hệ',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'Khoá ngoại (foreign key) dùng để làm gì?',
    dapan: abcd(
      'Tăng tốc độ truy vấn',
      'Mã hoá dữ liệu nhạy cảm',
      'Liên kết và ràng buộc toàn vẹn giữa hai quan hệ',
      'Đánh số thứ tự các bộ',
      2,
    ),
  },
  {
    key: 'csdl-mcq-03',
    mamonhoc: 'CSDL01',
    chuong: 'Ngôn ngữ SQL',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv001',
    noidung: 'Câu lệnh SQL nào dùng để lấy dữ liệu từ bảng?',
    dapan: abcd('SELECT', 'GET', 'FETCH', 'OPEN', 0),
  },
  {
    key: 'csdl-mcq-04',
    mamonhoc: 'CSDL01',
    chuong: 'Ngôn ngữ SQL',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Mệnh đề nào dùng để lọc dữ liệu SAU khi đã gom nhóm bằng GROUP BY?',
    dapan: abcd('WHERE', 'HAVING', 'FILTER', 'ORDER BY', 1),
  },
  {
    key: 'csdl-mcq-05',
    mamonhoc: 'CSDL01',
    chuong: 'Ngôn ngữ SQL',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Phép nối nào giữ lại tất cả các dòng của bảng bên trái kể cả khi không khớp?',
    dapan: abcd('INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN', 1),
  },
  {
    key: 'csdl-mcq-06',
    mamonhoc: 'CSDL01',
    chuong: 'Chuẩn hoá dữ liệu',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv001',
    noidung: 'Một quan hệ ở dạng chuẩn 2 (2NF) khi và chỉ khi nào?',
    dapan: abcd(
      'Ở 1NF và mọi thuộc tính không khoá phụ thuộc đầy đủ vào khoá chính',
      'Ở 1NF và không có phụ thuộc bắc cầu',
      'Mọi thuộc tính đều là khoá',
      'Không còn thuộc tính đa trị',
      0,
    ),
  },
  {
    key: 'csdl-mcq-07',
    mamonhoc: 'CSDL01',
    chuong: 'Chuẩn hoá dữ liệu',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv001',
    noidung: 'Dạng chuẩn 3 (3NF) loại bỏ loại phụ thuộc hàm nào?',
    dapan: abcd(
      'Phụ thuộc bộ phận',
      'Phụ thuộc bắc cầu',
      'Phụ thuộc đa trị',
      'Phụ thuộc nối',
      1,
    ),
  },
  {
    key: 'csdl-mcq-08',
    mamonhoc: 'CSDL01',
    chuong: 'Giao dịch và toàn vẹn',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv001',
    noidung: 'Bốn tính chất ACID của giao dịch gồm những gì?',
    dapan: abcd(
      'Atomicity, Consistency, Isolation, Durability',
      'Accuracy, Concurrency, Integrity, Durability',
      'Atomicity, Concurrency, Indexing, Distribution',
      'Availability, Consistency, Isolation, Denormalization',
      0,
    ),
  },
  {
    key: 'csdl-essay-01',
    mamonhoc: 'CSDL01',
    chuong: 'Giao dịch và toàn vẹn',
    loai: 'essay',
    dokho: 2,
    nguoitao: 'gv001',
    noidung:
      'Nêu ý nghĩa của tính nguyên tố (Atomicity) và tính bền vững (Durability) trong giao dịch. Cho ví dụ minh hoạ bằng nghiệp vụ chuyển khoản ngân hàng.',
  },

  // ── MMT001 — Mạng máy tính ────────────────────────────────────────────────
  {
    key: 'mmt-mcq-01',
    mamonhoc: 'MMT001',
    chuong: 'Mô hình OSI và TCP/IP',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv002',
    noidung: 'Mô hình OSI gồm bao nhiêu tầng?',
    dapan: abcd('4', '5', '7', '8', 2),
  },
  {
    key: 'mmt-mcq-02',
    mamonhoc: 'MMT001',
    chuong: 'Mô hình OSI và TCP/IP',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv002',
    noidung: 'Giao thức HTTP hoạt động ở tầng nào của mô hình OSI?',
    dapan: abcd('Tầng mạng', 'Tầng giao vận', 'Tầng phiên', 'Tầng ứng dụng', 3),
  },
  {
    key: 'mmt-mcq-03',
    mamonhoc: 'MMT001',
    chuong: 'Tầng mạng và địa chỉ IP',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv002',
    noidung: 'Địa chỉ IPv4 có độ dài bao nhiêu bit?',
    dapan: abcd('16', '32', '64', '128', 1),
  },
  {
    key: 'mmt-mcq-04',
    mamonhoc: 'MMT001',
    chuong: 'Tầng mạng và địa chỉ IP',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv002',
    noidung: 'Mạng 192.168.1.0/26 có bao nhiêu địa chỉ host sử dụng được?',
    dapan: abcd('30', '62', '64', '126', 1),
  },
  {
    key: 'mmt-mcq-05',
    mamonhoc: 'MMT001',
    chuong: 'Tầng giao vận',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv002',
    noidung: 'Điểm khác biệt cơ bản giữa TCP và UDP là gì?',
    dapan: abcd(
      'TCP nhanh hơn UDP trong mọi trường hợp',
      'TCP hướng kết nối và tin cậy, UDP không kết nối và không bảo đảm',
      'UDP có kiểm soát tắc nghẽn còn TCP thì không',
      'TCP chỉ dùng cho mạng LAN',
      1,
    ),
  },
  {
    key: 'mmt-mcq-06',
    mamonhoc: 'MMT001',
    chuong: 'Tầng giao vận',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv002',
    noidung: 'Cổng (port) mặc định của dịch vụ HTTPS là bao nhiêu?',
    dapan: abcd('21', '80', '443', '8080', 2),
  },

  // ── CTDL01 — Cấu trúc dữ liệu và giải thuật ───────────────────────────────
  {
    key: 'ctdl-mcq-01',
    mamonhoc: 'CTDL01',
    chuong: 'Danh sách và ngăn xếp',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv002',
    noidung: 'Ngăn xếp (stack) hoạt động theo nguyên tắc nào?',
    dapan: abcd('FIFO', 'LIFO', 'Ưu tiên theo khoá', 'Ngẫu nhiên', 1),
  },
  {
    key: 'ctdl-mcq-02',
    mamonhoc: 'CTDL01',
    chuong: 'Danh sách và ngăn xếp',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv002',
    noidung:
      'Độ phức tạp của thao tác chèn vào đầu danh sách liên kết đơn là bao nhiêu?',
    dapan: abcd('O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 0),
  },
  {
    key: 'ctdl-mcq-03',
    mamonhoc: 'CTDL01',
    chuong: 'Cây và bảng băm',
    loai: 'mcq',
    dokho: 2,
    nguoitao: 'gv002',
    noidung:
      'Duyệt cây nhị phân tìm kiếm theo thứ tự giữa (in-order) cho kết quả nào?',
    dapan: abcd(
      'Dãy khoá tăng dần',
      'Dãy khoá giảm dần',
      'Dãy khoá theo mức',
      'Dãy khoá ngẫu nhiên',
      0,
    ),
  },
  {
    key: 'ctdl-mcq-04',
    mamonhoc: 'CTDL01',
    chuong: 'Cây và bảng băm',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv002',
    noidung:
      'Trong bảng băm dùng dò tuyến tính, hiện tượng nhiều khoá dồn thành cụm liên tiếp gọi là gì?',
    dapan: abcd(
      'Tràn bảng',
      'Gom cụm sơ cấp (primary clustering)',
      'Băm kép',
      'Va chạm hoàn hảo',
      1,
    ),
  },
  {
    key: 'ctdl-mcq-05',
    mamonhoc: 'CTDL01',
    chuong: 'Sắp xếp và tìm kiếm',
    loai: 'mcq',
    dokho: 1,
    nguoitao: 'gv002',
    noidung: 'Tìm kiếm nhị phân yêu cầu điều kiện nào với dãy đầu vào?',
    dapan: abcd(
      'Dãy đã được sắp xếp',
      'Dãy chỉ chứa số nguyên',
      'Dãy không có phần tử trùng',
      'Dãy có kích thước là luỹ thừa của 2',
      0,
    ),
  },
  {
    key: 'ctdl-mcq-06',
    mamonhoc: 'CTDL01',
    chuong: 'Sắp xếp và tìm kiếm',
    loai: 'mcq',
    dokho: 3,
    nguoitao: 'gv002',
    noidung: 'Độ phức tạp trung bình của thuật toán Quick Sort là bao nhiêu?',
    dapan: abcd('O(n)', 'O(n log n)', 'O(n²)', 'O(log n)', 1),
  },
];

export const demoDoanVan: IDemoDoanVan[] = [
  {
    key: 'ltw-dv-01',
    mamonhoc: 'LTW001',
    chuong: 'Lập trình phía máy chủ',
    tieude: 'Giao thức HTTP',
    nguoitao: 'gv001',
    dokho: 2,
    noidung:
      'HTTP (HyperText Transfer Protocol) là giao thức ở tầng ứng dụng, dùng để trao đổi dữ liệu giữa trình duyệt và máy chủ web. ' +
      'HTTP hoạt động theo mô hình yêu cầu - phản hồi: trình duyệt gửi một yêu cầu gồm phương thức, đường dẫn, các tiêu đề (header) và ' +
      'phần thân tuỳ chọn; máy chủ trả về một phản hồi gồm mã trạng thái, các tiêu đề và nội dung. Một đặc điểm quan trọng của HTTP là ' +
      'phi trạng thái (stateless): mỗi yêu cầu độc lập với yêu cầu trước đó, máy chủ không tự ghi nhớ ngữ cảnh của phiên làm việc. ' +
      'Để duy trì trạng thái đăng nhập, các ứng dụng web phải dùng thêm cơ chế như cookie, session hoặc token. ' +
      'HTTPS là phiên bản HTTP chạy trên kênh đã được mã hoá bằng TLS, giúp bảo vệ dữ liệu khỏi bị nghe lén và sửa đổi trên đường truyền.',
    cauhoi: [
      {
        key: 'ltw-dv-01-c1',
        noidung: 'Theo đoạn văn, HTTP hoạt động theo mô hình nào?',
        dapan: abcd(
          'Ngang hàng (peer-to-peer)',
          'Yêu cầu - phản hồi',
          'Xuất bản - đăng ký',
          'Quảng bá (broadcast)',
          1,
        ),
      },
      {
        key: 'ltw-dv-01-c2',
        noidung: 'Đặc điểm "phi trạng thái" của HTTP được hiểu là gì?',
        dapan: abcd(
          'Máy chủ không lưu ngữ cảnh giữa các yêu cầu',
          'Máy chủ không trả về mã trạng thái',
          'Trình duyệt không lưu được cookie',
          'Kết nối luôn bị ngắt sau 30 giây',
          0,
        ),
      },
      {
        key: 'ltw-dv-01-c3',
        noidung: 'Theo đoạn văn, HTTPS khác HTTP ở điểm nào?',
        dapan: abcd(
          'Dùng phương thức khác hoàn toàn',
          'Không cần máy chủ web',
          'Chạy trên kênh đã mã hoá bằng TLS',
          'Chỉ hoạt động trong mạng nội bộ',
          2,
        ),
      },
    ],
  },
];

export const demoDeThi: IDemoDeThi[] = [
  {
    key: 'ltw-cuoiky',
    tende: 'Thi cuối kỳ - Lập trình Web',
    mamonhoc: 'LTW001',
    nguoitao: 'gv001',
    loaide: 0,
    thoigianthi: 45,
    // Đang mở sẵn khi seed xong → vào ngay được bằng tài khoản sinh viên.
    batdauOffsetHours: -1,
    ketthucOffsetHours: 24 * 7,
    hienthibailam: 1,
    xemdiemthi: 1,
    xemdapan: 1,
    troncauhoi: 1,
    trondapan: 1,
    nopbaichuyentab: 0,
    diem_tracnghiem: 10,
    diem_tuluan: 0,
    diem_dochieu: 0,
    nhom: ['LTW-N01'],
    chuong: [
      'Tổng quan Web và HTML',
      'CSS và giao diện',
      'JavaScript cơ bản',
      'Lập trình phía máy chủ',
    ],
    cauhoi: [
      'ltw-mcq-01',
      'ltw-mcq-02',
      'ltw-mcq-03',
      'ltw-mcq-04',
      'ltw-mcq-05',
      'ltw-mcq-06',
      'ltw-mcq-08',
      'ltw-mcq-09',
      'ltw-mcq-11',
      'ltw-mcq-12',
    ],
  },
  {
    key: 'csdl-tudong',
    tende: 'Kiểm tra tự động - Cơ sở dữ liệu',
    mamonhoc: 'CSDL01',
    nguoitao: 'gv001',
    loaide: 1,
    thoigianthi: 30,
    batdauOffsetHours: -1,
    ketthucOffsetHours: 24 * 14,
    hienthibailam: 1,
    xemdiemthi: 1,
    xemdapan: 0,
    troncauhoi: 1,
    trondapan: 1,
    nopbaichuyentab: 1,
    diem_tracnghiem: 10,
    diem_tuluan: 0,
    diem_dochieu: 0,
    nhom: ['CSDL-N01'],
    chuong: [
      'Mô hình quan hệ',
      'Ngôn ngữ SQL',
      'Chuẩn hoá dữ liệu',
      'Giao dịch và toàn vẹn',
    ],
    socau: { mcq: { de: 2, tb: 2, kho: 1 } },
  },
  {
    key: 'ltw-giuaky',
    tende: 'Kiểm tra giữa kỳ - Lập trình Web',
    mamonhoc: 'LTW001',
    nguoitao: 'gv001',
    loaide: 0,
    thoigianthi: 30,
    // Đã kết thúc → dùng để xem trang kết quả, thống kê và chấm tự luận.
    batdauOffsetHours: -24 * 14,
    ketthucOffsetHours: -24 * 14 + 2,
    hienthibailam: 1,
    xemdiemthi: 1,
    xemdapan: 1,
    troncauhoi: 0,
    trondapan: 0,
    nopbaichuyentab: 0,
    diem_tracnghiem: 8,
    diem_tuluan: 2,
    diem_dochieu: 0,
    nhom: ['LTW-N01'],
    chuong: [
      'Tổng quan Web và HTML',
      'CSS và giao diện',
      'Lập trình phía máy chủ',
    ],
    cauhoi: [
      'ltw-mcq-01',
      'ltw-mcq-02',
      'ltw-mcq-03',
      'ltw-mcq-04',
      'ltw-essay-01',
    ],
    ketqua: [
      {
        manguoidung: 'sv001',
        socaudung: 4,
        thoigianlambai: 18,
        solanchuyentab: 0,
        baituluan:
          'GET dùng để lấy dữ liệu, tham số nằm trên URL, có thể được lưu bộ nhớ đệm và đánh dấu trang. ' +
          'POST dùng để gửi dữ liệu làm thay đổi trạng thái máy chủ, tham số nằm trong phần thân yêu cầu. ' +
          'Ví dụ: tìm kiếm sản phẩm dùng GET, đăng ký tài khoản dùng POST.',
      },
      {
        manguoidung: 'sv002',
        socaudung: 3,
        thoigianlambai: 25,
        solanchuyentab: 1,
        baituluan:
          'GET lấy dữ liệu còn POST gửi dữ liệu lên máy chủ. GET để lộ tham số trên thanh địa chỉ nên không nên dùng ' +
          'cho mật khẩu. POST an toàn hơn khi gửi biểu mẫu đăng nhập.',
      },
      {
        manguoidung: 'sv003',
        socaudung: 2,
        thoigianlambai: 30,
        solanchuyentab: 3,
        baituluan: 'GET là lấy dữ liệu, POST là gửi dữ liệu.',
      },
      {
        manguoidung: 'sv004',
        socaudung: 4,
        thoigianlambai: 12,
        solanchuyentab: 0,
        baituluan:
          'Hai phương thức khác nhau ở mục đích và cách truyền tham số. GET là idempotent, gọi nhiều lần cho cùng kết quả; ' +
          'POST không idempotent nên gọi lại có thể tạo trùng bản ghi. Dùng GET cho trang danh sách, POST cho biểu mẫu thêm mới.',
      },
    ],
  },
];
