/**
 * Ujian Integrasi Pelayar Headless Chrome bagi Admin Dashboard Live Render
 * Mengesahkan pengiraan dinamik kad statistik, carta donut SVG, taburan pakej,
 * dan penapisan carian secara langsung dalam DOM pelayar.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const assert = require('assert');

const PORT = 9334;
const CHROME_PATH = 'google-chrome';
const USER_DATA_DIR = `/tmp/chrome-profile-admin-test-${Date.now()}`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('================================================================');
  console.log('  MEMULAKAN UJIAN INTEGRASI PELAYAR: ADMIN DASHBOARD LIVE       ');
  console.log('================================================================\n');

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank'
  ]);

  let isKilled = false;
  const cleanup = () => {
    if (!isKilled) {
      isKilled = true;
      try { chromeProc.kill(); } catch (e) {}
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    let versionInfo = null;
    for (let i = 0; i < 30; i++) {
      await sleep(200);
      try {
        versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
        if (versionInfo) break;
      } catch (e) {}
    }
    assert.ok(versionInfo, 'Chrome CDP mesti sedia menerima sambungan');

    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    assert.ok(pageTarget && pageTarget.webSocketDebuggerUrl, 'Target halaman mesti ditemui');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    function sendCmd(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const adminPath = path.resolve(__dirname, '../docs/admin_review.html');
    await sendCmd('Page.enable');
    await sendCmd('Page.navigate', { url: `file://${adminPath}` });
    await sleep(800);

    // 1. Semak Nilai Dinamik Kad Statistik
    const evalCards = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          return {
            statTotal: document.getElementById('statTotal').textContent.trim(),
            statAverage: document.getElementById('statAverage').textContent.trim(),
            statVerified: document.getElementById('statVerified').textContent.trim(),
            statPending: document.getElementById('statPending').textContent.trim(),
            donutCenterPct: document.getElementById('donutCenterPct').textContent.trim(),
            npsBadge: document.getElementById('chartNpsScoreBadge').textContent.trim(),
            pkgCount: document.querySelectorAll('#packageDistributionList .pkg-item').length,
            tableRows: document.querySelectorAll('#tableBody tr').length
          };
        })()
      `,
      returnByValue: true
    });

    const c = evalCards.result ? evalCards.result.value : evalCards.value;
    console.log(`  - Jumlah Rekod Dinamik: ${c.statTotal} (jangkaan: 3)`);
    console.log(`  - Purata CSAT Dinamik: ${c.statAverage} (jangkaan: 77%)`);
    console.log(`  - Selesai Disahkan (Operasi SLA): ${c.statVerified} (jangkaan: 1)`);
    console.log(`  - Tindakan Segera (Detractor): ${c.statPending} (jangkaan: 1)`);
    console.log(`  - Pusat Carta Donut: ${c.donutCenterPct}`);
    console.log(`  - Skor NPS Net: ${c.npsBadge}`);
    console.log(`  - Bilangan Item Pakej: ${c.pkgCount}`);
    console.log(`  - Bilangan Baris Jadual: ${c.tableRows}`);

    assert.strictEqual(c.statTotal, '3', 'Jumlah rekod dinamik mesti 3');
    assert.strictEqual(c.statAverage, '77%', 'Indeks CSAT purata mesti 77%');
    assert.strictEqual(c.statVerified, '1', 'Hanya 1 rekod VERIFIED dalam seedRecords');
    assert.strictEqual(c.statPending, '1', '1 rekod ACTION_REQUIRED dalam seedRecords');
    assert.strictEqual(c.donutCenterPct, '77%', 'Pusat donut sepadan dengan CSAT 77%');
    assert.strictEqual(c.pkgCount, 3, 'Terdapat 3 pakej jemaah tersenarai');
    assert.strictEqual(c.tableRows, 3, 'Jadual mengandungi 3 baris rekod');
    console.log('✓ Ujian Nilai Dinamik Kad Statistik & Visual Analytics: BERJAYA LULUS 100%');

    // 2. Uji Penapisan Carian Jadual
    const evalFilter = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          const input = document.getElementById('filterInput');
          input.value = 'Mesir';
          input.dispatchEvent(new Event('input'));
          
          return {
            filteredRows: document.querySelectorAll('#tableBody tr').length,
            filterBadgeText: document.getElementById('tableFilterCountBadge').textContent.trim(),
            // Pastikan kad KPI utama kekal stabil (tidak merosot kepada 0 secara mengelirukan)
            statTotal: document.getElementById('statTotal').textContent.trim(),
            statAverage: document.getElementById('statAverage').textContent.trim()
          };
        })()
      `,
      returnByValue: true
    });

    const f = evalFilter.result ? evalFilter.result.value : evalFilter.value;
    console.log(`  - Baris Jadual Selepas Carian "Mesir": ${f.filteredRows}`);
    console.log(`  - Lencana Penapisan: ${f.filterBadgeText}`);
    console.log(`  - Kad KPI Stat Total: ${f.statTotal}`);

    assert.strictEqual(f.filteredRows, 1, 'Hanya 1 rekod padan dengan carian "Mesir"');
    assert.ok(f.filterBadgeText.includes('1 / 3'), 'Lencana mesti menunjukkan 1 / 3 rekod');
    assert.strictEqual(f.statTotal, '3', 'Kad statistik global kekal memaparkan jumlah keseluruhan rekod (3)');
    console.log('✓ Ujian Penapisan Carian & Kestabilan Metrik Global: BERJAYA LULUS 100%');

    ws.close();
    cleanup();

    console.log('\n================================================================');
    console.log('  SEMUA UJIAN PELAYAR HEADLESS CHROME BERJAYA DENGAN CEMERLANG! ');
    console.log('================================================================\n');
  } catch (err) {
    cleanup();
    console.error('RALAT UJIAN:', err);
    process.exit(1);
  }
}

run();
