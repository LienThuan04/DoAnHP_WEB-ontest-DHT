import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IAnswerRow,
  IQuestionDetail,
  IQuestionRow,
  IReadingAnswerRow,
} from '@/questions/interfaces/questions.types';

const PAGE_SIZE = 10;

/**
 * Nghiệp vụ Ngân hàng câu hỏi — thay CauHoiModel.php + CauTraLoiModel.php.
 *
 * Quy ước port lại:
 *  - Ảnh lưu blob (Bytes) → trả base64 data-URI; nhận diện MIME qua magic-bytes
 *    (PNG/GIF/JPEG), mặc định JPEG — giống finfo của PHP.
 *  - Xoá câu hỏi: xoá MỀM (trangthai = 0), giữ dữ liệu liên quan.
 *  - getQuestionBySubject: liệt kê theo môn/chương/độ khó; mỗi câu reading hiện
 *    nội dung ĐOẠN VĂN + số câu con (num_subquestions). machuong/dokho = 0 = bỏ lọc.
 *
 * GIỚI HẠN hiện tại (làm sau): tìm theo nội dung chỉ khớp `cauhoi.noidung`, CHƯA
 * khớp nội dung đoạn văn như bản PHP (`d.noidung LIKE`). add/edit + import
 * Excel/Word + ảnh chưa port (cần multipart) — xem [[conversion-progress]].
 */
@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Chuyển blob ảnh → data-URI base64 (null nếu rỗng). Thay finfo + base64_encode. */
  private toBase64(blob: Uint8Array | null | undefined): string | null {
    if (!blob || blob.length === 0) return null;
    const buf = Buffer.from(blob);
    let mime = 'image/jpeg';
    if (
      buf.length >= 8 &&
      buf.toString('hex', 0, 8) === '89504e470d0a1a0a'
    ) {
      mime = 'image/png';
    } else if (buf.length >= 4 && buf.toString('hex', 0, 4) === '47494638') {
      mime = 'image/gif';
    } else if (buf.length >= 2 && buf.toString('hex', 0, 2) === 'ffd8') {
      mime = 'image/jpeg';
    }
    return `data:${mime};base64,${buf.toString('base64')}`;
  }

  /** Điều kiện lọc danh sách câu hỏi theo môn/chương/độ khó/nội dung. */
  private buildWhere(
    mamonhoc: string,
    machuong = 0,
    dokho = 0,
    content = '',
  ): Prisma.CauHoiWhereInput {
    return {
      mamonhoc,
      trangthai: 1,
      // Câu mcq/essay (madv null) hoặc câu con reading (loai='reading').
      OR: [{ madv: null }, { loai: 'reading' }],
      ...(machuong ? { machuong } : {}),
      ...(dokho ? { dokho } : {}),
      ...(content
        ? { noidung: { contains: content, mode: 'insensitive' as const } }
        : {}),
    };
  }

  /** POST /question/getQuestionBySubject — 1 trang câu hỏi của môn. */
  async getQuestionBySubject(
    mamonhoc: string,
    machuong = 0,
    dokho = 0,
    content = '',
    page = 1,
  ): Promise<IQuestionRow[]> {
    const where = this.buildWhere(mamonhoc, machuong, dokho, content);
    const rows = await this.prisma.cauHoi.findMany({
      where,
      orderBy: { macauhoi: 'asc' },
      skip: (Math.max(page, 1) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        macauhoi: true,
        noidung: true,
        dokho: true,
        machuong: true,
        loai: true,
        madv: true,
      },
    });

    const mon = await this.prisma.monHoc.findUnique({
      where: { mamonhoc },
      select: { tenmonhoc: true },
    });
    const tenmonhoc = mon?.tenmonhoc ?? '';

    // Nội dung đoạn văn + số câu con cho các dòng reading.
    const madvs = [
      ...new Set(rows.filter((r) => r.loai === 'reading' && r.madv).map((r) => r.madv!)),
    ];
    const doanVanMap = new Map<number, string>();
    const subCountMap = new Map<number, number>();
    if (madvs.length) {
      const dvs = await this.prisma.doanVan.findMany({
        where: { madv: { in: madvs } },
        select: { madv: true, noidung: true },
      });
      dvs.forEach((d) => doanVanMap.set(d.madv, d.noidung));

      const counts = await this.prisma.cauHoi.groupBy({
        by: ['madv'],
        where: { madv: { in: madvs }, loai: 'reading', trangthai: 1 },
        _count: { _all: true },
      });
      counts.forEach((c) => c.madv && subCountMap.set(c.madv, c._count._all));
    }

    return rows.map((r) => ({
      macauhoi: r.macauhoi,
      noidung:
        r.loai === 'reading' && r.madv
          ? doanVanMap.get(r.madv) ?? r.noidung
          : r.noidung,
      dokho: r.dokho,
      machuong: r.machuong,
      loai: r.loai,
      tenmonhoc,
      num_subquestions: r.madv ? subCountMap.get(r.madv) ?? 0 : 0,
    }));
  }

  /** POST /question/getTotalPageQuestionBySubject — tổng số trang của môn. */
  async getTotalPageQuestionBySubject(
    mamonhoc: string,
    machuong = 0,
    dokho = 0,
    content = '',
  ): Promise<number> {
    const total = await this.prisma.cauHoi.count({
      where: this.buildWhere(mamonhoc, machuong, dokho, content),
    });
    return Math.ceil(total / PAGE_SIZE);
  }

  /** POST /question/getQuestionById — chi tiết 1 câu hỏi để mở modal sửa. */
  async getQuestionById(
    id: number,
  ): Promise<IQuestionDetail | { error: string }> {
    const q = await this.prisma.cauHoi.findUnique({ where: { macauhoi: id } });
    if (!q) return { error: 'not_found' };

    const base64 = this.toBase64(q.hinhanh);
    const detail: IQuestionDetail = {
      macauhoi: q.macauhoi,
      noidung: q.noidung,
      dapan_dung: q.dapan_dung,
      dokho: q.dokho,
      mamonhoc: q.mamonhoc,
      machuong: q.machuong,
      nguoitao: q.nguoitao,
      trangthai: q.trangthai,
      loai: q.loai,
      madv: q.madv,
      question_image_base64: base64,
      hinhanh_base64: base64,
    };

    // Reading: lấy nội dung + tiêu đề từ đoạn văn (thay getWithDoanVan).
    if (q.loai === 'reading' && q.madv) {
      const dv = await this.prisma.doanVan.findUnique({
        where: { madv: q.madv },
        select: { noidung: true, tieude: true },
      });
      detail.noidung = dv?.noidung ?? '';
      detail.tieude = dv?.tieude ?? '';
    }
    return detail;
  }

  /** POST /question/getAnswerById — đáp án (mcq/essay) hoặc câu con + đáp án (reading). */
  async getAnswerById(
    id: number,
  ): Promise<IAnswerRow[] | IReadingAnswerRow[]> {
    const q = await this.prisma.cauHoi.findUnique({
      where: { macauhoi: id },
      select: { macauhoi: true, loai: true, madv: true },
    });
    if (!q) return [];

    // Reading: gom đáp án của từng câu hỏi con (thay getSubQuestions + getAll).
    if (q.loai === 'reading' && q.madv) {
      const subs = await this.prisma.cauHoi.findMany({
        where: { madv: q.madv, loai: 'reading', trangthai: 1 },
        orderBy: { macauhoi: 'asc' },
        select: { macauhoi: true, noidung: true, hinhanh: true },
      });
      const result: IReadingAnswerRow[] = [];
      for (const sub of subs) {
        const answers = await this.prisma.cauTraLoi.findMany({
          where: { macauhoi: sub.macauhoi },
          orderBy: { macautl: 'asc' },
        });
        for (const ans of answers) {
          result.push({
            macauhoicon: sub.macauhoi,
            noidung_con: sub.noidung,
            noidungtl: ans.noidungtl,
            ladapan: ans.ladapan,
            question_image_base64: this.toBase64(sub.hinhanh),
            option_image_base64: this.toBase64(ans.hinhanh),
          });
        }
      }
      return result;
    }

    // mcq / essay.
    const answers = await this.prisma.cauTraLoi.findMany({
      where: { macauhoi: id },
      orderBy: { macautl: 'asc' },
    });
    return answers.map((ans) => ({
      macautl: ans.macautl,
      noidungtl: ans.noidungtl,
      ladapan: ans.ladapan,
      macauhoi: ans.macauhoi,
      option_image_base64: this.toBase64(ans.hinhanh),
    }));
  }

  /** POST /question/delete — xoá mềm câu hỏi (trangthai = 0). */
  async delete(macauhoi: number): Promise<boolean> {
    try {
      await this.prisma.cauHoi.update({
        where: { macauhoi },
        data: { trangthai: 0 },
      });
      return true;
    } catch (err) {
      this.logger.error('Xoá câu hỏi thất bại', err as Error);
      return false;
    }
  }
}
