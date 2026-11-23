/**
 * Vali-Lusia: Suite Ujian Automasi Komprehensif
 * Sistem Validasi Berperingkat (Page 1: Khidmat, Page 2: Hotel & Makanan, Page 3: Ziarah & Ulasan 500 Huruf)
 * & Enjin Graf Keputusan Multi-Dimensional
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('  MEMULAKAN SUITE UJIAN AUTOMASI VALI-LUSIA (3 PAGES & GRAF)    ');
console.log('================================================================\n');

// 1. Muat Modul ValiLusiaApp
const ValiLusiaApp = require('../docs/app.js');
assert.ok(ValiLusiaApp, 'Modul ValiLusiaApp mesti berjaya dimuatkan');
assert.strictEqual(typeof ValiLusiaApp.calculateScore, 'function', 'calculateScore mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.validateStep1, 'function', 'validateStep1 mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.validateStep2, 'function', 'validateStep2 mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.validateStep3, 'function', 'validateStep3 mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.validateInputs, 'function', 'validateInputs mesti merupakan fungsi');
assert.strictEqual(typeof ValiLusiaApp.generateValidationCode, 'function', 'generateValidationCode mesti merupakan fungsi');
console.log('✓ Ujian 1 Lulus: Modul logik ValiLusiaApp & fungsi-fungsi teras berjaya diimport');

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

// 4. Uji Pengiraan Skor Legacy (3 Kategori Sahaja - Max 6)
const scoreLegacyFull = ValiLusiaApp.calculateScore(2, 2, 2);
assert.strictEqual(scoreLegacyFull.total, 6, 'Jumlah skor penuh legacy mesti 6');
assert.strictEqual(scoreLegacyFull.maxScore, 6, 'Maksimum skor legacy mesti 6');
assert.strictEqual(scoreLegacyFull.percentage, 100, 'Peratusan legacy mesti 100%');
assert.strictEqual(scoreLegacyFull.rating, 'CEMERLANG', 'Penarafan mesti CEMERLANG');
assert.strictEqual(scoreLegacyFull.isFullSurvey, false, 'isFullSurvey mesti false untuk legacy');

const scoreLegacyLow = ValiLusiaApp.calculateScore(0, 1, 0);
assert.strictEqual(scoreLegacyLow.total, 1, 'Jumlah skor mesti 1');
assert.strictEqual(scoreLegacyLow.rating, 'PERLU TINDAKAN', 'Penarafan mesti PERLU TINDAKAN');
assert.strictEqual(scoreLegacyLow.initialStatus, 'ACTION_REQUIRED');
console.log('✓ Ujian 4 Lulus: Keserasian ke belakang bagi pengiraan legacy (3 Kategori / 6 Markah) dipelihara');

// 5. Uji Pengiraan Skor Menyeluruh (15 Soalan: 3 Pages / 30 Markah)
// Senario A: Penuh (30 / 30 = 100%)
const sampleFullData = {
  cat1: 2, cat2: 2, cat3: 2,
  hotel_room_egypt: 2, hotel_service_egypt: 2, food_egypt: 2,
  hotel_room_madinah: 2, hotel_service_madinah: 2, food_madinah: 2,
  hotel_room_mekah: 2, hotel_service_mekah: 2, food_mekah: 2,
  ziarah_egypt: 2, ziarah_madinah: 2, ziarah_mekah: 2,
  ziarahFeedback: 'Pengalaman ziarah yang sangat mengagumkan dan perkhidmatan cemerlang.'
};
const fullScoreResult = ValiLusiaApp.calculateScore(sampleFullData);
assert.strictEqual(fullScoreResult.isFullSurvey, true, 'isFullSurvey mesti true');
assert.strictEqual(fullScoreResult.total, 30, 'Jumlah skor penuh mesti 30');
assert.strictEqual(fullScoreResult.maxScore, 30, 'Maksimum skor mesti 30');
assert.strictEqual(fullScoreResult.percentage, 100, 'Peratusan penuh mesti 100%');
assert.strictEqual(fullScoreResult.rating, 'CEMERLANG', 'Rating mesti CEMERLANG');
assert.strictEqual(fullScoreResult.initialStatus, 'PENDING_REVIEW');

// Periksa Pecahan Destinasi
assert.strictEqual(fullScoreResult.destinations.egypt.score, 8, 'Egypt mesti 8/8');
assert.strictEqual(fullScoreResult.destinations.egypt.percent, 100);
assert.strictEqual(fullScoreResult.destinations.madinah.score, 8, 'Madinah mesti 8/8');
assert.strictEqual(fullScoreResult.destinations.mekah.score, 8, 'Mekah mesti 8/8');

// Periksa Pecahan Dimensi
assert.strictEqual(fullScoreResult.dimensions.service, 6, 'Khidmat mesti 6/6');
assert.strictEqual(fullScoreResult.dimensions.room, 6, 'Bilik hotel mesti 6/6');
assert.strictEqual(fullScoreResult.dimensions.hotelService, 6, 'Perkhidmatan hotel mesti 6/6');
assert.strictEqual(fullScoreResult.dimensions.food, 6, 'Makanan mesti 6/6');
assert.strictEqual(fullScoreResult.dimensions.ziarah, 6, 'Ziarah mesti 6/6');
console.log('✓ Ujian 5 Lulus: Pengiraan skor penuh (30 Markah) & pecahan destinasi/dimensi disahkan 100% tepat');

// Senario B: Sederhana (20 / 30 = 67% -> MEMUASKAN)
const sampleMidData = {
  cat1: 1, cat2: 2, cat3: 1, // 4
  hotel_room_egypt: 1, hotel_service_egypt: 1, food_egypt: 1, // 3
  hotel_room_madinah: 2, hotel_service_madinah: 2, food_madinah: 1, // 5
  hotel_room_mekah: 1, hotel_service_mekah: 1, food_mekah: 2, // 4
  ziarah_egypt: 1, ziarah_madinah: 2, ziarah_mekah: 1 // 4
};
const midScoreResult = ValiLusiaApp.calculateScore(sampleMidData);
assert.strictEqual(midScoreResult.total, 20, 'Jumlah skor mesti 20');
assert.strictEqual(midScoreResult.percentage, 67, 'Peratusan mesti 67%');
assert.strictEqual(midScoreResult.rating, 'MEMUASKAN', 'Rating mesti MEMUASKAN');
assert.strictEqual(midScoreResult.badgeClass, 'rating-good');

// Senario C: Rendah (10 / 30 = 33% -> PERLU TINDAKAN)
const sampleLowData = {
  cat1: 1, cat2: 0, cat3: 1, // 2
  hotel_room_egypt: 0, hotel_service_egypt: 0, food_egypt: 1, // 1
  hotel_room_madinah: 1, hotel_service_madinah: 1, food_madinah: 1, // 3
  hotel_room_mekah: 0, hotel_service_mekah: 1, food_mekah: 1, // 2
  ziarah_egypt: 0, ziarah_madinah: 1, ziarah_mekah: 1 // 2
};
const lowScoreResult = ValiLusiaApp.calculateScore(sampleLowData);
assert.strictEqual(lowScoreResult.total, 10, 'Jumlah skor mesti 10');
assert.strictEqual(lowScoreResult.percentage, 33, 'Peratusan mesti 33%');
assert.strictEqual(lowScoreResult.rating, 'PERLU TINDAKAN', 'Rating mesti PERLU TINDAKAN');
assert.strictEqual(lowScoreResult.badgeClass, 'rating-action');
assert.strictEqual(lowScoreResult.initialStatus, 'ACTION_REQUIRED');

// Senario D: Clamping Nilai di luar 0 - 2
const sampleClamped = {
  cat1: 10, cat2: -5, cat3: '2',
  hotel_room_egypt: 99, hotel_service_egypt: 2, food_egypt: 2,
  hotel_room_madinah: 2, hotel_service_madinah: 2, food_madinah: 2,
  hotel_room_mekah: 2, hotel_service_mekah: 2, food_mekah: 2,
  ziarah_egypt: 2, ziarah_madinah: 2, ziarah_mekah: 2
};
const clampedResult = ValiLusiaApp.calculateScore(sampleClamped);
assert.strictEqual(clampedResult.cat1, 2, 'Nilai 10 diapit kepada 2');
assert.strictEqual(clampedResult.cat2, 0, 'Nilai -5 diapit kepada 0');
assert.strictEqual(clampedResult.hotel_room_egypt, 2, 'Nilai 99 diapit kepada 2');
assert.strictEqual(clampedResult.total, 28, 'Jumlah skor clamped sah (4 + 24 = 28)');
console.log('✓ Ujian 6 Lulus: Penarafan peratusan (CEMERLANG, MEMUASKAN, PERLU TINDAKAN) dan had batas nilai diuji');

// 6. Uji Validasi Langkah 1 (Maklumat Jemaah & Khidmat)
const step1Empty = ValiLusiaApp.validateStep1('', '', null, null, null);
assert.strictEqual(step1Empty.isValid, false, 'Step 1 kosong tidak sah');
assert.ok(step1Empty.errors.fullName, 'Mesti laporkan nama wajib');
assert.ok(step1Empty.errors.phoneNumber, 'Mesti laporkan telefon wajib');
assert.ok(step1Empty.errors.cat1, 'Mesti laporkan cat1 wajib');
assert.ok(step1Empty.errors.cat2, 'Mesti laporkan cat2 wajib');
assert.ok(step1Empty.errors.cat3, 'Mesti laporkan cat3 wajib');

const step1Valid = ValiLusiaApp.validateStep1('AHMAD DANIAL BIN AZIZ', '012-3456789', '2', '2', '2');
assert.strictEqual(step1Valid.isValid, true, 'Step 1 lengkap mesti sah');
assert.strictEqual(Object.keys(step1Valid.errors).length, 0);
console.log('✓ Ujian 7 Lulus: Validasi mandatori Langkah 1 disahkan');

// 7. Uji Validasi Langkah 2 (Hotel & Makanan: Egypt, Madinah, Mekah)
const step2Incomplete = ValiLusiaApp.validateStep2({
  hotel_room_egypt: 2,
  hotel_service_egypt: null,
  food_egypt: 1
});
assert.strictEqual(step2Incomplete.isValid, false, 'Step 2 tidak lengkap mesti tidak sah');
assert.ok(step2Incomplete.errors.hotel_service_egypt, 'Mesti kesan hotel_service_egypt kosong');
assert.ok(step2Incomplete.errors.hotel_room_madinah, 'Mesti kesan soalan Madinah kosong');
assert.ok(step2Incomplete.errors.hotel_room_mekah, 'Mesti kesan soalan Mekah kosong');

const step2Valid = ValiLusiaApp.validateStep2({
  hotel_room_egypt: 2, hotel_service_egypt: 2, food_egypt: 2,
  hotel_room_madinah: 2, hotel_service_madinah: 2, food_madinah: 2,
  hotel_room_mekah: 2, hotel_service_mekah: 2, food_mekah: 2
});
assert.strictEqual(step2Valid.isValid, true, 'Step 2 lengkap 9 soalan mesti sah');
console.log('✓ Ujian 8 Lulus: Validasi 9 soalan Langkah 2 (Hotel & Makanan) disahkan');

// 8. Uji Validasi Langkah 3 & Had 500 Huruf Maklum Balas
const step3MissingZiarah = ValiLusiaApp.validateStep3({ ziarah_egypt: 2 }, 'Cadangan baik.');
assert.strictEqual(step3MissingZiarah.isValid, false);
assert.ok(step3MissingZiarah.errors.ziarah_madinah, 'Mesti kesan ziarah_madinah kosong');
assert.ok(step3MissingZiarah.errors.ziarah_mekah, 'Mesti kesan ziarah_mekah kosong');

// Uji teks melebihi 500 aksara
const longText550 = 'A'.repeat(550);
const step3OverLimit = ValiLusiaApp.validateStep3({ ziarah_egypt: 2, ziarah_madinah: 2, ziarah_mekah: 2 }, longText550);
assert.strictEqual(step3OverLimit.isValid, false, 'Ulasan >500 aksara mesti ditolak');
assert.ok(step3OverLimit.errors.ziarahFeedback, 'Mesti laporkan ralat had 500 huruf');

// Uji teks tepat 500 aksara
const exactText500 = 'B'.repeat(500);
const step3Exact500 = ValiLusiaApp.validateStep3({ ziarah_egypt: 2, ziarah_madinah: 2, ziarah_mekah: 2 }, exactText500);
assert.strictEqual(step3Exact500.isValid, true, 'Ulasan tepat 500 aksara mesti sah');

// Uji pemotongan string dalam calculateScore
const feedbackCut = ValiLusiaApp.calculateScore({
  ...sampleFullData,
  ziarahFeedback: 'C'.repeat(600)
});
assert.strictEqual(feedbackCut.ziarahFeedback.length, 500, 'Teks mesti dipotong secara automatik kepada maksima 500 huruf');
console.log('✓ Ujian 9 Lulus: Validasi Langkah 3 & kawalan ketat had maksimum 500 huruf berjaya disahkan');

// 9. Uji Integriti DOM docs/index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');

// Stepper
assert.ok(indexHtml.includes('id="stepperStep1"'), 'index.html mesti mempunyai stepperStep1');
assert.ok(indexHtml.includes('id="stepperStep2"'), 'index.html mesti mempunyai stepperStep2');
assert.ok(indexHtml.includes('id="stepperStep3"'), 'index.html mesti mempunyai stepperStep3');
assert.ok(indexHtml.includes('id="stepperProgressBar"'), 'index.html mesti mempunyai stepperProgressBar');

// Pages
assert.ok(indexHtml.includes('id="stepPage1"'), 'index.html mesti mempunyai stepPage1');
assert.ok(indexHtml.includes('id="stepPage2"'), 'index.html mesti mempunyai stepPage2');
assert.ok(indexHtml.includes('id="stepPage3"'), 'index.html mesti mempunyai stepPage3');

// Page 1 Elements
assert.ok(indexHtml.includes('id="fullName"'), 'index.html mesti mempunyai fullName');
assert.ok(indexHtml.includes('id="phoneNumber"'), 'index.html mesti mempunyai phoneNumber');
assert.ok(indexHtml.includes('name="cat1"'), 'index.html mesti mempunyai name="cat1"');
assert.ok(indexHtml.includes('name="cat2"'), 'index.html mesti mempunyai name="cat2"');
assert.ok(indexHtml.includes('name="cat3"'), 'index.html mesti mempunyai name="cat3"');
assert.ok(indexHtml.includes('id="btnNextStep1"'), 'index.html mesti mempunyai btnNextStep1');

// Page 2 Elements
assert.ok(indexHtml.includes('name="hotel_room_egypt"'), 'index.html mesti mempunyai hotel_room_egypt');
assert.ok(indexHtml.includes('name="hotel_service_egypt"'), 'index.html mesti mempunyai hotel_service_egypt');
assert.ok(indexHtml.includes('name="food_egypt"'), 'index.html mesti mempunyai food_egypt');
assert.ok(indexHtml.includes('name="hotel_room_madinah"'), 'index.html mesti mempunyai hotel_room_madinah');
assert.ok(indexHtml.includes('name="hotel_service_madinah"'), 'index.html mesti mempunyai hotel_service_madinah');
assert.ok(indexHtml.includes('name="food_madinah"'), 'index.html mesti mempunyai food_madinah');
assert.ok(indexHtml.includes('name="hotel_room_mekah"'), 'index.html mesti mempunyai hotel_room_mekah');
assert.ok(indexHtml.includes('name="hotel_service_mekah"'), 'index.html mesti mempunyai hotel_service_mekah');
assert.ok(indexHtml.includes('name="food_mekah"'), 'index.html mesti mempunyai food_mekah');
assert.ok(indexHtml.includes('id="btnPrevStep2"'), 'index.html mesti mempunyai btnPrevStep2');
assert.ok(indexHtml.includes('id="btnNextStep2"'), 'index.html mesti mempunyai btnNextStep2');

// Page 3 Elements
assert.ok(indexHtml.includes('name="ziarah_egypt"'), 'index.html mesti mempunyai ziarah_egypt');
assert.ok(indexHtml.includes('name="ziarah_madinah"'), 'index.html mesti mempunyai ziarah_madinah');
assert.ok(indexHtml.includes('name="ziarah_mekah"'), 'index.html mesti mempunyai ziarah_mekah');
assert.ok(indexHtml.includes('id="ziarahFeedback"'), 'index.html mesti mempunyai ziarahFeedback');
assert.ok(indexHtml.includes('maxlength="500"'), 'index.html mesti menguatkuasakan maxlength="500"');
assert.ok(indexHtml.includes('id="charCount"'), 'index.html mesti mempunyai kaunter huruf charCount');
assert.ok(indexHtml.includes('id="btnPrevStep3"'), 'index.html mesti mempunyai btnPrevStep3');
assert.ok(indexHtml.includes('id="btnSubmitForm"'), 'index.html mesti mempunyai btnSubmitForm');

// Modal Elements
assert.ok(indexHtml.includes('id="resultGraphModal"'), 'index.html mesti mempunyai resultGraphModal');
assert.ok(indexHtml.includes('id="resDestScoreEgypt"'), 'index.html mesti mempunyai resDestScoreEgypt');
assert.ok(indexHtml.includes('id="resDestScoreMadinah"'), 'index.html mesti mempunyai resDestScoreMadinah');
assert.ok(indexHtml.includes('id="resDestScoreMekah"'), 'index.html mesti mempunyai resDestScoreMekah');
assert.ok(indexHtml.includes('id="resFeedbackWrap"'), 'index.html mesti mempunyai resFeedbackWrap');
assert.ok(!indexHtml.includes('pdf-service.js'), 'Bebas bloat: index.html tidak boleh ada pdf-service');
console.log('✓ Ujian 10 Lulus: Integriti struktur DOM docs/index.html (3 Halaman & Modal Graf) disahkan');

// 10. Uji Integriti DOM docs/status.html
const statusHtml = fs.readFileSync(path.join(__dirname, '../docs/status.html'), 'utf8');
assert.ok(statusHtml.includes('id="statusTotalScore"'), 'status.html mesti mempunyai statusTotalScore');
assert.ok(statusHtml.includes('id="statusDestComparison"'), 'status.html mesti mempunyai statusDestComparison');
assert.ok(statusHtml.includes('id="statusDestEgypt"'), 'status.html mesti mempunyai statusDestEgypt');
assert.ok(statusHtml.includes('id="statusDestMadinah"'), 'status.html mesti mempunyai statusDestMadinah');
assert.ok(statusHtml.includes('id="statusDestMekah"'), 'status.html mesti mempunyai statusDestMekah');
assert.ok(statusHtml.includes('id="statusFeedbackCard"'), 'status.html mesti mempunyai statusFeedbackCard');
console.log('✓ Ujian 11 Lulus: Integriti docs/status.html (Graf Destinasi & Maklum Balas Ziarah) disahkan');

// 11. Uji Integriti DOM docs/admin_review.html
const adminHtml = fs.readFileSync(path.join(__dirname, '../docs/admin_review.html'), 'utf8');
assert.ok(adminHtml.includes('Skor Validasi (Menyeluruh)'), 'admin_review.html mesti mempunyai kolum skor menyeluruh');
assert.ok(adminHtml.includes('id="rev_destComparison"'), 'admin_review.html mesti mempunyai rev_destComparison');
assert.ok(adminHtml.includes('id="rev_destEgypt"'), 'admin_review.html mesti mempunyai rev_destEgypt');
assert.ok(adminHtml.includes('id="rev_destMadinah"'), 'admin_review.html mesti mempunyai rev_destMadinah');
assert.ok(adminHtml.includes('id="rev_destMekah"'), 'admin_review.html mesti mempunyai rev_destMekah');
assert.ok(adminHtml.includes('id="rev_feedbackWrap"'), 'admin_review.html mesti mempunyai rev_feedbackWrap');
console.log('✓ Ujian 12 Lulus: Integriti docs/admin_review.html disahkan');

// 12. Uji Integriti docs/styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, '../docs/styles.css'), 'utf8');
assert.ok(stylesCss.includes('.step-page'), 'styles.css mesti ada .step-page');
assert.ok(stylesCss.includes('.step-page.active'), 'styles.css mesti ada .step-page.active');
assert.ok(stylesCss.includes('.dest-card-group'), 'styles.css mesti ada .dest-card-group');
assert.ok(stylesCss.includes('.dest-comparison-section'), 'styles.css mesti ada .dest-comparison-section');
assert.ok(stylesCss.includes('.textarea-feedback'), 'styles.css mesti ada .textarea-feedback');
assert.ok(stylesCss.includes('.char-counter-bar'), 'styles.css mesti ada .char-counter-bar');
assert.ok(stylesCss.includes('.feedback-quote-card'), 'styles.css mesti ada .feedback-quote-card');
console.log('✓ Ujian 13 Lulus: Integriti gaya CSS bagi 3 Halaman, Destinasi & Kaunter Huruf disahkan');

// 13. Uji Integriti Seni Bina Tatalan Modal Mudah Alih (Mobile Modal Smooth Scroll Architecture)
assert.ok(stylesCss.includes('body.modal-open'), 'styles.css mesti ada body.modal-open untuk kunci tatalan latar belakang');
assert.ok(stylesCss.includes('overflow-y: auto'), 'styles.css mesti ada overflow-y: auto untuk modal scroll');
assert.ok(stylesCss.includes('-webkit-overflow-scrolling: touch'), 'styles.css mesti ada sokongan leretan sentuh iOS');
assert.ok(stylesCss.includes('max-height: calc(100vh - 2rem)'), 'styles.css mesti ada had ketinggian fleksibel pada modal-dialog');
assert.ok(stylesCss.includes('max-height: calc(100dvh - 2rem)'), 'styles.css mesti ada sokongan Dynamic Viewport Height (100dvh)');
assert.ok(stylesCss.includes('.modal-close-btn'), 'styles.css mesti ada butang tutup modal header .modal-close-btn');
console.log('✓ Ujian 14 Lulus: Seni bina CSS tatalan modal mudah alih (Mobile Smooth Scroll) disahkan 100%');

// 14. Uji Integrasi Butang Tutup Pantas & Pengendali Scroll dalam index.html & app.js
assert.ok(indexHtml.includes('id="btnDismissModal"'), 'index.html mesti mengandungi butang btnDismissModal');
const appJs = fs.readFileSync(path.join(__dirname, '../docs/app.js'), 'utf8');
assert.ok(appJs.includes("document.body.classList.add('modal-open')"), 'app.js mesti menambah modal-open bila buka modal');
assert.ok(appJs.includes("document.body.classList.remove('modal-open')"), 'app.js mesti membuang modal-open bila tutup modal');
assert.ok(appJs.includes('modalBody.scrollTop = 0'), 'app.js mesti reset tatalan ke atas bila buka modal');
assert.ok(appJs.includes('btnDismissModal'), 'app.js mesti mengendalikan btnDismissModal');
console.log('✓ Ujian 15 Lulus: Pengendali logik JavaScript bagi penguncian tatalan & navigasi modal disahkan');

// 15. Uji Pengendali Modal di admin_review.html
const adminReviewJs = fs.readFileSync(path.join(__dirname, '../docs/admin_review.html'), 'utf8');
assert.ok(adminReviewJs.includes("document.body.classList.add('modal-open')"), 'admin_review.html mesti menambah modal-open');
assert.ok(adminReviewJs.includes("document.body.classList.remove('modal-open')"), 'admin_review.html mesti membuang modal-open');
assert.ok(adminReviewJs.includes('revBody.scrollTop = 0'), 'admin_review.html mesti reset tatalan');
console.log('✓ Ujian 16 Lulus: Pengendali modal semakan admin disahkan');

console.log('\n================================================================');
console.log('  SEMUA 16 UJIAN AUTOMASI LULUS DENGAN CEMERLANG! (100% SUKSES) ');
console.log('================================================================');
