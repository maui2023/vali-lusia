/**
 * Vali-Lusia: Suite Ujian Automasi Komprehensif
 * Sistem Soalan Validasi 3 Kategori & Enjin Graf Keputusan (Result Graph)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('  MEMULAKAN SUITE UJIAN AUTOMASI VALI-LUSIA (SOALAN & GRAF)     ');
console.log('================================================================\n');

// 1. Muat Modul ValiLusiaApp
const ValiLusiaApp = require('../docs/app.js');
assert.ok(ValiLusiaApp, 'Modul ValiLusiaApp mesti berjaya dimuatkan');
assert.strictEqual(typeof ValiLusiaApp.calculateScore, 'function', 'calculateScore mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.validateInputs, 'function', 'validateInputs mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.generateValidationCode, 'function', 'generateValidationCode mesti merupakan fungsi');
console.log('✓ Ujian 1 Lulus: Modul logik ValiLusiaApp berjaya diimport');

// 2. Uji Penjanaan Kod Rujukan (VAL-######)
const testCode = ValiLusiaApp.generateValidationCode();
assert.match(testCode, /^VAL-\d{6}$/, 'Kod rujukan mesti mengikut format regex ^VAL-\\d{6}$');
console.log(`✓ Ujian 2 Lulus: Penjanaan kod validasi sah: ${testCode}`);

// 3. Uji Pemformatan Nombor Telefon Malaysia
const formatted1 = ValiLusiaApp.formatPhone('0123456789');
assert.strictEqual(formatted1, '012-3456789', '0123456789 patut diformat kepada 012-3456789');
const formatted2 = ValiLusiaApp.formatPhone('01987654321');
assert.strictEqual(formatted2, '019-87654321', 'Format nombor 11-digit telefon bimbit sah');
console.log('✓ Ujian 3 Lulus: Pemformatan nombor telefon automatik berfungsi dengan tepat');

// 4. Uji Pengiraan Skor & Penarafan (Semua Senario)
// Senario A: Skor Penuh (2 + 2 + 2 = 6 / 100%)
const scoreFull = ValiLusiaApp.calculateScore(2, 2, 2);
assert.strictEqual(scoreFull.total, 6, 'Jumlah skor penuh mesti 6');
assert.strictEqual(scoreFull.percentage, 100, 'Peratusan penuh mesti 100%');
assert.strictEqual(scoreFull.rating, 'CEMERLANG', 'Penarafan skor 6 mesti CEMERLANG');
assert.strictEqual(scoreFull.initialStatus, 'PENDING_REVIEW', 'Status awal mesti PENDING_REVIEW');

// Senario B: Skor Baik (2 + 1 + 2 = 5 / 83%)
const score5 = ValiLusiaApp.calculateScore(2, 1, 2);
assert.strictEqual(score5.total, 5, 'Jumlah skor mesti 5');
assert.strictEqual(score5.percentage, 83, 'Peratusan mesti 83%');
assert.strictEqual(score5.rating, 'CEMERLANG', 'Penarafan skor 5 mesti CEMERLANG');

// Senario C: Skor Sederhana (1 + 1 + 1 = 3 / 50%)
const score3 = ValiLusiaApp.calculateScore(1, 1, 1);
assert.strictEqual(score3.total, 3, 'Jumlah skor mesti 3');
assert.strictEqual(score3.percentage, 50, 'Peratusan mesti 50%');
assert.strictEqual(score3.rating, 'MEMUASKAN', 'Penarafan skor 3 mesti MEMUASKAN');

// Senario D: Skor Rendah / Perlu Tindakan (1 + 0 + 1 = 2 / 33%)
const score2 = ValiLusiaApp.calculateScore(1, 0, 1);
assert.strictEqual(score2.total, 2, 'Jumlah skor mesti 2');
assert.strictEqual(score2.percentage, 33, 'Peratusan mesti 33%');
assert.strictEqual(score2.rating, 'PERLU TINDAKAN', 'Penarafan skor 2 mesti PERLU TINDAKAN');
assert.strictEqual(score2.initialStatus, 'ACTION_REQUIRED', 'Status awal skor rendah mesti ACTION_REQUIRED');

// Senario E: Skor Sifar (0 + 0 + 0 = 0 / 0%)
const score0 = ValiLusiaApp.calculateScore(0, 0, 0);
assert.strictEqual(score0.total, 0, 'Jumlah skor mesti 0');
assert.strictEqual(score0.percentage, 0, 'Peratusan mesti 0%');
assert.strictEqual(score0.rating, 'PERLU TINDAKAN', 'Penarafan skor 0 mesti PERLU TINDAKAN');

// Senario F: Ujian Had Batas Clamping (nilai luar julat diapit ke 0-2)
const scoreClamped = ValiLusiaApp.calculateScore(99, -5, '2');
assert.strictEqual(scoreClamped.cat1, 2, '99 diapit kepada 2');
assert.strictEqual(scoreClamped.cat2, 0, '-5 diapit kepada 0');
assert.strictEqual(scoreClamped.cat3, 2, 'Rentetan "2" diparsing kepada 2');
assert.strictEqual(scoreClamped.total, 4, 'Jumlah mesti 4');
assert.strictEqual(scoreClamped.rating, 'MEMUASKAN');
console.log('✓ Ujian 4 Lulus: Logik kalkulator skor 3 kategori & penarafan lulus semua senario');

// 5. Uji Validasi Input Frontend
const invalid1 = ValiLusiaApp.validateInputs('', '', null, null, null);
assert.strictEqual(invalid1.isValid, false, 'Borang kosong mesti tidak sah');
assert.ok(invalid1.errors.fullName, 'Mesti laporkan ralat fullName');
assert.ok(invalid1.errors.phoneNumber, 'Mesti laporkan ralat phoneNumber');
assert.ok(invalid1.errors.cat1, 'Mesti laporkan ralat cat1');
assert.ok(invalid1.errors.cat2, 'Mesti laporkan ralat cat2');
assert.ok(invalid1.errors.cat3, 'Mesti laporkan ralat cat3');

const invalid2 = ValiLusiaApp.validateInputs('AB', '012-3456789', '2', '2', '2');
assert.strictEqual(invalid2.isValid, false, 'Nama kurang 3 huruf tidak sah');
assert.ok(invalid2.errors.fullName, 'Mesti laporkan ralat nama');

const invalid3 = ValiLusiaApp.validateInputs('AHMAD DANIAL', '123', '2', '2', '2');
assert.strictEqual(invalid3.isValid, false, 'Nombor telefon tidak cukup digit tidak sah');
assert.ok(invalid3.errors.phoneNumber, 'Mesti laporkan ralat nombor telefon');

const valid = ValiLusiaApp.validateInputs('AHMAD DANIAL BIN ABDUL AZIZ', '012-3456789', '2', '1', '2');
assert.strictEqual(valid.isValid, true, 'Input lengkap dan tepat mesti sah');
assert.strictEqual(Object.keys(valid.errors).length, 0, 'Tiada ralat bagi input sah');
console.log('✓ Ujian 5 Lulus: Validasi mandatori borang (Nama, Telefon, 3 Kategori) disahkan');

// 6. Uji Integriti Antaramuka docs/index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');
assert.ok(indexHtml.includes('name="cat1"'), 'index.html mesti mempunyai radio name="cat1"');
assert.ok(indexHtml.includes('name="cat2"'), 'index.html mesti mempunyai radio name="cat2"');
assert.ok(indexHtml.includes('name="cat3"'), 'index.html mesti mempunyai radio name="cat3"');
assert.ok(indexHtml.includes('id="resultGraphModal"'), 'index.html mesti mempunyai modal resultGraphModal');
assert.ok(indexHtml.includes('id="resTotalScore"'), 'index.html mesti mempunyai elemen resTotalScore');
assert.ok(indexHtml.includes('id="barFillCat1"'), 'index.html mesti mempunyai elemen barFillCat1');
assert.ok(indexHtml.includes('id="barFillCat2"'), 'index.html mesti mempunyai elemen barFillCat2');
assert.ok(indexHtml.includes('id="barFillCat3"'), 'index.html mesti mempunyai elemen barFillCat3');
assert.ok(!indexHtml.includes('pdf-service.js'), 'index.html TIDAK BOLEH memuatkan fail pdf-service.js');
assert.ok(!indexHtml.includes('jspdf'), 'index.html TIDAK BOLEH memuatkan jspdf');
console.log('✓ Ujian 6 Lulus: Integriti docs/index.html (Soalan 3 Kategori & Modal Graf) disahkan');

// 7. Uji Integriti Antaramuka docs/status.html
const statusHtml = fs.readFileSync(path.join(__dirname, '../docs/status.html'), 'utf8');
assert.ok(statusHtml.includes('id="statusTotalScore"'), 'status.html mesti memaparkan statusTotalScore');
assert.ok(statusHtml.includes('id="statusBarFillCat1"'), 'status.html mesti mempunyai statusBarFillCat1');
assert.ok(statusHtml.includes('id="statusBarFillCat2"'), 'status.html mesti mempunyai statusBarFillCat2');
assert.ok(statusHtml.includes('id="statusBarFillCat3"'), 'status.html mesti mempunyai statusBarFillCat3');
assert.ok(!statusHtml.includes('pdf-service.js'), 'status.html TIDAK BOLEH memuatkan pdf-service.js');
console.log('✓ Ujian 7 Lulus: Integriti docs/status.html (Graf Keputusan Validasi) disahkan');

// 8. Uji Integriti Antaramuka docs/admin_review.html
const adminHtml = fs.readFileSync(path.join(__dirname, '../docs/admin_review.html'), 'utf8');
assert.ok(adminHtml.includes('Skor Validasi (3 Kategori)'), 'admin_review.html mesti mempunyai tajuk kolum Skor');
assert.ok(adminHtml.includes('id="rev_ratingBadge"'), 'admin_review.html mesti mempunyai lencana skor rev_ratingBadge');
assert.ok(adminHtml.includes('id="rev_barFill1"'), 'admin_review.html mesti mempunyai bar graf mini');
assert.ok(!adminHtml.includes('pdf-service.js'), 'admin_review.html TIDAK BOLEH memuatkan pdf-service.js');
console.log('✓ Ujian 8 Lulus: Integriti docs/admin_review.html disahkan');

// 9. Uji Integriti Fail docs/styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, '../docs/styles.css'), 'utf8');
assert.ok(stylesCss.includes('.question-category-card'), 'styles.css mesti mengandungi .question-category-card');
assert.ok(stylesCss.includes('.score-options-grid'), 'styles.css mesti mengandungi .score-options-grid');
assert.ok(stylesCss.includes('.score-btn-tile'), 'styles.css mesti mengandungi .score-btn-tile');
assert.ok(stylesCss.includes('.result-graph-card'), 'styles.css mesti mengandungi .result-graph-card');
assert.ok(stylesCss.includes('.chart-bars-wrap'), 'styles.css mesti mengandungi .chart-bars-wrap');
assert.ok(stylesCss.includes('.chart-fill'), 'styles.css mesti mengandungi .chart-fill');
console.log('✓ Ujian 9 Lulus: Integriti gaya CSS soalan & graf disahkan');

console.log('\n================================================================');
console.log('  SEMUA 9 UJIAN AUTOMASI LULUS DENGAN CEMERLANG! (100% SUKSES) ');
console.log('================================================================');
