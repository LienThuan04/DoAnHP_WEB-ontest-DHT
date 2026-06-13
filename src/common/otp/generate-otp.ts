import { randomInt } from 'crypto';

export const generateNumericOtp = (length: number): string => {
  if (!Number.isInteger(length) || length < 4) {
    throw new Error('OTP length must be an integer >= 4');
  }
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return randomInt(min, max).toString();
};
