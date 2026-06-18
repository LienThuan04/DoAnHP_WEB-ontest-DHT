import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IAnswerRow,
  IIncomingAnswer,
  IIncomingOption,
  IQuestionDetail,
  IQuestionRow,
  IReadingAnswerRow,
  IWriteQuestionInput,
  IWriteQuestionResult,
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

  // ── Helper cho thêm/sửa (port từ question.php) ──────────────────────────────

  /** htmlspecialchars(ENT_QUOTES) + bỏ ký tự zero-width — thay encodeHTML(). */
  private encodeHTML(str: string | null | undefined): string {
    return (str ?? '')
      .replace(/[​‌‍]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Cờ "đúng/bật" theo kiểu lỏng của PHP (1 | '1' | true | 'true'). */
  private truthy(v: unknown): boolean {
    return v === 1 || v === '1' || v === true || v === 'true';
  }

  /** Sao chép sang Uint8Array nền ArrayBuffer (kiểu Bytes mà Prisma 7 yêu cầu). */
  private toBytes(src: ArrayLike<number>): Uint8Array<ArrayBuffer> {
    const out = new Uint8Array(src.length);
    out.set(src);
    return out;
  }

  /** Giải mã base64 (có/không tiền tố data-URI) → bytes; rỗng → null. */
  private decodeBase64Image(
    val: string | null | undefined,
  ): Uint8Array<ArrayBuffer> | null {
    if (!val) return null;
    const m = /^data:image\/[^;]+;base64,(.*)$/s.exec(val);
    const b64 = m ? m[1] : val;
    try {
      const buf = Buffer.from(b64, 'base64');
      return buf.length ? this.toBytes(buf) : null;
    } catch {
      return null;
    }
  }

  /** Hàng đợi FIFO bytes ảnh upload theo tên field (bỏ placeholder rỗng). */
  private fileQueue(
    files: Express.Multer.File[],
    field: string,
  ): Uint8Array<ArrayBuffer>[] {
    return files
      .filter((f) => f.fieldname === field && f.buffer?.length)
      .map((f) => this.toBytes(f.buffer));
  }

  /**
   * Chọn ảnh cho 1 option/câu hỏi con theo thứ tự ưu tiên: xoá → ảnh cũ (base64)
   * → ảnh mới kế tiếp trong hàng đợi upload.
   *
   * KHÁC bản PHP (ưu tiên file trước base64 dựa trên mảng `$_FILES` có giữ ô
   * rỗng theo vị trí): multipart Node không giữ được vị trí ô rỗng, nên ưu tiên
   * base64 (ảnh cũ giữ lại) rồi mới lấy file mới — cho kết quả đúng ở các ca phổ
   * biến (thêm mới = chỉ file; sửa = ảnh cũ base64, đổi ảnh = file mới đã xoá base64).
   */
  private pickImage(
    queue: Uint8Array<ArrayBuffer>[],
    item: IIncomingOption,
  ): Uint8Array<ArrayBuffer> | null {
    if (this.truthy(item.delete_image)) return null;
    const kept = this.decodeBase64Image(item.image);
    if (kept) return kept;
    return queue.length ? queue.shift()! : null;
  }

  /** Ảnh câu hỏi chính: file đầu tiên field `hinhanh` (null nếu không có). */
  private mainImage(
    files: Express.Multer.File[],
  ): Uint8Array<ArrayBuffer> | null {
    const f = files.find((x) => x.fieldname === 'hinhanh' && x.buffer?.length);
    return f ? this.toBytes(f.buffer) : null;
  }

  /** Parse JSON `cautraloi`; lỗi cú pháp → null (báo lỗi cho client). */
  private parseAnswers(raw: string | undefined): IIncomingAnswer[] | null {
    try {
      const v = JSON.parse(raw ?? '[]') as unknown;
      return Array.isArray(v) ? (v as IIncomingAnswer[]) : [];
    } catch {
      return null;
    }
  }

  /**
   * POST /question/addQues — thêm câu hỏi mcq/essay/reading (multipart).
   * Thay addQues() của question.php. Ảnh chính field `hinhanh`; ảnh đáp án/câu
   * con field `option_hinhanh[]` (ảnh cũ base64 nằm trong JSON `cautraloi`).
   */
  async addQuestion(
    input: IWriteQuestionInput,
    files: Express.Multer.File[],
    nguoitao: string,
  ): Promise<IWriteQuestionResult> {
    const mamonhoc = input.mamon ?? '';
    const machuong = Number(input.machuong);
    const dokho = Number(input.dokho);
    const loai = input.loai ?? 'mcq';

    if (!mamonhoc || !input.machuong || !input.dokho) {
      return {
        status: 'error',
        message: 'Vui lòng nhập đầy đủ môn học, chương và độ khó',
      };
    }

    const answers = this.parseAnswers(input.cautraloi);
    if (answers === null) {
      return { status: 'error', message: 'Dữ liệu đáp án không hợp lệ' };
    }

    const mainImg = this.mainImage(files);
    const optQueue = this.fileQueue(files, 'option_hinhanh[]');

    try {
      if (loai === 'mcq' || loai === 'essay') {
        await this.prisma.$transaction(async (tx) => {
          const q = await tx.cauHoi.create({
            data: {
              noidung: this.encodeHTML((input.noidung ?? '').trim()),
              dokho,
              mamonhoc,
              machuong,
              nguoitao,
              loai,
              madv: null,
              hinhanh: mainImg,
            },
            select: { macauhoi: true },
          });

          for (const ans of answers) {
            const content = this.encodeHTML((ans.content ?? '').trim());
            const check = loai === 'mcq' && this.truthy(ans.check) ? 1 : 0;
            const optImage = this.pickImage(optQueue, ans);
            if (content === '' && optImage === null) continue;
            await tx.cauTraLoi.create({
              data: {
                macauhoi: q.macauhoi,
                noidungtl: content,
                ladapan: check,
                hinhanh: optImage,
              },
            });
          }
        });
      } else if (loai === 'reading') {
        const noidungDV = this.encodeHTML((input.doanvan_noidung ?? '').trim());
        if (noidungDV === '' || answers.length === 0) {
          return {
            status: 'error',
            message: 'Vui lòng thêm nội dung và câu hỏi con',
          };
        }
        const tieudeDV = this.encodeHTML((input.doanvan_tieude ?? '').trim());

        await this.prisma.$transaction(async (tx) => {
          const dv = await tx.doanVan.create({
            data: {
              noidung: noidungDV,
              tieude: tieudeDV,
              mamonhoc,
              machuong,
              nguoitao,
            },
            select: { madv: true },
          });

          for (const sub of answers) {
            const subContent = this.encodeHTML((sub.content ?? '').trim());
            if (subContent === '') continue;
            const subQ = await tx.cauHoi.create({
              data: {
                noidung: subContent,
                dokho,
                mamonhoc,
                machuong,
                nguoitao,
                loai: 'reading',
                madv: dv.madv,
              },
              select: { macauhoi: true },
            });

            for (const opt of sub.options ?? []) {
              const optContent = this.encodeHTML((opt.content ?? '').trim());
              const check = this.truthy(opt.check) ? 1 : 0;
              const optImage = this.pickImage(optQueue, opt);
              if (optContent === '' && optImage === null) continue;
              await tx.cauTraLoi.create({
                data: {
                  macauhoi: subQ.macauhoi,
                  noidungtl: optContent,
                  ladapan: check,
                  hinhanh: optImage,
                },
              });
            }
          }
        });
      } else {
        return { status: 'error', message: 'Loại câu hỏi không hợp lệ' };
      }

      return { status: 'success', message: 'Thêm câu hỏi thành công', loai };
    } catch (err) {
      this.logger.error('Thêm câu hỏi thất bại', err as Error);
      return {
        status: 'error',
        message: 'Lỗi hệ thống: ' + (err as Error).message,
      };
    }
  }

  /**
   * POST /question/editQuesion — cập nhật câu hỏi mcq/essay/reading (multipart).
   * Thay editQuesion() của question.php. mcq/essay: cập nhật câu hỏi + xoá cứng
   * rồi tạo lại đáp án. reading: cập nhật đoạn văn, xoá MỀM câu con cũ + xoá cứng
   * đáp án của chúng, tạo lại câu con/đáp án mới.
   */
  async editQuestion(
    input: IWriteQuestionInput,
    files: Express.Multer.File[],
    nguoitao: string,
  ): Promise<IWriteQuestionResult> {
    const id = Number(input.id);
    const mamonhoc = input.mamon ?? '';
    const machuong = Number(input.machuong);
    const dokho = Number(input.dokho);
    const loai = input.loai ?? 'mcq';
    const deleteQuestionImage = this.truthy(input.delete_question_image);

    if (!input.id || !mamonhoc || !input.machuong || !input.dokho) {
      return { status: 'error', message: 'Thiếu thông tin bắt buộc' };
    }

    const answers = this.parseAnswers(input.cautraloi);
    if (answers === null) {
      return { status: 'error', message: 'Dữ liệu đáp án không hợp lệ' };
    }

    const question = await this.prisma.cauHoi.findUnique({
      where: { macauhoi: id },
      select: { macauhoi: true, madv: true },
    });
    if (!question) {
      return { status: 'error', message: 'Câu hỏi không tồn tại' };
    }

    const mainImg = deleteQuestionImage ? null : this.mainImage(files);
    const optQueue = this.fileQueue(files, 'option_hinhanh[]');

    try {
      if (loai === 'reading') {
        const noidungDV = this.encodeHTML((input.doanvan_noidung ?? '').trim());
        if (noidungDV === '') {
          return { status: 'error', message: 'Vui lòng nhập nội dung đoạn văn' };
        }
        if (answers.length === 0) {
          return { status: 'error', message: 'Phải có ít nhất 1 câu hỏi con' };
        }
        const madv = question.madv;
        if (madv === null) {
          return { status: 'error', message: 'Câu hỏi không có đoạn văn' };
        }

        await this.prisma.$transaction(async (tx) => {
          await tx.doanVan.update({
            where: { madv },
            data: {
              noidung: noidungDV,
              // tieude giữ nguyên dạng người dùng nhập như editQuesion() gốc.
              tieude: input.doanvan_tieude ?? '',
              mamonhoc,
              machuong,
              nguoitao,
            },
          });

          // Xoá MỀM câu con cũ + xoá cứng đáp án của chúng.
          const oldSubs = await tx.cauHoi.findMany({
            where: { madv, loai: 'reading', trangthai: 1 },
            select: { macauhoi: true },
          });
          for (const sub of oldSubs) {
            await tx.cauTraLoi.deleteMany({ where: { macauhoi: sub.macauhoi } });
            await tx.cauHoi.update({
              where: { macauhoi: sub.macauhoi },
              data: { trangthai: 0 },
            });
          }

          for (const subQ of answers) {
            const subContent = this.encodeHTML((subQ.content ?? '').trim());
            if (subContent === '') continue;
            const subImage = this.pickImage(optQueue, subQ);
            const created = await tx.cauHoi.create({
              data: {
                noidung: subContent,
                dokho,
                mamonhoc,
                machuong,
                nguoitao,
                loai: 'reading',
                madv,
                hinhanh: subImage,
              },
              select: { macauhoi: true },
            });

            for (const opt of subQ.options ?? []) {
              const optContent = this.encodeHTML((opt.content ?? '').trim());
              if (optContent === '') continue;
              const optImage = this.pickImage(optQueue, opt);
              const check = this.truthy(opt.check) ? 1 : 0;
              await tx.cauTraLoi.create({
                data: {
                  macauhoi: created.macauhoi,
                  noidungtl: optContent,
                  ladapan: check,
                  hinhanh: optImage,
                },
              });
            }
          }

          // Cập nhật bản ghi câu hỏi gốc (noidung rỗng như bản PHP).
          await tx.cauHoi.update({
            where: { macauhoi: id },
            data: {
              noidung: '',
              dokho,
              mamonhoc,
              machuong,
              nguoitao,
              loai: 'reading',
              madv,
              ...(mainImg !== null ? { hinhanh: mainImg } : {}),
            },
          });
        });
      } else {
        // mcq / essay.
        const noidung = this.encodeHTML((input.noidung ?? '').trim());
        if (loai === 'mcq' && answers.length === 0) {
          return { status: 'error', message: 'Phải có ít nhất 1 đáp án' };
        }

        const validAnswers: {
          content: string;
          check: number;
          image: Uint8Array<ArrayBuffer> | null;
        }[] = [];
        for (const ans of answers) {
          const content = this.encodeHTML((ans.content ?? '').trim());
          const deleteImage = this.truthy(ans.delete_image);
          const optImage = this.pickImage(optQueue, ans);
          if (content === '' && optImage === null && !deleteImage) continue;
          validAnswers.push({
            content,
            check: this.truthy(ans.check) ? 1 : 0,
            image: optImage,
          });
        }

        await this.prisma.$transaction(async (tx) => {
          await tx.cauHoi.update({
            where: { macauhoi: id },
            data: {
              noidung,
              dokho,
              mamonhoc,
              machuong,
              nguoitao,
              loai,
              madv: null,
              ...(deleteQuestionImage
                ? { hinhanh: null }
                : mainImg !== null
                  ? { hinhanh: mainImg }
                  : {}),
            },
          });

          await tx.cauTraLoi.deleteMany({ where: { macauhoi: id } });
          for (const ans of validAnswers) {
            await tx.cauTraLoi.create({
              data: {
                macauhoi: id,
                noidungtl: ans.content,
                ladapan: ans.check,
                hinhanh: ans.image,
              },
            });
          }
        });
      }

      return { status: 'success', message: 'Cập nhật câu hỏi thành công' };
    } catch (err) {
      this.logger.error('Cập nhật câu hỏi thất bại', err as Error);
      return {
        status: 'error',
        message: 'Lỗi hệ thống: ' + (err as Error).message,
      };
    }
  }
}
