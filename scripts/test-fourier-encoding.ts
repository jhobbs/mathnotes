// Test script for fourier encoding
// Run with: npx tsx scripts/test-fourier-encoding.ts

import { encodeCoeffs, decodeCoeffs, COEFF_COUNT, runTests } from '../demos/complex-analysis/fourier-encoding';

const passed = runTests();
process.exit(passed ? 0 : 1);
