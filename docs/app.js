/**
 * Vali-Lusia: Logik Frontend, Penilaian 3 Kategori & Enjin Graf Keputusan
 * Andalusia Travel & Tours Sdn Bhd
 */

// Objek Modul Utama
const ValiLusiaApp = {
  // Format Nombor Telefon Malaysia
  formatPhone(input) {
    let raw = (input || '').replace(/[^\d+]/g, '');
    if (raw.startsWith('01') && !raw.includes('+')) {
      let digits = raw.replace(/\D/g, '');
      if (digits.length > 3 && digits.length <= 7) {
        return `${digits.substring(0, 3)}-${digits.substring(3)}`;
      } else if (digits.length > 7) {
        return `${digits.substring(0, 3)}-${digits.substring(3, 7)}${digits.substring(7, 11)}`;
      }
      return digits;
    }
    return raw;
  },

  // Jana Kod Rujukan Unik (VAL-######)
  generateValidationCode() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `VAL-${randomNum}`;
  },

  // Logik Pengiraan Skor & Penarafan 3 Kategori
  calculateScore(cat1, cat2, cat3) {
    const s1 = parseInt(cat1, 10) || 0;
    const s2 = parseInt(cat2, 10) || 0;
    const s3 = parseInt(cat3, 10) || 0;
    
    // Pastikan nilai dalam julat 0 hingga 2
    const c1 = Math.max(0, Math.min(2, s1));
    const c2 = Math.max(0, Math.min(2, s2));
    const c3 = Math.max(0, Math.min(2, s3));

    const total = c1 + c2 + c3;
    const maxScore = 6;
    const percentage = Math.round((total / maxScore) * 100);

    let rating = 'MEMUASKAN';
    let badgeClass = 'rating-good';
    let subtext = 'Tahap Kepuasan Sederhana (Baik)';
    let insight = 'Terima kasih atas penilaian anda. Sistem merekodkan tahap kepuasan yang baik. Pegawai operasi Andalusia akan menghubungi anda untuk menyelaraskan urusan pakej dan dokumentasi.';
    let initialStatus = 'PENDING_REVIEW';

    if (total >= 5) {
      rating = 'CEMERLANG';
      badgeClass = 'rating-excellent';
      subtext = 'Tahap Kepuasan Sangat Tinggi (Sangat Positif)';
      insight = 'Tahniah! Anda memberikan maklum balas positif yang sangat tinggi. Pegawai operasi kami telah menerima pendaftaran ini dan akan menghubungi anda untuk tindakan lanjut.';
      initialStatus = 'PENDING_REVIEW';
    } else if (total <= 2) {
      rating = 'PERLU TINDAKAN';
      badgeClass = 'rating-action';
      subtext = 'Perlu Tindakan Segera Pegawai Operasi';
      insight = 'Maklum balas anda telah ditandakan untuk semakan keutamaan tinggi. Pengurus khidmat pelanggan kami akan menghubungi anda secara peribadi bagi menyelesaikan sebarang kesulitan.';
      initialStatus = 'ACTION_REQUIRED';
    }

    return {
      cat1: c1,
      cat2: c2,
      cat3: c3,
      total,
      maxScore,
      percentage,
      rating,
      badgeClass,
      subtext,
      insight,
      initialStatus
    };
  },

  // Validasi Input Frontend
  validateInputs(fullName, phone, cat1, cat2, cat3) {
    const errors = {};

    const cleanName = (fullName || '').trim();
    if (!cleanName || cleanName.length < 3) {
      errors.fullName = 'Sila masukkan nama penuh anda (sekurang-kurangnya 3 huruf).';
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 13) {
      errors.phoneNumber = 'Sila masukkan nombor telefon yang sah (contoh: 012-3456789).';
    }

    if (cat1 === null || cat1 === undefined || cat1 === '') {
      errors.cat1 = 'Sila pilih salah satu markah bagi Kategori 1.';
    }
    if (cat2 === null || cat2 === undefined || cat2 === '') {
      errors.cat2 = 'Sila pilih salah satu markah bagi Kategori 2.';
    }
    if (cat3 === null || cat3 === undefined || cat3 === '') {
      errors.cat3 = 'Sila pilih salah satu markah bagi Kategori 3.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Simpan Rekod ke LocalStorage
  saveRecord(record) {
    if (typeof localStorage === 'undefined') return record;
    try {
      const existing = JSON.parse(localStorage.getItem('vali_lusia_submissions') || '[]');
      // Letak rekod terbaru di hadapan
      const updated = [record, ...existing];
      localStorage.setItem('vali_lusia_submissions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
    return record;
  }
};

// Inisialisasi DOM Pelayar (Hanya jalan dalam browser)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('validationForm');
    if (!form) return;

    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phoneNumber');
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const cat1Error = document.getElementById('cat1Error');
    const cat2Error = document.getElementById('cat2Error');
    const cat3Error = document.getElementById('cat3Error');

    const resultModal = document.getElementById('resultGraphModal');
    const btnPrintResult = document.getElementById('btnPrintResult');
    const btnGoToStatus = document.getElementById('btnGoToStatus');
    const btnCloseResultModal = document.getElementById('btnCloseResultModal');

    let activeRecord = null;

    // Auto-uppercase Nama Penuh
    if (fullNameInput) {
      fullNameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        fullNameInput.classList.remove('is-invalid');
        if (nameError) nameError.style.display = 'none';
      });
    }

    // Format No Telefon
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = ValiLusiaApp.formatPhone(e.target.value);
        phoneInput.classList.remove('is-invalid');
        if (phoneError) phoneError.style.display = 'none';
      });
    }

    // Maklum balas visual pilihan radio kategori
    ['cat1', 'cat2', 'cat3'].forEach((name, idx) => {
      const radios = document.querySelectorAll(`input[name="${name}"]`);
      const card = document.getElementById(`cardCat${idx + 1}`);
      const err = document.getElementById(`cat${idx + 1}Error`);

      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (card) {
            card.classList.add('answered');
            card.classList.remove('has-error');
          }
          if (err) err.style.display = 'none';
        });
      });
    });

    // Pengendali Penghantaran Borang
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = (fullNameInput ? fullNameInput.value : '').trim().toUpperCase();
      const phone = (phoneInput ? phoneInput.value : '').trim();

      const cat1El = document.querySelector('input[name="cat1"]:checked');
      const cat2El = document.querySelector('input[name="cat2"]:checked');
      const cat3El = document.querySelector('input[name="cat3"]:checked');

      const cat1Val = cat1El ? cat1El.value : null;
      const cat2Val = cat2El ? cat2El.value : null;
      const cat3Val = cat3El ? cat3El.value : null;

      // Jalankan Validasi
      const validation = ValiLusiaApp.validateInputs(fullName, phone, cat1Val, cat2Val, cat3Val);

      // Reset semua paparan ralat
      if (nameError) nameError.style.display = 'none';
      if (phoneError) phoneError.style.display = 'none';
      if (cat1Error) cat1Error.style.display = 'none';
      if (cat2Error) cat2Error.style.display = 'none';
      if (cat3Error) cat3Error.style.display = 'none';

      if (!validation.isValid) {
        if (validation.errors.fullName) {
          if (fullNameInput) fullNameInput.classList.add('is-invalid');
          if (nameError) {
            nameError.textContent = validation.errors.fullName;
            nameError.style.display = 'block';
          }
        }
        if (validation.errors.phoneNumber) {
          if (phoneInput) phoneInput.classList.add('is-invalid');
          if (phoneError) {
            phoneError.textContent = validation.errors.phoneNumber;
            phoneError.style.display = 'block';
          }
        }
        if (validation.errors.cat1) {
          const card1 = document.getElementById('cardCat1');
          if (card1) card1.classList.add('has-error');
          if (cat1Error) cat1Error.style.display = 'block';
        }
        if (validation.errors.cat2) {
          const card2 = document.getElementById('cardCat2');
          if (card2) card2.classList.add('has-error');
          if (cat2Error) cat2Error.style.display = 'block';
        }
        if (validation.errors.cat3) {
          const card3 = document.getElementById('cardCat3');
          if (card3) card3.classList.add('has-error');
          if (cat3Error) cat3Error.style.display = 'block';
        }

        // Tatal ke elemen ralat pertama
        const firstErrorEl = document.querySelector('.is-invalid, .has-error');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Kira Skor & Graf
      const scoreData = ValiLusiaApp.calculateScore(cat1Val, cat2Val, cat3Val);
      const validationCode = ValiLusiaApp.generateValidationCode();
      const submittedAt = new Date().toLocaleString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const submissionRecord = {
        code: validationCode,
        fullName,
        phone,
        cat1: scoreData.cat1,
        cat2: scoreData.cat2,
        cat3: scoreData.cat3,
        totalScore: scoreData.total,
        maxScore: scoreData.maxScore,
        percentage: scoreData.percentage,
        rating: scoreData.rating,
        status: scoreData.initialStatus,
        submittedAt,
        notes: (scoreData.total <= 2 ? 'Jemaah memberikan penilaian rendah (perhatian pegawai diperlukan).' : 'Pendaftaran diterima bersama skor validasi jemaah.')
      };

      // Simpan Rekod
      ValiLusiaApp.saveRecord(submissionRecord);
      activeRecord = submissionRecord;

      // Paparkan Graf Keputusan dalam Modal
      renderResultGraphModal(submissionRecord, scoreData);
    });

    // Fungsi Render Graf Keputusan ke dalam Modal
    function renderResultGraphModal(record, scoreData) {
      if (!resultModal) return;

      document.getElementById('resApplicantName').textContent = record.fullName;
      document.getElementById('resApplicantPhone').textContent = record.phone;
      document.getElementById('resValidationCode').textContent = record.code;

      document.getElementById('resTotalScore').textContent = scoreData.total;
      document.getElementById('resPercentageTag').textContent = `${scoreData.percentage}% Skor Validasi`;

      const ratingBadge = document.getElementById('resRatingBadge');
      if (ratingBadge) {
        ratingBadge.className = `rating-badge-pill ${scoreData.badgeClass}`;
        ratingBadge.textContent = `⭐ ${scoreData.rating}`;
      }

      const ratingSubtext = document.getElementById('resRatingSubtext');
      if (ratingSubtext) ratingSubtext.textContent = scoreData.subtext;

      const insightBox = document.getElementById('resInsightBox');
      if (insightBox) insightBox.innerHTML = `<strong>Analisis Sistem:</strong> ${scoreData.insight}`;

      // Kemaskini Bar Kategori 1
      updateBarItem('1', scoreData.cat1);
      // Kemaskini Bar Kategori 2
      updateBarItem('2', scoreData.cat2);
      // Kemaskini Bar Kategori 3
      updateBarItem('3', scoreData.cat3);

      // Buka Modal
      resultModal.classList.add('active');
    }

    function updateBarItem(catIndex, score) {
      const scoreEl = document.getElementById(`barScoreCat${catIndex}`);
      const fillEl = document.getElementById(`barFillCat${catIndex}`);
      if (!scoreEl || !fillEl) return;

      let labelText = '';
      let fillClass = 'fill-emerald';
      let widthPercent = '100%';

      if (score === 2) {
        labelText = '2 / 2 (Terbaik)';
        fillClass = 'fill-emerald';
        widthPercent = '100%';
      } else if (score === 1) {
        labelText = '1 / 2 (Memuaskan)';
        fillClass = 'fill-gold';
        widthPercent = '50%';
      } else {
        labelText = '0 / 2 (Tidak Puas Hati)';
        fillClass = 'fill-danger';
        widthPercent = '6%'; // Bar tetap nampak sedikit warna amaran
      }

      scoreEl.textContent = labelText;
      scoreEl.className = `chart-item-score score-${score}`;

      fillEl.className = `chart-fill ${fillClass}`;
      // Animate width
      fillEl.style.width = '0%';
      setTimeout(() => {
        fillEl.style.width = widthPercent;
      }, 50);
    }

    // Butang Cetak Keputusan
    if (btnPrintResult) {
      btnPrintResult.addEventListener('click', () => {
        window.print();
      });
    }

    // Butang Semak di Portal Status
    if (btnGoToStatus) {
      btnGoToStatus.addEventListener('click', () => {
        if (activeRecord && activeRecord.code) {
          window.location.href = `status.html?query=${encodeURIComponent(activeRecord.code)}`;
        } else {
          window.location.href = 'status.html';
        }
      });
    }

    // Butang Tutup Modal & Reset
    if (btnCloseResultModal) {
      btnCloseResultModal.addEventListener('click', () => {
        resultModal.classList.remove('active');
        form.reset();
        document.querySelectorAll('.question-category-card').forEach(c => {
          c.classList.remove('answered', 'has-error');
        });
      });
    }
  });
}

// Sokongan Eksport Modul untuk Persekitaran Ujian Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValiLusiaApp;
}
