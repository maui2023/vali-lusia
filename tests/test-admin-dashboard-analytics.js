/**
 * Vali-Lusia: Suite Ujian Automasi Papan Pemuka Admin & Visual Analytics
 * Mengesahkan pembaikan kad statistik ringkasan, carta donut SVG, taburan gred,
 * dan carta pecahan pakej jemaah tanpa kebergantungan luar.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('  MEMULAKAN SUITE UJIAN PAPAN PEMUKA ADMIN & VISUAL ANALYTICS   ');
console.log('================================================================\n');

const adminHtmlPath = path.join(__dirname, '../docs/admin_review.html');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Uji Penyingkiran Nilai Statik Palsu (Hardcoded Placeholder Slop)
assert.ok(!adminHtml.includes('<div class="stat-value" id="statTotal">128</div>'), 'statTotal tidak boleh kod keras 128');
assert.ok(!adminHtml.includes('<div class="stat-value" style="color:var(--secondary);" id="statAverage">86%</div>'), 'statAverage tidak boleh kod keras 86%');
assert.ok(!adminHtml.includes('<div class="stat-value" style="color:var(--success);" id="statVerified">114</div>'), 'statVerified tidak boleh kod keras 114');
assert.ok(!adminHtml.includes('<div class="stat-value" style="color:var(--warning);" id="statPending">14</div>'), 'statPending tidak boleh kod keras 14');
console.log('✓ Ujian 1 Lulus: Nilai statik kod keras (placeholder slop) berjaya disingkirkan');

// 2. Uji Integriti 4 Kad Ringkasan KPI & Elemen Semantik
assert.ok(adminHtml.includes('id="statTotal"'), 'Mesti ada id="statTotal"');
assert.ok(adminHtml.includes('id="statTotalProgress"'), 'Mesti ada id="statTotalProgress"');
assert.ok(adminHtml.includes('id="statTotalMeta"'), 'Mesti ada id="statTotalMeta"');

assert.ok(adminHtml.includes('id="statAverage"'), 'Mesti ada id="statAverage"');
assert.ok(adminHtml.includes('id="statCsatProgress"'), 'Mesti ada id="statCsatProgress"');
assert.ok(adminHtml.includes('id="statCsatGradeTag"'), 'Mesti ada id="statCsatGradeTag"');

assert.ok(adminHtml.includes('id="statVerified"'), 'Mesti ada id="statVerified"');
assert.ok(adminHtml.includes('id="statVerifiedProgress"'), 'Mesti ada id="statVerifiedProgress"');
assert.ok(adminHtml.includes('id="statPendingCountTag"'), 'Mesti ada id="statPendingCountTag"');

assert.ok(adminHtml.includes('id="statPending"'), 'Mesti ada id="statPending"');
assert.ok(adminHtml.includes('id="statActionProgress"'), 'Mesti ada id="statActionProgress"');
assert.ok(adminHtml.includes('id="statActionBadge"'), 'Mesti ada id="statActionBadge"');
console.log('✓ Ujian 2 Lulus: 4 Kad KPI dan penunjuk visual progress bar disahkan wujud');

// 3. Uji Kehadiran Komponen Visual Donut Chart SVG & NPS Score
assert.ok(adminHtml.includes('id="donutSegmentPromoter"'), 'Mesti ada segmen Promoter');
assert.ok(adminHtml.includes('id="donutSegmentPassive"'), 'Mesti ada segmen Passive');
assert.ok(adminHtml.includes('id="donutSegmentDetractor"'), 'Mesti ada segmen Detractor');
assert.ok(adminHtml.includes('id="donutCenterPct"'), 'Mesti ada teks tengah donutCenterPct');
assert.ok(adminHtml.includes('id="chartNpsScoreBadge"'), 'Mesti ada lencana skor NPS');
assert.ok(adminHtml.includes('id="chartSentimentBadge"'), 'Mesti ada lencana sentimen jemaah');
console.log('✓ Ujian 3 Lulus: Donut Chart SVG & lencana NPS disahkan');

// 4. Uji Kehadiran Komponen Taburan Gred & Carta Pecahan Pakej
assert.ok(adminHtml.includes('id="distExcellentCount"'), 'Mesti ada distExcellentCount');
assert.ok(adminHtml.includes('id="distGoodCount"'), 'Mesti ada distGoodCount');
assert.ok(adminHtml.includes('id="distActionCount"'), 'Mesti ada distActionCount');
assert.ok(adminHtml.includes('id="distSegExcellent"'), 'Mesti ada distSegExcellent');
assert.ok(adminHtml.includes('id="distSegGood"'), 'Mesti ada distSegGood');
assert.ok(adminHtml.includes('id="distSegAction"'), 'Mesti ada distSegAction');
assert.ok(adminHtml.includes('id="packageDistributionList"'), 'Mesti ada senarai pecahan pakej');
console.log('✓ Ujian 4 Lulus: Komponen visual taburan gred & carta pecahan pakej disahkan');

// 5. Uji Kehadiran Graf 5 Dimensi & 3 Destinasi dalam Kad Analitik
assert.ok(adminHtml.includes('id="dimScore1"'), 'Mesti ada dimScore1');
assert.ok(adminHtml.includes('id="dimScore5"'), 'Mesti ada dimScore5');
assert.ok(adminHtml.includes('id="destSummaryEgypt"'), 'Mesti ada destSummaryEgypt');
assert.ok(adminHtml.includes('id="destSummaryMadinah"'), 'Mesti ada destSummaryMadinah');
assert.ok(adminHtml.includes('id="destSummaryMekah"'), 'Mesti ada destSummaryMekah');
assert.ok(adminHtml.includes('id="tableFilterCountBadge"'), 'Mesti ada kaunter penapisan jadual');
console.log('✓ Ujian 5 Lulus: Graf 5 dimensi servis & perbandingan 3 destinasi disahkan');

// 6. Uji Logik Fungsi computeGlobalMetrics Melalui Penilaian Sintaks
assert.ok(adminHtml.includes('function computeGlobalMetrics(records)'), 'computeGlobalMetrics mesti wujud');
assert.ok(adminHtml.includes('function updateKPIStats(metrics)'), 'updateKPIStats mesti wujud');
assert.ok(adminHtml.includes('function updateDonutChart(metrics)'), 'updateDonutChart mesti wujud');
assert.ok(adminHtml.includes('function updatePackageAndGradeVisuals(metrics)'), 'updatePackageAndGradeVisuals mesti wujud');
assert.ok(adminHtml.includes('function updateDimensionVisuals(metrics)'), 'updateDimensionVisuals mesti wujud');
console.log('✓ Ujian 6 Lulus: Semua 5 fungsi pengasingan metrik dan pemaparan visual wujud dalam skrip');

console.log('\n================================================================');
console.log('  SEMUA 6 UJIAN PAPAN PEMUKA ADMIN BERJAYA DENGAN CEMERLANG!    ');
console.log('================================================================\n');
