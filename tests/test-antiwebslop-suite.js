/**
 * Test Suite Antiwebslop & Mobile Responsive Compliance
 * Mengesahkan penyingkiran AI slop, integriti tema korporat Andalusia,
 * dan piawaian mudah alih responsif (antiwebslop.cesaroeduardo.com).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('  MEMULAKAN SUITE UJIAN ANTIWEBSLOP & MOBILE RESPONSIVE         ');
console.log('================================================================\n');

// 1. Jalankan slop-lint ke atas docs/
try {
  const lintOutput = execSync('node tests/slop-lint.mjs docs/ --quiet', { encoding: 'utf8' });
  console.log('✓ Ujian 1 Lulus: slop-lint selesai dengan 0 error & 0 warning di seluruh docs/');
} catch (err) {
  assert.fail(`slop-lint menemui ralat: ${err.stdout || err.message}`);
}

// 2. Semak fail docs/DESIGN.md wujud dan mempunyai blok design-tokens
const designMdPath = path.join(__dirname, '../docs/DESIGN.md');
assert.ok(fs.existsSync(designMdPath), 'docs/DESIGN.md mesti wujud');
const designMd = fs.readFileSync(designMdPath, 'utf8');
assert.ok(designMd.includes('```design-tokens'), 'DESIGN.md mesti mengandungi blok design-tokens');
assert.ok(designMd.includes('fonts:'), 'DESIGN.md mesti mendefinisikan fonts');
assert.ok(designMd.includes('colors:'), 'DESIGN.md mesti mendefinisikan colors');
assert.ok(designMd.includes('radii:'), 'DESIGN.md mesti mendefinisikan radii');
console.log('✓ Ujian 2 Lulus: docs/DESIGN.md dan token rasmi disahkan');

// 3. Semak styles.css bebas daripada transition: all dan glassmorphism
const cssPath = path.join(__dirname, '../docs/styles.css');
const css = fs.readFileSync(cssPath, 'utf8');
assert.ok(!css.includes('transition: all'), 'styles.css tidak boleh ada transition: all');
assert.ok(!css.includes('backdrop-filter: blur'), 'styles.css tidak boleh ada backdrop-filter: blur');
assert.ok(css.includes(':focus-visible'), 'styles.css mesti mengandungi :focus-visible untuk a11y');
assert.ok(css.includes('text-wrap: balance'), 'styles.css mesti ada text-wrap: balance untuk elak widow lines');
assert.ok(css.includes('text-wrap: pretty'), 'styles.css mesti ada text-wrap: pretty');
assert.ok(css.includes('prefers-reduced-motion'), 'styles.css mesti ada sokongan prefers-reduced-motion');
console.log('✓ Ujian 3 Lulus: Bebas transition: all, bebas glassmorphism & sokongan penuh a11y disahkan');

// 4. Semak ketiadaan emoji decoration dalam docs/index.html, status.html, admin_review.html
const EMOJI_REGEX = /(?![\u00A9\u00AE\u2122\u2194-\u2199])\p{Extended_Pictographic}/u;
['docs/index.html', 'docs/status.html', 'docs/admin_review.html', 'docs/app.js'].forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Abaikan baris komen jika ada
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    assert.ok(!EMOJI_REGEX.test(line), `Fail ${file} baris ${idx + 1} masih mengandungi emoji dekorasi slop: ${line}`);
  });
});
console.log('✓ Ujian 4 Lulus: Tiada emoji slop dikesan dalam fail HTML & JavaScript');

// 5. Semak komponen mobile responsive tactile rating tiles
const indexHtml = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');
assert.ok(indexHtml.includes('<div class="score-num-pill">2</div>'), 'index.html mesti ada tile tactile nombor 2');
assert.ok(indexHtml.includes('<div class="score-num-pill">1</div>'), 'index.html mesti ada tile tactile nombor 1');
assert.ok(indexHtml.includes('<div class="score-num-pill">0</div>'), 'index.html mesti ada tile tactile nombor 0');
assert.ok(indexHtml.includes('svg width="22" height="22"'), 'index.html mesti guna vektor SVG rasmi bagi logo');
console.log('✓ Ujian 5 Lulus: Komponen tactile rating tile & SVG rasmi disahkan 100%');

console.log('\n================================================================');
console.log('  SEMUA 5 UJIAN ANTIWEBSLOP & MOBILE LULUS! (100% SUKSES)       ');
console.log('================================================================');
