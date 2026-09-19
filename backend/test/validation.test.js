import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImage, validId } from '../src/lib/validation.js';
test('uploads reject remote URLs, unsupported formats and oversized bodies', () => {
 assert.equal(validateImage('http://127.0.0.1/internal'), false);
 assert.equal(validateImage('data:image/svg+xml;base64,PHN2Zz4='), false);
 assert.equal(validateImage('data:image/png;base64,' + Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64')), false);
 assert.equal(validateImage('data:image/png;base64,aGVsbG8='), true);
 assert.equal(validId({ $ne: null }), false);
 assert.equal(validId('507f1f77bcf86cd799439011'), true);
});
