import { Injectable } from '@nestjs/common';

/* a file support to sanitize input data to prevent XSS attacks and other injection attacks */
@Injectable()
export class SanitizerService {
  /**
   * sanitize 1 string
   */
  sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * sanitize object recursively
   */
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized: Record<string, unknown> = { ...obj };

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      }

      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      }
    }

    return sanitized as T;
  }

  /**
   * sanitize array
   */
  sanitizeArray<T extends Record<string, any>>(arr: T[]): T[] {
    if (!Array.isArray(arr)) {
      return arr;
    }

    return arr.map((item) => this.sanitizeObject(item));
  }
}