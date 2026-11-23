/**
 * Vali-Lusia: Ujian Automasi Penuh Penjanaan & Integrasi PDF
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- MEMULAKAN UJIAN AUTOMASI SISTEM VALI-LUSIA PDF ---');

// 1. Uji Muat Modul PDF Service
const PdfService = require('../docs/pdf-service.js');
assert.ok(PdfService, 'PdfService mesti berjaya dimuatkan');
assert.strictEqual(typeof PdfService.createValidationDocument, 'function', 'createValidationDocument mesti fungsi');
assert.strictEqual(typeof PdfService.downloadPdf, 'function', 'downloadPdf mesti fungsi');
console.log('✓ Ujian 1 Lulus: PdfService berjaya dimuatkan');

// 2. Uji Penjanaan PDF Slip Pantas (Nama & Telefon)
const quickData = {
  code: 'VAL-112233',
  fullName: 'USTAZ AHMAD FAHMI BIN KAMARUL',
  phone: '012-9876543',
  isFullForm: false,
  status: 'PENDING_REVIEW',
  submittedAt: '24/11/2026, 04:30 PM'
};

const docQuick = PdfService.createValidationDocument(quickData);
const rawQuickPdf = docQuick.output();
assert.ok(rawQuickPdf.startsWith('%PDF-'), 'Output mesti mempunyai tandatangan %PDF-');
assert.ok(rawQuickPdf.length > 2000, 'Saiz PDF mesti mencukupi');
assert.ok(rawQuickPdf.length < 80000, 'Saiz PDF mestilah padat (<80KB)');
console.log(`✓ Ujian 2 Lulus: PDF Slip Pantas dijana dengan jayanya (${rawQuickPdf.length} bait)`);

// 3. Uji Penjanaan PDF Borang Penuh 5 Langkah (Pasport, Pakej, MyKad)
const fullData = {
  code: 'VAL-882194',
  fullName: 'AHMAD DANIAL BIN ABDUL AZIZ',
  icNumber: '920815-10-6188',
  phone: '012-3456789',
  email: 'danial@example.com',
  gender: 'LELAKI',
  birthDate: '1992-08-15',
  emergencyName: 'NORAINI BINTI KASSIM',
  emergencyPhone: '019-8765432',
  emergencyRel: 'Pasangan (Suami/Isteri)',
  bookingRef: 'AND-2026-8801',
  packageId: '1',
  packageName: 'Pakej Umrah Cuti Sekolah Disember 2026 (12H 10M) - RM 8,890',
  departureDate: '2026-12-18',
  branchName: 'Ibu Pejabat Desa Pandan, KL',
  roomType: 'Bilik Berempat (Quad)',
  specialNeeds: 'Kerusi roda untuk tawaf',
  passportNumber: 'A52918234',
  passportExpiry: '2027-08-30',
  passportValid: true,
  docPassport: 'salinan_pasport_ahmad.pdf',
  docReceipt: 'resit_deposit_rm1000.pdf',
  status: 'VERIFIED',
  submittedAt: '24/11/2026, 04:35 PM'
};

const docFull = PdfService.createValidationDocument(fullData);
const rawFullPdf = docFull.output();
assert.ok(rawFullPdf.startsWith('%PDF-'), 'Output penuh mesti format PDF');
assert.ok(rawFullPdf.length > 3000, 'PDF Penuh mesti mengandungi kandungan');
assert.ok(rawFullPdf.length < 90000, 'PDF Penuh mestilah padat (<90KB)');
console.log(`✓ Ujian 3 Lulus: PDF Borang Validasi Penuh dijana dengan jayanya (${rawFullPdf.length} bait)`);

// 4. Semak Integriti Fail docs/index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');
assert.ok(indexHtml.includes('id="btnViewPdfModal"'), 'index.html mesti mempunyai butang btnViewPdfModal');
assert.ok(indexHtml.includes('id="btnDownloadPdf"'), 'index.html mesti mempunyai butang btnDownloadPdf');
assert.ok(indexHtml.includes('id="pdfReaderModal"'), 'index.html mesti mempunyai modal pdfReaderModal');
assert.ok(indexHtml.includes('id="pdfReaderIframe"'), 'index.html mesti mempunyai iframe pdfReaderIframe');
assert.ok(indexHtml.includes('src="vendor/jspdf.umd.min.js"'), 'index.html mesti memuatkan jsPDF');
assert.ok(indexHtml.includes('src="pdf-service.js"'), 'index.html mesti memuatkan pdf-service.js');
console.log('✓ Ujian 4 Lulus: Integriti docs/index.html disahkan');

// 5. Semak Integriti Fail docs/status.html
const statusHtml = fs.readFileSync(path.join(__dirname, '../docs/status.html'), 'utf8');
assert.ok(statusHtml.includes('id="btnStatusViewPdf"'), 'status.html mesti mempunyai butang btnStatusViewPdf');
assert.ok(statusHtml.includes('id="btnStatusDownloadPdf"'), 'status.html mesti mempunyai butang btnStatusDownloadPdf');
assert.ok(statusHtml.includes('id="pdfReaderModal"'), 'status.html mesti mempunyai modal pdfReaderModal');
assert.ok(statusHtml.includes('src="vendor/jspdf.umd.min.js"'), 'status.html mesti memuatkan jsPDF');
assert.ok(statusHtml.includes('src="pdf-service.js"'), 'status.html mesti memuatkan pdf-service.js');
console.log('✓ Ujian 5 Lulus: Integriti docs/status.html disahkan');

// 6. Semak Integriti Fail docs/admin_review.html
const adminHtml = fs.readFileSync(path.join(__dirname, '../docs/admin_review.html'), 'utf8');
assert.ok(adminHtml.includes('id="btnAdminViewPdf"'), 'admin_review.html mesti mempunyai butang btnAdminViewPdf');
assert.ok(adminHtml.includes('id="pdfReaderModal"'), 'admin_review.html mesti mempunyai modal pdfReaderModal');
assert.ok(adminHtml.includes('src="vendor/jspdf.umd.min.js"'), 'admin_review.html mesti memuatkan jsPDF');
assert.ok(adminHtml.includes('src="pdf-service.js"'), 'admin_review.html mesti memuatkan pdf-service.js');
console.log('✓ Ujian 6 Lulus: Integriti docs/admin_review.html disahkan');

// 7. Semak Integriti Fail docs/styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, '../docs/styles.css'), 'utf8');
assert.ok(stylesCss.includes('.modal-dialog-pdf'), 'styles.css mesti mempunyai kelas .modal-dialog-pdf');
assert.ok(stylesCss.includes('.pdf-viewer-iframe'), 'styles.css mesti mempunyai kelas .pdf-viewer-iframe');
assert.ok(stylesCss.includes('.pdf-modal-header'), 'styles.css mesti mempunyai kelas .pdf-modal-header');
console.log('✓ Ujian 7 Lulus: Integriti CSS disahkan');

console.log('----------------------------------------------------');
console.log('SEMUA 7 UJIAN AUTOMASI LULUS DENGAN CEMERLANG! (100%)');
console.log('----------------------------------------------------');
