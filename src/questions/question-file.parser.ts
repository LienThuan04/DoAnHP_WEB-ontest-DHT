import * as mammoth from 'mammoth';
import type {
  IParsedEssay,
  IParsedMcq,
  IParsedReading,
  ISubQuestion,
} from '@/questions/interfaces/questions.types';

/**
 * Bóc tách & parse file câu hỏi Word (.docx) — thay 3 method của question.php:
 * xulydoanvan (reading) / xulytracnghiem (mcq) / xulytuluan (essay).
 *
 * Bản PHP dùng PhpOffice\PhpWord lấy text từng phần tử rồi nối "\n", html_entity_
 * decode + nl2br + tách theo <br>. Ở đây dùng `mammoth.extractRawText` (đọc thuần
 * văn bản, mỗi đoạn 1 dòng) rồi tách theo xuống dòng — tương đương cho tài liệu
 * câu hỏi (mỗi mục/đáp án nằm trên 1 dòng riêng).
 */

/** Decode tập HTML entity hay gặp (giống html_entity_decode của PHP). */
function htmlEntityDecode(str: string): string {
  const named: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#039;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  return str
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#0?39);/g, (m) => named[m] ?? m);
}

/** Bỏ ký tự zero-width Word hay chèn (giống preg_replace \x{200B}-\x{200D}). */
function stripZeroWidth(str: string): string {
  return str.replace(/[\u200B-\u200D]/g, '');
}

/** Đọc .docx → mảng dòng đã trim, bỏ dòng trống (thay bước split của PHP). */
export async function extractDocxLines(buffer: Buffer): Promise<string[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  const decoded = htmlEntityDecode(value);
  return decoded
    .split(/<br\s*\/?>|\r\n|\n|\r/i)
    .map((l) => l.trim())
    .filter((l) => l !== '');
}

/** Sắp đáp án A→D rồi trả {mảng nội dung, vị trí 1-based của đáp án đúng}. */
function orderOptions(
  opts: Record<string, string>,
  correct: string,
): { options: string[]; answer: number } {
  const keys = Object.keys(opts).sort(
    (a, b) => a.charCodeAt(0) - b.charCodeAt(0),
  );
  return {
    options: keys.map((k) => opts[k]),
    answer: keys.indexOf(correct) + 1,
  };
}

/**
 * Parse khối đọc hiểu — thay xulydoanvan(). Dòng mở đầu `[Reading][level] - tiêu đề -`,
 * gom đoạn văn tới khi gặp câu hỏi (kết thúc `?`)/option/ANSWER/khối mới, rồi đọc
 * các câu hỏi con (mỗi câu kết thúc `?`, các dòng A./B.… + `ANSWER: X`).
 */
export function parseReadingDocx(lines: string[]): IParsedReading[] {
  const result: IParsedReading[] = [];
  const total = lines.length;
  let i = 0;

  while (i < total) {
    const m = /^\[Reading\]\[(\d+)\]\s*-\s*(.+?)\s*-\s*$/iu.exec(lines[i]);
    if (!m) {
      i++;
      continue;
    }

    const levelHeader = parseInt(m[1], 10);
    const title = m[2].trim();
    let passage = '';
    i++;

    // Gom đoạn văn.
    while (i < total) {
      const next = lines[i];
      if (
        /^\[Reading\]/i.test(next) ||
        /\?$/.test(next) ||
        /^\d+[.)]\s+/.test(next) ||
        /^[A-D][).]\s+/.test(next) ||
        /^ANSWER:/i.test(next)
      ) {
        break;
      }
      passage += '<br>' + next.trim();
      i++;
    }
    // PHP ltrim($passage, "<br>") — bỏ các ký tự đầu thuộc tập {<,b,r,>}.
    passage = passage.replace(/^[<br>]+/, '');

    // Đọc câu hỏi con.
    const subQuestions: ISubQuestion[] = [];
    while (i < total && /\?$/.test(lines[i])) {
      let questionText = lines[i].trim();
      let subLevel = levelHeader;
      const lm = /Level:\s*(\d+)/i.exec(questionText);
      if (lm) {
        subLevel = parseInt(lm[1], 10);
        questionText = questionText.replace(/Level:\s*\d+/i, '').trim();
      }
      i++;

      const opts: Record<string, string> = {};
      let correct: string | null = null;
      while (i < total) {
        const l = lines[i].trim();
        if (/^\[Reading\]/i.test(l) || /\?$/.test(l)) break;
        const mm = /^([A-D])[).]\s*(.+)$/u.exec(l);
        if (mm) opts[mm[1].toUpperCase()] = mm[2].trim();
        const ans = /^ANSWER:\s*([A-D])$/i.exec(l);
        if (ans) correct = ans[1].toUpperCase();
        i++;
      }

      if (Object.keys(opts).length === 0 || !correct) {
        throw new Error('Missing options or ANSWER in a question');
      }
      const { options, answer } = orderOptions(opts, correct);
      subQuestions.push({
        type: 'reading',
        level: subLevel,
        question: questionText,
        option: options,
        answer,
      });
    }

    result.push({
      type: 'reading',
      level: levelHeader,
      title,
      passage,
      questions: subQuestions,
    });
  }

  return result;
}

/**
 * Parse trắc nghiệm — thay xulytracnghiem(). Mỗi câu `[mcq][level] nội dung`, theo
 * sau là các dòng `A. ...`→`D. ...` và `ANSWER: X`.
 */
export function parseMcqDocx(lines: string[]): IParsedMcq[] {
  const result: IParsedMcq[] = [];
  const total = lines.length;
  let i = 0;

  while (i < total) {
    const m = /^\[mcq\]\[(\d+)\]\s*(.+)$/iu.exec(lines[i]);
    if (!m) {
      i++;
      continue;
    }

    const level = parseInt(m[1], 10);
    const questionText = stripZeroWidth(htmlEntityDecode(m[2].trim()));
    i++;

    const options: Record<string, string> = {};
    let answer: string | null = null;
    while (i < total) {
      const l = lines[i].trim();
      const opt = /^([A-D])\s*[).]\s*(.+)$/u.exec(l);
      if (opt) {
        const letter = opt[1].toUpperCase();
        options[letter] = stripZeroWidth(htmlEntityDecode(opt[2].trim()));
      } else {
        const ans = /^ANSWER:\s*([A-D])\b/i.exec(l);
        if (ans) {
          answer = ans[1].toUpperCase();
          break; // dừng tại dòng ANSWER, vòng ngoài sẽ bỏ qua nó.
        }
      }
      i++;
    }

    if (!answer || Object.keys(options).length === 0) {
      throw new Error('Missing options or ANSWER in question: ' + questionText);
    }
    const { options: optionsArr, answer: answerNumber } = orderOptions(
      options,
      answer,
    );
    result.push({
      type: 'mcq',
      level,
      question: questionText,
      option: optionsArr,
      answer: answerNumber,
    });
  }

  return result;
}

/** Parse tự luận — thay xulytuluan(). Mỗi câu `[essay][level] nội dung`. */
export function parseEssayDocx(lines: string[]): IParsedEssay[] {
  const result: IParsedEssay[] = [];
  const total = lines.length;
  let i = 0;

  while (i < total) {
    const m = /^\[essay\]\[(\d+)\]\s*(.+)$/i.exec(lines[i]);
    if (m) {
      result.push({
        type: 'essay',
        level: parseInt(m[1], 10),
        question: htmlEntityDecode(m[2].trim()),
      });
    }
    i++;
  }

  return result;
}
