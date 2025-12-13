// Fourier coefficient encoding/decoding for URL sharing
// Encodes 64 complex numbers with DEFLATE compression + URL-safe base64

import { deflateSync, inflateSync } from 'fflate';

export const COEFF_COUNT = 64;
const COEFF_RANGE = 512.0;
const COEFF_SCALE = 32767.0 / COEFF_RANGE;
const COEFF_SCALE_INV = COEFF_RANGE / 32767.0;

export interface ComplexLike {
  re: number;
  im: number;
}

export function encodeCoeffs(coeffs: ComplexLike[]): string {
  // Quantize coefficients to int16
  const rawBytes = new Uint8Array(COEFF_COUNT * 4);
  const view = new DataView(rawBytes.buffer);

  for (let i = 0; i < COEFF_COUNT; i++) {
    const c = i < coeffs.length ? coeffs[i] : { re: 0, im: 0 };
    const re = Math.max(-COEFF_RANGE, Math.min(COEFF_RANGE, c.re));
    const im = Math.max(-COEFF_RANGE, Math.min(COEFF_RANGE, c.im));
    const reQ = Math.round(re * COEFF_SCALE);
    const imQ = Math.round(im * COEFF_SCALE);
    view.setInt16(i * 4, reQ, false);     // big-endian
    view.setInt16(i * 4 + 2, imQ, false); // big-endian
  }

  // Compress with DEFLATE
  const compressed = deflateSync(rawBytes);

  // Convert to URL-safe base64
  let b64 = '';
  for (let i = 0; i < compressed.length; i += 3) {
    const a = compressed[i];
    const b = compressed[i + 1] || 0;
    const c = compressed[i + 2] || 0;
    const triple = (a << 16) | (b << 8) | c;
    b64 += toB64Char((triple >> 18) & 0x3f);
    b64 += toB64Char((triple >> 12) & 0x3f);
    b64 += i + 1 < compressed.length ? toB64Char((triple >> 6) & 0x3f) : '';
    b64 += i + 2 < compressed.length ? toB64Char(triple & 0x3f) : '';
  }
  return b64;
}

export function decodeCoeffs(b64: string): ComplexLike[] {
  // Decode URL-safe base64
  const compressedBytes: number[] = [];

  for (let i = 0; i < b64.length; i += 4) {
    const a = fromB64Char(b64[i]);
    const b = fromB64Char(b64[i + 1] || 'A');
    const c = fromB64Char(b64[i + 2] || 'A');
    const d = fromB64Char(b64[i + 3] || 'A');
    const triple = (a << 18) | (b << 12) | (c << 6) | d;
    compressedBytes.push((triple >> 16) & 0xff);
    if (i + 1 < b64.length) compressedBytes.push((triple >> 8) & 0xff);
    if (i + 2 < b64.length) compressedBytes.push(triple & 0xff);
  }

  // Decompress with DEFLATE
  const rawBytes = inflateSync(new Uint8Array(compressedBytes));
  const view = new DataView(rawBytes.buffer);
  const coeffs: ComplexLike[] = [];

  for (let i = 0; i < COEFF_COUNT; i++) {
    const reQ = view.getInt16(i * 4, false);     // big-endian
    const imQ = view.getInt16(i * 4 + 2, false); // big-endian
    coeffs.push({ re: reQ * COEFF_SCALE_INV, im: imQ * COEFF_SCALE_INV });
  }

  return coeffs;
}

// Number of sample points to use when encoding for URL sharing
export const SAMPLE_COUNT_FOR_ENCODING = 256;

// URL-safe base64 helpers (A-Z, a-z, 0-9, -, _)
function toB64Char(n: number): string {
  if (n < 26) return String.fromCharCode(65 + n);        // A-Z
  if (n < 52) return String.fromCharCode(97 + n - 26);   // a-z
  if (n < 62) return String.fromCharCode(48 + n - 52);   // 0-9
  if (n === 62) return '-';
  return '_';
}

function fromB64Char(c: string): number {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65;        // A-Z
  if (code >= 97 && code <= 122) return code - 97 + 26;  // a-z
  if (code >= 48 && code <= 57) return code - 48 + 52;   // 0-9
  if (c === '-') return 62;
  if (c === '_') return 63;
  return 0;
}

// Test function - can be run directly
export function runTests(): boolean {
  let passed = true;

  // Test 1: Round-trip with simple values
  const test1 = [
    { re: 1, im: 2 },
    { re: -3.5, im: 4.5 },
    { re: 0, im: 0 },
  ];
  const encoded1 = encodeCoeffs(test1);
  const decoded1 = decodeCoeffs(encoded1);

  console.log('Test 1: Simple round-trip');
  console.log('  Input:', test1.slice(0, 3));
  console.log('  Encoded length:', encoded1.length);
  console.log('  Decoded:', decoded1.slice(0, 3));

  // Check first 3 values are close
  for (let i = 0; i < 3; i++) {
    const err_re = Math.abs(decoded1[i].re - test1[i].re);
    const err_im = Math.abs(decoded1[i].im - test1[i].im);
    if (err_re > 0.02 || err_im > 0.02) {
      console.log(`  FAIL: coefficient ${i} error too large: re=${err_re}, im=${err_im}`);
      passed = false;
    }
  }

  // Check remaining are zeros
  for (let i = 3; i < COEFF_COUNT; i++) {
    if (decoded1[i].re !== 0 || decoded1[i].im !== 0) {
      console.log(`  FAIL: coefficient ${i} should be zero`);
      passed = false;
    }
  }

  // Test 2: Full 64 coefficients
  const test2: ComplexLike[] = [];
  for (let i = 0; i < 64; i++) {
    test2.push({ re: i - 32, im: (i - 32) * 0.5 });
  }
  const encoded2 = encodeCoeffs(test2);
  const decoded2 = decodeCoeffs(encoded2);

  console.log('\nTest 2: Full 64 coefficients');
  console.log('  Encoded length:', encoded2.length);

  for (let i = 0; i < 64; i++) {
    const err_re = Math.abs(decoded2[i].re - test2[i].re);
    const err_im = Math.abs(decoded2[i].im - test2[i].im);
    if (err_re > 0.02 || err_im > 0.02) {
      console.log(`  FAIL: coefficient ${i} error too large: re=${err_re}, im=${err_im}`);
      passed = false;
    }
  }

  // Test 3: Edge values (near range limits)
  const test3 = [
    { re: 500, im: -500 },
    { re: -500, im: 500 },
  ];
  const encoded3 = encodeCoeffs(test3);
  const decoded3 = decodeCoeffs(encoded3);

  console.log('\nTest 3: Edge values');
  console.log('  Input:', test3);
  console.log('  Decoded:', decoded3.slice(0, 2));

  for (let i = 0; i < 2; i++) {
    const err_re = Math.abs(decoded3[i].re - test3[i].re);
    const err_im = Math.abs(decoded3[i].im - test3[i].im);
    if (err_re > 0.02 || err_im > 0.02) {
      console.log(`  FAIL: coefficient ${i} error too large: re=${err_re}, im=${err_im}`);
      passed = false;
    }
  }

  // Test 4: Verify encoded string is URL-safe
  console.log('\nTest 4: URL-safe characters');
  console.log('  Encoded:', encoded2);
  const urlSafePattern = /^[A-Za-z0-9\-_]*$/;
  if (!urlSafePattern.test(encoded2)) {
    console.log('  FAIL: encoded string contains non-URL-safe characters');
    passed = false;
  } else {
    console.log('  OK: all characters are URL-safe');
  }

  console.log('\n' + (passed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'));
  return passed;
}
