/**
 * Vali-Lusia: Ujian Integrasi Tatalan Modal Mudah Alih (Headless Chrome)
 * Mengesahkan pembaikan isu "Pages ni tak boleh scroll stuck" pada peranti telefon pintar.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const assert = require('assert');

const PORT = 9333;
const CHROME_PATH = 'google-chrome';
const USER_DATA_DIR = `/tmp/chrome-profile-scroll-test-${Date.now()}`;

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
  console.log('  MEMULAKAN UJIAN INTEGRASI PELAYAR: MOBILE MODAL SMOOTH SCROLL ');
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
    // Tunggu pelayar Chrome CDP bersedia
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

    // 1. Tetapkan Resolusi Skrin Telefon Pintar (390 x 844: iPhone 14/15)
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    console.log('✓ Resolusi skrin mudah alih ditetapkan: 390 x 844 (iPhone / Android Phone)');

    // 2. Muat Halaman index.html
    const indexPath = path.resolve(__dirname, '../docs/index.html');
    await sendCmd('Page.enable');
    await sendCmd('Page.navigate', { url: `file://${indexPath}` });
    await sleep(800);

    // 3. Isi Borang Langkah 1 ➔ Langkah 2 ➔ Langkah 3 ➔ Hantar
    const fillEval = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          try {
            // Isi Step 1
            document.getElementById('fullName').value = 'HAJI ABDUL RAHMAN BIN MAHMUD';
            document.getElementById('phoneNumber').value = '012-3456789';
            document.querySelector('input[name="cat1"][value="2"]').checked = true;
            document.querySelector('input[name="cat2"][value="2"]').checked = true;
            document.querySelector('input[name="cat3"][value="2"]').checked = true;
            document.getElementById('btnNextStep1').click();

            // Isi Step 2
            const step2Fields = [
              'hotel_room_egypt', 'hotel_service_egypt', 'food_egypt',
              'hotel_room_madinah', 'hotel_service_madinah', 'food_madinah',
              'hotel_room_mekah', 'hotel_service_mekah', 'food_mekah'
            ];
            step2Fields.forEach(f => {
              const el = document.querySelector('input[name="' + f + '"][value="2"]');
              if (el) el.checked = true;
            });
            document.getElementById('btnNextStep2').click();

            // Isi Step 3
            document.querySelector('input[name="ziarah_egypt"][value="2"]').checked = true;
            document.querySelector('input[name="ziarah_madinah"][value="2"]').checked = true;
            document.querySelector('input[name="ziarah_mekah"][value="2"]').checked = true;
            document.getElementById('ziarahFeedback').value = 'Pengalaman ziarah di Mesir, Madinah dan Mekah sangat memuaskan dan berkesan. Terima kasih Andalusia!';

            // Hantar Borang
            document.getElementById('btnSubmitForm').click();

            return { success: true };
          } catch(err) {
            return { success: false, error: err.toString() };
          }
        })()
      `,
      returnByValue: true
    });
    const fillResult = fillEval.result ? fillEval.result.value : fillEval.value;
    assert.ok(fillResult && fillResult.success, `Borang pendaftaran mesti berjaya dihantar: ${JSON.stringify(fillEval)}`);
    await sleep(400);

    // 4. Semak Modal Graf Muncul & Tatalan Berfungsi
    const modalEval = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          const modal = document.getElementById('resultGraphModal');
          const isModalActive = modal && modal.classList.contains('active');
          const isBodyLocked = document.body.classList.contains('modal-open');
          
          const modalDialog = modal.querySelector('.modal-dialog');
          const modalBody = modal.querySelector('.modal-body');
          const modalHeader = modal.querySelector('.modal-header');
          const modalFooter = modal.querySelector('.modal-footer');

          const bodyComputed = window.getComputedStyle(modalBody);
          const dialogComputed = window.getComputedStyle(modalDialog);

          const scrollHeight = modalBody.scrollHeight;
          const clientHeight = modalBody.clientHeight;

          // Uji tatalan (scroll down)
          modalBody.scrollTop = 120;
          const scrolledTop = modalBody.scrollTop;

          return {
            isModalActive,
            isBodyLocked,
            dialogMaxHeight: dialogComputed.maxHeight,
            dialogDisplay: dialogComputed.display,
            dialogFlexDirection: dialogComputed.flexDirection,
            overflowY: bodyComputed.overflowY,
            webkitOverflowScrolling: bodyComputed.webkitOverflowScrolling || '',
            scrollHeight,
            clientHeight,
            isScrollable: scrollHeight > clientHeight,
            scrolledTop
          };
        })()
      `,
      returnByValue: true
    });

    const m = modalEval.result ? modalEval.result.value : modalEval.value;
    console.log(`  - Status Modal Aktif: ${m.isModalActive}`);
    console.log(`  - Kunci Tatalan Latar Belakang (body.modal-open): ${m.isBodyLocked}`);
    console.log(`  - Modal Dialog Susun Atur: ${m.dialogDisplay} / ${m.dialogFlexDirection}`);
    console.log(`  - Modal Body Sifat Tatalan: overflow-y: ${m.overflowY}`);
    console.log(`  - Ketinggian Kandungan (scrollHeight): ${m.scrollHeight}px vs Paparan (clientHeight): ${m.clientHeight}px`);
    console.log(`  - Kandungan Boleh Ditatal (isScrollable): ${m.isScrollable}`);
    console.log(`  - Kedudukan Tatalan Semasa Digerakkan (scrollTop): ${m.scrolledTop}px`);

    assert.strictEqual(m.isModalActive, true, 'Modal keputusan mesti aktif terpapar');
    assert.strictEqual(m.isBodyLocked, true, 'Body mesti dikunci dengan modal-open');
    assert.strictEqual(m.overflowY, 'auto', 'Modal body mesti mempunyai overflow-y: auto');
    assert.strictEqual(m.isScrollable, true, 'Kandungan modal (1000px+) mesti melebihi ketinggian viewport telefon dan sedia ditatal');
    assert.ok(m.scrolledTop > 0, 'Modal mesti boleh ditatal ke bawah tanpa sekatan (stuck)');
    console.log('✓ Ujian Tatalan Skrin Mudah Alih index.html: BERJAYA LULUS 100%');

    // 5. Uji Butang Tutup Modal (btnDismissModal & pembatalan kunci scroll)
    const closeEval = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          const btnClose = document.getElementById('btnDismissModal');
          if (btnClose) btnClose.click();
          const modal = document.getElementById('resultGraphModal');
          return {
            isModalActive: modal.classList.contains('active'),
            isBodyLocked: document.body.classList.contains('modal-open')
          };
        })()
      `,
      returnByValue: true
    });
    const c = closeEval.result ? closeEval.result.value : closeEval.value;
    assert.strictEqual(c.isModalActive, false, 'Modal mesti tertutup selepas butang ✕ ditekan');
    assert.strictEqual(c.isBodyLocked, false, 'Kelas modal-open pada body mesti dibuang');
    console.log('✓ Ujian Penutupan Modal Header ✕: BERJAYA LULUS');

    // 6. Uji Modal Pegawai di admin_review.html
    const adminPath = path.resolve(__dirname, '../docs/admin_review.html');
    await sendCmd('Page.navigate', { url: `file://${adminPath}` });
    await sleep(600);

    const adminModalEval = await sendCmd('Runtime.evaluate', {
      expression: `
        (function() {
          // Buka modal semakan
          openReviewModal('VAL-882194');
          const modal = document.getElementById('reviewModal');
          const modalBody = modal.querySelector('.modal-body');
          const isModalActive = modal.classList.contains('active');
          const isBodyLocked = document.body.classList.contains('modal-open');
          const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
          
          modalBody.scrollTop = 80;
          const scrolledTop = modalBody.scrollTop;

          closeReviewModal();
          const closedModalActive = modal.classList.contains('active');
          const closedBodyLocked = document.body.classList.contains('modal-open');

          return {
            isModalActive,
            isBodyLocked,
            isScrollable,
            scrolledTop,
            closedModalActive,
            closedBodyLocked
          };
        })()
      `,
      returnByValue: true
    });
    const a = adminModalEval.result ? adminModalEval.result.value : adminModalEval.value;
    assert.strictEqual(a.isModalActive, true, 'Modal semakan admin mesti aktif');
    assert.strictEqual(a.isBodyLocked, true, 'Body mesti dikunci dengan modal-open');
    assert.strictEqual(a.isScrollable, true, 'Modal admin mesti boleh ditatal');
    assert.ok(a.scrolledTop > 0, 'Modal admin berjaya ditatal');
    assert.strictEqual(a.closedModalActive, false, 'Modal admin berjaya ditutup');
    assert.strictEqual(a.closedBodyLocked, false, 'Body kunci tatalan dibuang');
    console.log('✓ Ujian Tatalan Modal admin_review.html: BERJAYA LULUS 100%');

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
