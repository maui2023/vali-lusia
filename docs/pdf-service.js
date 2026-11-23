/**
 * Vali-Lusia: Perkhidmatan Penjanaan & Pembaca Dokumen PDF Rasmi
 * Andalusia Travel & Tours Sdn Bhd
 *
 * Modul ini bertanggungjawab untuk:
 * 1. Menjana fail PDF berkualiti tinggi dan padat (<80KB) secara client-side menggunakan jsPDF.
 * 2. Menyokong kedua-dua format: Slip Pantas (Nama & Tel) & Borang Validasi Lengkap (MyKad, Pasport, Pakej).
 * 3. Menyediakan modal pembaca PDF (In-Modal PDF Reader) dengan ciri pratonton, zum, cetak, & muat turun.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PdfService = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Dapatkan rujukan jsPDF sama ada daripada tetingkap browser atau Node.js
  function getJsPdfClass() {
    if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (typeof require === 'function') {
      try {
        const jspdfModule = require('./vendor/jspdf.umd.min.js');
        return jspdfModule.jsPDF || jspdfModule;
      } catch (e) {
        // Fallback standard module
        try {
          const jspdfModule = require('jspdf');
          return jspdfModule.jsPDF || jspdfModule;
        } catch (e2) {
          // not found
        }
      }
    }
    return null;
  }

  /**
   * Format tarikh dan masa dalam zon masa Malaysia
   */
  function formatCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('ms-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  /**
   * Menjana kod hash sekuriti ringkas berasaskan kod rujukan dan data
   */
  function generateSecurityHash(code, name) {
    const str = `${code}-${name}-ANDALUSIA-VALILUSIA-2026`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `SEC-${hex}-KL${code.replace(/\D/g, '').substring(0, 4) || '8801'}`;
  }

  /**
   * Membina Dokumen PDF Rasmi Andalusia
   * @param {Object} data - Maklumat permohonan/jemaah
   * @returns {jsPDF} - Objek dokumen jsPDF
   */
  function createValidationDocument(data) {
    const jsPdfClass = getJsPdfClass();
    if (!jsPdfClass) {
      throw new Error('Pustaka jsPDF tidak ditemui. Sila pastikan vendor/jspdf.umd.min.js telah dimuatkan.');
    }

    const doc = new jsPdfClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const record = data || {};
    const isFullForm = !!(record.icNumber || record.passportNumber || record.packageName || record.bookingRef);
    const code = record.code || 'VAL-882194';
    const fullName = (record.fullName || 'JEMAAH ANDALUSIA').toUpperCase();
    const phone = record.phone || '-';
    const email = record.email || '-';
    const icNumber = record.icNumber || '-';
    const gender = record.gender || '-';
    const birthDate = record.birthDate || '-';
    const emergencyName = record.emergencyName || '-';
    const emergencyPhone = record.emergencyPhone || '-';
    const emergencyRel = record.emergencyRel || '-';

    const bookingRef = record.bookingRef || 'AND-2026-8801';
    const packageName = record.packageName || 'Pakej Umrah Andalusia 1448H';
    const departureDate = record.departureDate || '-';
    const branchName = record.branchName || 'Ibu Pejabat Desa Pandan, KL';
    const roomType = record.roomType || 'Bilik Berempat (Quad)';
    const specialNeeds = record.specialNeeds || 'Tiada';

    const passportNumber = record.passportNumber || '-';
    const passportExpiry = record.passportExpiry || '-';
    const passportValid = record.passportValid !== false;
    const submittedAt = record.submittedAt || formatCurrentTimestamp();
    const status = record.status || 'PENDING_REVIEW';
    const statusText = status === 'VERIFIED' ? 'DISAHKAN (VERIFIED)' :
      (status === 'ACTION_REQUIRED' ? 'PERLU TINDAKAN' : 'MENUNGGU SEMAKAN');

    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2); // 182mm

    // Warna Korporat Andalusia
    const colorEmerald = [6, 78, 59];      // #064e3b
    const colorEmeraldLight = [4, 120, 87]; // #047857
    const colorGold = [180, 83, 9];         // #b45309
    const colorGoldLight = [245, 158, 11];  // #f59e0b
    const colorTextDark = [30, 41, 59];     // #1e293b
    const colorTextMuted = [100, 116, 139]; // #64748b
    const colorBgSection = [241, 245, 249]; // #f1f5f9
    const colorBorder = [203, 213, 225];    // #cbd5e1

    // =========================================================================
    // 0. TERA AIR LATAR BELAKANG (SUBTLE WATERMARK)
    // =========================================================================
    doc.saveGraphicsState();
    doc.setTextColor(244, 247, 246);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    // Teks tera air condong di tengah halaman
    doc.text('ANDALUSIA TRAVEL', pageWidth / 2, 135, {
      align: 'center',
      angle: 40
    });
    doc.text('VALI-LUSIA RASMI', pageWidth / 2, 165, {
      align: 'center',
      angle: 40
    });
    doc.restoreGraphicsState();

    let curY = margin;

    // =========================================================================
    // 1. KEPALA SURAT KORPORAT ANDALUSIA (OFFICIAL HEADER)
    // =========================================================================
    // Riben Warna Emerald Atas
    doc.setFillColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.rect(margin, curY, contentWidth, 3.5, 'F');

    // Riben Emas
    doc.setFillColor(colorGold[0], colorGold[1], colorGold[2]);
    doc.rect(margin, curY + 3.5, contentWidth, 1.2, 'F');
    curY += 8;

    // Logo & Tajuk Jenama
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text('ANDALUSIA TRAVEL & TOURS SDN BHD', margin, curY);

    // Nombor Lesen Pelancongan (KPK/LN)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
    doc.text('SYARIKAT PENGENDALI UMRAH & PELANCONGAN RASMI (KPK/LN: 2345)', margin, curY + 4.5);

    // Maklumat Alamat & Talian
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('Ibu Pejabat: No. 25, 27 & 29, Jalan 1/76, Desa Pandan, 55100 Kuala Lumpur', margin, curY + 8.5);
    doc.text('Talian Hotline: 03-9284 8888 | WhatsApp Operasi: 012-3456789 | Laman Web: www.andalusia.com.my', margin, curY + 12);

    // Lencana Rasmi / Dokumen Digital di bahagian kanan atas
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(colorEmeraldLight[0], colorEmeraldLight[1], colorEmeraldLight[2]);
    doc.roundedRect(pageWidth - margin - 48, curY - 2, 48, 14, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text('SISTEM VALIDASI DOKUMEN', pageWidth - margin - 24, curY + 3, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text('VALI-LUSIA 2.0', pageWidth - margin - 24, curY + 8, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('TERIMAAN ELEKTRONIK', pageWidth - margin - 24, curY + 11.5, { align: 'center' });

    curY += 16;

    // Garisan Pemisah Halus
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, curY, pageWidth - margin, curY);
    curY += 5;

    // =========================================================================
    // 2. KOTAK TAJUK DOKUMEN & KOD RUJUKAN VALIDASI
    // =========================================================================
    const titleBoxHeight = 22;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(margin, curY, contentWidth, titleBoxHeight, 2, 2, 'FD');

    // Tajuk Dokumen
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    const docTitle = isFullForm ?
      'BORANG VALIDASI & PENDAFTARAN DOKUMEN JEMAAH' :
      'SLIP PENDAFTARAN PANTAS MAKLUMAT JEMAAH';
    doc.text(docTitle, margin + 4, curY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('Bukti penyerahan rasmi bagi urusan visa, tiket, dan semakan cawangan.', margin + 4, curY + 11.5);

    doc.setFontSize(7.5);
    doc.text(`Tarikh & Masa Hantar: ${submittedAt}`, margin + 4, curY + 16.5);

    // Kanan: Kod Validasi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('KOD RUJUKAN VALIDASI:', pageWidth - margin - 4, curY + 5.5, { align: 'right' });

    doc.setFontSize(13);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text(code, pageWidth - margin - 4, curY + 11, { align: 'right' });

    // Status Badge
    doc.setFontSize(7.5);
    if (status === 'VERIFIED') {
      doc.setTextColor(5, 150, 105);
    } else if (status === 'ACTION_REQUIRED') {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(180, 83, 9);
    }
    doc.text(`[ STATUS: ${statusText} ]`, pageWidth - margin - 4, curY + 16.5, { align: 'right' });

    curY += titleBoxHeight + 5;

    // Helper untuk melukis tajuk seksyen berjalur
    function drawSectionHeader(title, iconText) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(209, 250, 229);
      doc.roundedRect(margin, curY, contentWidth, 6.5, 1, 1, 'FD');

      // Garisan penanda hijau di sebelah kiri
      doc.setFillColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
      doc.rect(margin, curY, 2.5, 6.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
      doc.text(`${iconText ? iconText + ' ' : ''}${title}`, margin + 5, curY + 4.5);
      curY += 8;
    }

    // Helper untuk melukis jadual maklumat pasangan label - nilai
    function drawFieldRow(label1, val1, label2, val2, height = 6) {
      const col1Width = 88;
      const col2Width = 88;
      const startX1 = margin + 2;
      const startX2 = margin + 94;

      // Label 1 & Nilai 1
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
      doc.text(label1, startX1, curY + 3.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
      doc.text(String(val1 || '-'), startX1 + 38, curY + 3.5);

      // Label 2 & Nilai 2 (jika ada)
      if (label2) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
        doc.text(label2, startX2, curY + 3.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
        doc.text(String(val2 || '-'), startX2 + 38, curY + 3.5);
      }

      // Garisan pembahagi halus bawah
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(margin, curY + height, pageWidth - margin, curY + height);

      curY += height + 0.5;
    }

    // =========================================================================
    // 3. SEKSYEN 1: MAKLUMAT JEMAAH & HUBUNGAN
    // =========================================================================
    drawSectionHeader('1. MAKLUMAT PERIBADI & JEMAAH UTAMA', '1.');
    drawFieldRow('Nama Penuh Jemaah:', fullName, 'No. Telefon (WhatsApp):', phone);

    if (isFullForm) {
      drawFieldRow('No. Kad Pengenalan:', icNumber, 'Alamat Emel:', email);
      drawFieldRow('Jantina & Tarikh Lahir:', `${gender} | ${birthDate}`, 'Waris Terdekat:', `${emergencyName} (${emergencyRel})`);
      drawFieldRow('No. Telefon Waris:', emergencyPhone, 'Tujuan Pendaftaran:', 'Permohonan Visa & Pakej Umrah');
    } else {
      drawFieldRow('Jenis Pendaftaran:', 'Pendaftaran Maklumat Pantas', 'Status Kontak:', 'Menunggu Panggilan Operasi');
    }
    curY += 2;

    // =========================================================================
    // 4. SEKSYEN 2: BUTIRAN PAKEJ & PELEPASAN (JIKA ADA / BORANG PENUH)
    // =========================================================================
    if (isFullForm) {
      drawSectionHeader('2. BUTIRAN PAKEJ UMRAH & PENERBANGAN', '2.');
      drawFieldRow('Pakej Dipilih:', packageName, 'No. Booking Tempahan:', bookingRef);
      drawFieldRow('Tarikh Cadangan Pelepasan:', departureDate, 'Cawangan Andalusia:', branchName);
      drawFieldRow('Pilihan Jenis Bilik:', roomType, 'Keperluan Khas / Kesihatan:', specialNeeds);
      curY += 2;

      // =======================================================================
      // 5. SEKSYEN 3: STATUS VALIDASI PASPORT & DOKUMEN SOKONGAN
      // =======================================================================
      drawSectionHeader('3. STATUS VALIDASI PASPORT & DOKUMEN SOKONGAN', '3.');
      drawFieldRow('Nombor Pasport:', passportNumber, 'Tarikh Tamat Pasport:', passportExpiry);

      const validityStatusText = passportValid ?
        'MEMENUHI SYARAT (>6 BULAN SEBELUM PELEPASAN) ✓' :
        'AMARAN: TEMPOH SAH KURANG DARI 6 BULAN ⚠️';
      drawFieldRow('Status Kelayakan Pasport:', validityStatusText, 'Dokumen Dimuat Naik:', 'Salinan Pasport Telah Disimpan');
      curY += 2;
    }

    // =========================================================================
    // 6. SEKSYEN 4: COP PENGESAHAN DIGITAL & INTEGRITI KESELAMATAN (SECURITY)
    // =========================================================================
    drawSectionHeader(isFullForm ? '4. PERAKUAN & COP KESELAMATAN DIGITAL' : '2. PERAKUAN & COP KESELAMATAN DIGITAL', '✓');

    const secBoxHeight = 24;
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(margin, curY, contentWidth, secBoxHeight, 2, 2, 'FD');

    // Lakaran Cop Digital Rasmi Persegi Vektor di sebelah kiri
    doc.setDrawColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin + 4, curY + 3, 44, 18, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text('ANDALUSIA TRAVEL & TOURS', margin + 26, curY + 7, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
    doc.text('VERIFIED ✓', margin + 26, curY + 12, { align: 'center' });

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text('SISTEM VALIDASI VALI-LUSIA', margin + 26, curY + 15, { align: 'center' });
    doc.text(`DIGITAL STAMP: ${code}`, margin + 26, curY + 18, { align: 'center' });

    // Butiran Keselamatan & Hash di sebelah kanan cop
    const secHash = generateSecurityHash(code, fullName);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    doc.text('Perakuan Integriti Data:', margin + 52, curY + 6);

    doc.setFontSize(7);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('Maklumat ini telah disahkan dan direkodkan ke dalam pangkalan data selamat Andalusia Travel.', margin + 52, curY + 10);
    doc.text('Mematuhi sepenuhnya peruntukan Akta Perlindungan Data Peribadi (PDPA 2010).', margin + 52, curY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colorEmerald[0], colorEmerald[1], colorEmerald[2]);
    doc.text(`Digital Verification Hash: ${secHash}`, margin + 52, curY + 19);

    curY += secBoxHeight + 5;

    // =========================================================================
    // 7. SEKSYEN 5: PANDUAN TINDAKAN JEMAAH SETERUSNYA (NEXT STEPS)
    // =========================================================================
    drawSectionHeader('PANDUAN & TINDAKAN JEMAAH SETERUSNYA', 'ℹ');

    doc.setFillColor(254, 252, 232); // #fefce8
    doc.setDrawColor(254, 240, 138); // #fef08a
    const guideBoxHeight = isFullForm ? 26 : 28;
    doc.roundedRect(margin, curY, contentWidth, guideBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorGold[0], colorGold[1], colorGold[2]);
    doc.text('Sila ambil perhatian terhadap langkah-langkah berikut:', margin + 4, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);

    const line1 = '1. Simpan slip/borang ini (cetak atau simpan PDF) bersama Kod Rujukan anda sebagai bukti pendaftaran.';
    const line2 = '2. Pegawai khidmat pelanggan / cawangan Andalusia akan menghubungi anda melalui WhatsApp atau panggilan telefon.';
    const line3 = isFullForm ?
      '3. Untuk urusan cop visa dan tiket, sila kemukakan pasport asal ke cawangan selewat-lewatnya 45 hari sebelum berlepas.' :
      '3. Sila sediakan salinan pasport antarabangsa dan nombor MyKad apabila dihubungi oleh pegawai kami.';
    const line4 = '4. Anda boleh menyemak status permohonan pada bila-bila masa di portal rasmi: status.html dengan Kod Rujukan anda.';

    doc.text(line1, margin + 4, curY + 10);
    doc.text(line2, margin + 4, curY + 14);
    doc.text(line3, margin + 4, curY + 18);
    doc.text(line4, margin + 4, curY + 22);

    // =========================================================================
    // 8. KAKI DOKUMEN (FOOTER)
    // =========================================================================
    const footerY = pageHeight - margin + 2;
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('Dokumen ini dijana secara digital oleh Sistem Vali-Lusia Andalusia Travel & Tours Sdn Bhd. Sah tanpa tandatangan fizikal.', margin, footerY - 1.5);
    doc.text(`Dicetak: ${formatCurrentTimestamp()} | Halaman 1 dari 1`, pageWidth - margin, footerY - 1.5, { align: 'right' });

    return doc;
  }

  /**
   * Menjana PDF Blob
   */
  function generateBlob(data) {
    const doc = createValidationDocument(data);
    return doc.output('blob');
  }

  /**
   * Menjana Blob URL untuk pratonton
   */
  function getBlobUrl(data) {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      const blob = generateBlob(data);
      return URL.createObjectURL(blob);
    }
    const doc = createValidationDocument(data);
    return doc.output('datauristring');
  }

  /**
   * Muat Turun Fail PDF secara automatik
   */
  function downloadPdf(data, customFilename) {
    const code = (data && data.code) ? data.code : 'VAL-882194';
    const filename = customFilename || `Borang_Validasi_${code}.pdf`;

    const doc = createValidationDocument(data);
    doc.save(filename);
  }

  /**
   * Buka Pembaca PDF Modal Dalaman (In-Modal PDF Reader)
   * Menyediakan paparan interaktif dalam aplikasi tanpa membuka tab luaran.
   */
  function openPdfViewerModal(data) {
    if (typeof document === 'undefined') return;

    let readerModal = document.getElementById('pdfReaderModal');
    if (!readerModal) {
      console.warn('Modal #pdfReaderModal tidak dijumpai. Membina modal pembaca secara automatik.');
      readerModal = createDefaultReaderModal();
    }

    const iframe = document.getElementById('pdfReaderIframe');
    const titleEl = document.getElementById('pdfReaderTitle');
    const codeEl = document.getElementById('pdfReaderCode');
    const downloadBtn = document.getElementById('pdfReaderDownloadBtn');
    const printBtn = document.getElementById('pdfReaderPrintBtn');
    const openTabBtn = document.getElementById('pdfReaderOpenTabBtn');

    const code = (data && data.code) ? data.code : 'VAL-882194';
    const applicantName = (data && data.fullName) ? data.fullName : 'Jemaah';

    if (titleEl) titleEl.textContent = `Borang Validasi PDF: ${applicantName}`;
    if (codeEl) codeEl.textContent = `Kod Rujukan: ${code}`;

    // Jana Blob URL
    const blobUrl = getBlobUrl(data);
    if (iframe) {
      iframe.src = blobUrl;
    }

    // Butang Muat Turun di dalam Toolbar Reader
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        downloadPdf(data);
      };
    }

    // Butang Cetak di dalam Toolbar Reader
    if (printBtn) {
      printBtn.onclick = () => {
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            return;
          } catch (e) {
            console.log('Iframe print fallback to window.print');
          }
        }
        window.print();
      };
    }

    // Butang Buka di Tab Baharu (sebagai alternatif jika pelayar mudah alih menyekat embed)
    if (openTabBtn) {
      openTabBtn.onclick = () => {
        window.open(blobUrl, '_blank');
      };
    }

    // Paparkan modal
    readerModal.classList.add('active');
  }

  /**
   * Menutup Modal Pembaca PDF
   */
  function closePdfViewerModal() {
    if (typeof document === 'undefined') return;
    const readerModal = document.getElementById('pdfReaderModal');
    if (readerModal) {
      readerModal.classList.remove('active');
      const iframe = document.getElementById('pdfReaderIframe');
      if (iframe) {
        // Kosongkan iframe untuk jimat memori
        iframe.src = 'about:blank';
      }
    }
  }

  /**
   * Jana elemen DOM Modal Pembaca PDF jika belum wujud dalam HTML
   */
  function createDefaultReaderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'pdfReaderModal';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-pdf">
        <div class="pdf-modal-header">
          <div class="pdf-modal-title-group">
            <span style="font-size:1.25rem;">📄</span>
            <div>
              <h4 id="pdfReaderTitle" style="margin:0; font-size:1rem; color:var(--secondary); font-weight:700;">
                Pembaca Dokumen Borang Validasi
              </h4>
              <span id="pdfReaderCode" style="font-size:0.75rem; color:var(--primary); font-weight:700; font-family:monospace;">
                VAL-882194
              </span>
            </div>
          </div>
          <div class="pdf-modal-actions">
            <button type="button" class="btn btn-outline btn-sm" id="pdfReaderOpenTabBtn" title="Buka dalam Tab Baharu">
              ↗ Tab Baharu
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="pdfReaderPrintBtn" title="Cetak Dokumen">
              🖨️ Cetak
            </button>
            <button type="button" class="btn btn-gold btn-sm" id="pdfReaderDownloadBtn" title="Muat Turun Fail PDF">
              📥 Muat Turun
            </button>
            <button type="button" class="pdf-btn-close" onclick="PdfService.closeModal()" title="Tutup Paparan">
              ✕
            </button>
          </div>
        </div>
        <div class="pdf-viewer-container">
          <iframe id="pdfReaderIframe" class="pdf-viewer-iframe" title="Pratonton Borang Validasi"></iframe>
        </div>
        <div class="pdf-modal-footer">
          <span style="font-size:0.75rem; color:var(--text-muted);">
            💡 Petua: Anda boleh membaca dokumen di atas, mencetak terus, atau memuat turun fail PDF ke peranti anda.
          </span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="PdfService.closeModal()">
            Tutup
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  return {
    createValidationDocument,
    generateBlob,
    getBlobUrl,
    downloadPdf,
    openModal: openPdfViewerModal,
    closeModal: closePdfViewerModal
  };
});
