/**
 * Vali-Lusia: Logik Frontend, Penilaian 3 Halaman & Enjin Graf Keputusan (Multi-Dimensional)
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

  // Jana Kod Rujukan Unik (CSAT-###### atau VAL-######)
  generateValidationCode(prefix = 'CSAT') {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNum}`;
  },

  // Logik Pengiraan Skor & Penarafan (Sokong 15 Soalan atau Legacy 3 Soalan)
  calculateScore(dataOrCat1, cat2, cat3) {
    let answers = {};

    // Jika dipanggil dengan format objek lengkap
    if (typeof dataOrCat1 === 'object' && dataOrCat1 !== null) {
      answers = { ...dataOrCat1 };
    } else {
      // Format positional legacy: calculateScore(cat1, cat2, cat3)
      answers = {
        cat1: dataOrCat1,
        cat2: cat2,
        cat3: cat3
      };
    }

    const parseVal = (v) => {
      const parsed = parseInt(v, 10);
      return isNaN(parsed) ? 0 : Math.max(0, Math.min(2, parsed));
    };

    // Page 1: Khidmat Andalusia
    const c1 = parseVal(answers.cat1);
    const c2 = parseVal(answers.cat2);
    const c3 = parseVal(answers.cat3);
    const dimService = c1 + c2 + c3; // Max 6

    // Semak sama ada soalan Page 2 & 3 wujud dalam input
    const hasFullSurvey = (
      answers.hotel_room_egypt !== undefined ||
      answers.hotel_room_madinah !== undefined ||
      answers.hotel_room_mekah !== undefined ||
      answers.ziarah_egypt !== undefined
    );

    if (hasFullSurvey) {
      // Page 2: Hotel & Makanan di 3 Destinasi (Egypt, Madinah, Mekah)
      const hrEgypt = parseVal(answers.hotel_room_egypt);
      const hsEgypt = parseVal(answers.hotel_service_egypt);
      const fdEgypt = parseVal(answers.food_egypt);

      const hrMadinah = parseVal(answers.hotel_room_madinah);
      const hsMadinah = parseVal(answers.hotel_service_madinah);
      const fdMadinah = parseVal(answers.food_madinah);

      const hrMekah = parseVal(answers.hotel_room_mekah);
      const hsMekah = parseVal(answers.hotel_service_mekah);
      const fdMekah = parseVal(answers.food_mekah);

      // Page 3: Tempat Ziarah di 3 Destinasi
      const zrEgypt = parseVal(answers.ziarah_egypt);
      const zrMadinah = parseVal(answers.ziarah_madinah);
      const zrMekah = parseVal(answers.ziarah_mekah);

      // Ulasan Terbuka (Max 500 Huruf)
      const feedback = (answers.ziarahFeedback || '').trim().substring(0, 500);

      // 5 Dimensi Pengalaman (Setiap satu Max 6 Markah)
      const dimRoom = hrEgypt + hrMadinah + hrMekah;           // Max 6
      const dimHotelService = hsEgypt + hsMadinah + hsMekah;   // Max 6
      const dimFood = fdEgypt + fdMadinah + fdMekah;           // Max 6
      const dimZiarah = zrEgypt + zrMadinah + zrMekah;         // Max 6

      // 3 Destinasi Perjalanan (Setiap satu Max 8 Markah: Bilik 2 + Servis 2 + Makanan 2 + Ziarah 2)
      const destEgypt = hrEgypt + hsEgypt + fdEgypt + zrEgypt;       // Max 8
      const destMadinah = hrMadinah + hsMadinah + fdMadinah + zrMadinah; // Max 8
      const destMekah = hrMekah + hsMekah + fdMekah + zrMekah;       // Max 8

      // Jumlah Keseluruhan: 6 (Khidmat) + 8 (Egypt) + 8 (Madinah) + 8 (Mekah) = 30 Markah
      const total = dimService + dimRoom + dimHotelService + dimFood + dimZiarah;
      const maxScore = 30;
      const percentage = Math.round((total / maxScore) * 100);

      let rating = 'MEMUASKAN';
      let badgeClass = 'rating-good';
      let subtext = 'Tahap Kepuasan Baik (Passive)';
      let insight = 'Terima kasih atas maklum balas anda. Skor anda menunjukkan tahap kepuasan yang memuaskan (Passive). Kami akan terus berusaha mempertingkatkan mutu perkhidmatan.';
      let initialStatus = 'PENDING_REVIEW';

      if (percentage >= 80) {
        rating = 'CEMERLANG';
        badgeClass = 'rating-excellent';
        subtext = 'Jemaah Sangat Berpuas Hati (Promoter)';
        insight = 'Alhamdulillah! Tahap kepuasan anda berada di tahap Cemerlang (Promoter). Terima kasih atas kepercayaan anda kepada Andalusia Travel & Tours.';
        initialStatus = 'PENDING_REVIEW';
      } else if (percentage < 50) {
        rating = 'PERLU TINDAKAN';
        badgeClass = 'rating-action';
        subtext = 'Perhatian Khidmat Pelanggan Segera (Detractor)';
        insight = 'Maklum balas anda telah ditandakan untuk perhatian segera (Service Recovery). Pasukan pengurusan kualiti Andalusia akan menghubungi anda untuk semakan lanjut.';
        initialStatus = 'ACTION_REQUIRED';
      }

      return {
        isFullSurvey: true,
        cat1: c1,
        cat2: c2,
        cat3: c3,
        hotel_room_egypt: hrEgypt,
        hotel_service_egypt: hsEgypt,
        food_egypt: fdEgypt,
        hotel_room_madinah: hrMadinah,
        hotel_service_madinah: hsMadinah,
        food_madinah: fdMadinah,
        hotel_room_mekah: hrMekah,
        hotel_service_mekah: hsMekah,
        food_mekah: fdMekah,
        ziarah_egypt: zrEgypt,
        ziarah_madinah: zrMadinah,
        ziarah_mekah: zrMekah,
        ziarahFeedback: feedback,
        dimensions: {
          service: dimService,          // /6
          room: dimRoom,                // /6
          hotelService: dimHotelService,// /6
          food: dimFood,                // /6
          ziarah: dimZiarah             // /6
        },
        destinations: {
          egypt: { score: destEgypt, max: 8, percent: Math.round((destEgypt / 8) * 100) },
          madinah: { score: destMadinah, max: 8, percent: Math.round((destMadinah / 8) * 100) },
          mekah: { score: destMekah, max: 8, percent: Math.round((destMekah / 8) * 100) }
        },
        total,
        maxScore,
        percentage,
        rating,
        badgeClass,
        subtext,
        insight,
        initialStatus
      };
    }

    // Aliran Pengiraan Legacy (3 Kategori Sahaja - Max 6)
    const total = c1 + c2 + c3;
    const maxScore = 6;
    const percentage = Math.round((total / maxScore) * 100);

    let rating = 'MEMUASKAN';
    let badgeClass = 'rating-good';
    let subtext = 'Tahap Kepuasan Baik (Passive)';
    let insight = 'Terima kasih atas penilaian anda. Sistem merekodkan tahap kepuasan yang baik (Passive). Pegawai operasi Andalusia akan menghubungi anda.';
    let initialStatus = 'PENDING_REVIEW';

    if (total >= 5) {
      rating = 'CEMERLANG';
      badgeClass = 'rating-excellent';
      subtext = 'Jemaah Sangat Berpuas Hati (Promoter)';
      insight = 'Tahniah! Anda memberikan maklum balas positif yang sangat tinggi (Promoter). Pegawai operasi kami telah menerima pendaftaran ini.';
      initialStatus = 'PENDING_REVIEW';
    } else if (total <= 2) {
      rating = 'PERLU TINDAKAN';
      badgeClass = 'rating-action';
      subtext = 'Perhatian Khidmat Pelanggan Segera (Detractor)';
      insight = 'Maklum balas anda telah ditandakan untuk semakan keutamaan tinggi. Pengurus khidmat pelanggan kami akan menghubungi anda.';
      initialStatus = 'ACTION_REQUIRED';
    }

    return {
      isFullSurvey: false,
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

  // Validasi Langkah 1 (Maklumat Jemaah & Khidmat Andalusia)
  validateStep1(fullName, phone, cat1, cat2, cat3) {
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

  // Validasi Langkah 2 (Respon Hotel & Makanan: Egypt, Madinah, Mekah)
  validateStep2(hotelAnswers) {
    const errors = {};
    const requiredFields = [
      { key: 'hotel_room_egypt', msg: 'Sila pilih penilaian bagi bilik hotel di Egypt.' },
      { key: 'hotel_service_egypt', msg: 'Sila pilih penilaian bagi perkhidmatan hotel di Egypt.' },
      { key: 'food_egypt', msg: 'Sila pilih penilaian bagi makanan di Egypt.' },
      { key: 'hotel_room_madinah', msg: 'Sila pilih penilaian bagi bilik hotel di Madinah.' },
      { key: 'hotel_service_madinah', msg: 'Sila pilih penilaian bagi perkhidmatan hotel di Madinah.' },
      { key: 'food_madinah', msg: 'Sila pilih penilaian bagi makanan di Madinah.' },
      { key: 'hotel_room_mekah', msg: 'Sila pilih penilaian bagi bilik hotel di Mekah.' },
      { key: 'hotel_service_mekah', msg: 'Sila pilih penilaian bagi perkhidmatan hotel di Mekah.' },
      { key: 'food_mekah', msg: 'Sila pilih penilaian bagi makanan di Mekah.' }
    ];

    requiredFields.forEach(f => {
      const val = hotelAnswers ? hotelAnswers[f.key] : null;
      if (val === null || val === undefined || val === '') {
        errors[f.key] = f.msg;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validasi Langkah 3 (Tempat Ziarah & Ulasan Max 500 Huruf)
  validateStep3(ziarahAnswers, feedbackText) {
    const errors = {};
    const requiredZiarah = [
      { key: 'ziarah_egypt', msg: 'Sila pilih penilaian bagi tempat ziarah di Egypt.' },
      { key: 'ziarah_madinah', msg: 'Sila pilih penilaian bagi tempat ziarah di Madinah.' },
      { key: 'ziarah_mekah', msg: 'Sila pilih penilaian bagi tempat ziarah di Mekah.' }
    ];

    requiredZiarah.forEach(f => {
      const val = ziarahAnswers ? ziarahAnswers[f.key] : null;
      if (val === null || val === undefined || val === '') {
        errors[f.key] = f.msg;
      }
    });

    if (feedbackText && feedbackText.length > 500) {
      errors.ziarahFeedback = 'Ulasan tidak boleh melebihi had maksimum 500 huruf.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validasi Input Menyeluruh (Sokongan Keserasian Lama & Penuh)
  validateInputs(fullName, phone, cat1, cat2, cat3, optionalFullData) {
    const step1Validation = this.validateStep1(fullName, phone, cat1, cat2, cat3);
    if (!step1Validation.isValid) {
      return step1Validation;
    }

    if (optionalFullData) {
      const step2Validation = this.validateStep2(optionalFullData);
      if (!step2Validation.isValid) {
        return {
          isValid: false,
          errors: { ...step1Validation.errors, ...step2Validation.errors }
        };
      }
      const step3Validation = this.validateStep3(optionalFullData, optionalFullData.ziarahFeedback);
      if (!step3Validation.isValid) {
        return {
          isValid: false,
          errors: { ...step1Validation.errors, ...step2Validation.errors, ...step3Validation.errors }
        };
      }
    }

    return {
      isValid: true,
      errors: {}
    };
  },

  // Simpan Rekod ke LocalStorage
  saveRecord(record) {
    if (typeof localStorage === 'undefined') return record;
    try {
      const existing = JSON.parse(localStorage.getItem('vali_lusia_submissions') || '[]');
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

    let currentStep = 1;
    let activeRecord = null;

    // Elemen Input Page 1
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phoneNumber');
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const cat1Error = document.getElementById('cat1Error');
    const cat2Error = document.getElementById('cat2Error');
    const cat3Error = document.getElementById('cat3Error');

    // Elemen Input Page 3 (Ulasan & Kaunter)
    const feedbackInput = document.getElementById('ziarahFeedback');
    const charCountEl = document.getElementById('charCount');
    const charCounterTag = document.getElementById('charCounterTag');

    // Navigasi Butang
    const btnNextStep1 = document.getElementById('btnNextStep1');
    const btnPrevStep2 = document.getElementById('btnPrevStep2');
    const btnNextStep2 = document.getElementById('btnNextStep2');
    const btnPrevStep3 = document.getElementById('btnPrevStep3');
    const btnSubmitForm = document.getElementById('btnSubmitForm');

    // Modal Graf
    const resultModal = document.getElementById('resultGraphModal');
    const btnPrintResult = document.getElementById('btnPrintResult');
    const btnGoToStatus = document.getElementById('btnGoToStatus');
    const btnCloseResultModal = document.getElementById('btnCloseResultModal');
    const btnDismissModal = document.getElementById('btnDismissModal');

    // Fungsi Tukar Halaman (Stepper Wizard)
    function goToStep(step) {
      currentStep = step;

      // Kemaskini Halaman Paparan
      document.querySelectorAll('.step-page').forEach(page => page.classList.remove('active'));
      const targetPage = document.getElementById(`stepPage${step}`);
      if (targetPage) targetPage.classList.add('active');

      // Kemaskini Stepper Header
      for (let s = 1; s <= 3; s++) {
        const item = document.getElementById(`stepperStep${s}`);
        if (!item) continue;
        item.classList.remove('active', 'completed');
        if (s < step) {
          item.classList.add('completed');
        } else if (s === step) {
          item.classList.add('active');
        }
      }

      // Kemaskini Progress Bar
      const progressBar = document.getElementById('stepperProgressBar');
      if (progressBar) {
        if (step === 1) progressBar.style.width = '0%';
        else if (step === 2) progressBar.style.width = '50%';
        else if (step === 3) progressBar.style.width = '100%';
      }

      // Tatal ke atas borang
      const mainCard = document.querySelector('.form-card');
      if (mainCard) {
        mainCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

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

    // Kaunter Huruf Masa-Nyata (Max 500 Aksara)
    if (feedbackInput && charCountEl) {
      feedbackInput.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val.length > 500) {
          val = val.substring(0, 500);
          e.target.value = val;
        }
        const len = val.length;
        charCountEl.textContent = len;

        if (charCounterTag) {
          charCounterTag.classList.remove('warn', 'limit');
          if (len >= 500) {
            charCounterTag.classList.add('limit');
          } else if (len >= 450) {
            charCounterTag.classList.add('warn');
          }
        }
      });
    }

    // Maklum Balas Visual Radio Pilihan
    const allRadioNames = [
      'cat1', 'cat2', 'cat3',
      'hotel_room_egypt', 'hotel_service_egypt', 'food_egypt',
      'hotel_room_madinah', 'hotel_service_madinah', 'food_madinah',
      'hotel_room_mekah', 'hotel_service_mekah', 'food_mekah',
      'ziarah_egypt', 'ziarah_madinah', 'ziarah_mekah'
    ];

    allRadioNames.forEach(radioName => {
      const radios = document.querySelectorAll(`input[name="${radioName}"]`);
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          // Bersihkan ralat berkaitan jika ada
          const errEl = document.getElementById(`err_${radioName}`) || document.getElementById(`${radioName}Error`);
          if (errEl) errEl.style.display = 'none';

          const card = document.getElementById(`card${radioName.charAt(0).toUpperCase() + radioName.slice(1)}`) ||
                       document.getElementById(`aspect_${radioName}`) ||
                       document.getElementById(`card_${radioName}`);
          if (card) {
            card.classList.remove('has-error');
            card.classList.add('answered');
          }
        });
      });
    });

    // Pengendali Navigasi Page 1 ➔ Page 2
    if (btnNextStep1) {
      btnNextStep1.addEventListener('click', () => {
        const fullName = (fullNameInput ? fullNameInput.value : '').trim().toUpperCase();
        const phone = (phoneInput ? phoneInput.value : '').trim();

        const cat1El = document.querySelector('input[name="cat1"]:checked');
        const cat2El = document.querySelector('input[name="cat2"]:checked');
        const cat3El = document.querySelector('input[name="cat3"]:checked');

        const cat1Val = cat1El ? cat1El.value : null;
        const cat2Val = cat2El ? cat2El.value : null;
        const cat3Val = cat3El ? cat3El.value : null;

        const valRes = ValiLusiaApp.validateStep1(fullName, phone, cat1Val, cat2Val, cat3Val);

        // Reset paparan ralat Step 1
        if (nameError) nameError.style.display = 'none';
        if (phoneError) phoneError.style.display = 'none';
        if (cat1Error) cat1Error.style.display = 'none';
        if (cat2Error) cat2Error.style.display = 'none';
        if (cat3Error) cat3Error.style.display = 'none';

        if (!valRes.isValid) {
          if (valRes.errors.fullName) {
            if (fullNameInput) fullNameInput.classList.add('is-invalid');
            if (nameError) {
              nameError.textContent = valRes.errors.fullName;
              nameError.style.display = 'block';
            }
          }
          if (valRes.errors.phoneNumber) {
            if (phoneInput) phoneInput.classList.add('is-invalid');
            if (phoneError) {
              phoneError.textContent = valRes.errors.phoneNumber;
              phoneError.style.display = 'block';
            }
          }
          if (valRes.errors.cat1) {
            const c1 = document.getElementById('cardCat1');
            if (c1) c1.classList.add('has-error');
            if (cat1Error) cat1Error.style.display = 'block';
          }
          if (valRes.errors.cat2) {
            const c2 = document.getElementById('cardCat2');
            if (c2) c2.classList.add('has-error');
            if (cat2Error) cat2Error.style.display = 'block';
          }
          if (valRes.errors.cat3) {
            const c3 = document.getElementById('cardCat3');
            if (c3) c3.classList.add('has-error');
            if (cat3Error) cat3Error.style.display = 'block';
          }

          const firstErr = document.querySelector('#stepPage1 .is-invalid, #stepPage1 .has-error');
          if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        goToStep(2);
      });
    }

    // Pengendali Navigasi Page 2 ➔ Page 1
    if (btnPrevStep2) {
      btnPrevStep2.addEventListener('click', () => {
        goToStep(1);
      });
    }

    // Kumpul Jawapan Page 2
    function getStep2Answers() {
      const fields = [
        'hotel_room_egypt', 'hotel_service_egypt', 'food_egypt',
        'hotel_room_madinah', 'hotel_service_madinah', 'food_madinah',
        'hotel_room_mekah', 'hotel_service_mekah', 'food_mekah'
      ];
      const data = {};
      fields.forEach(f => {
        const el = document.querySelector(`input[name="${f}"]:checked`);
        data[f] = el ? el.value : null;
      });
      return data;
    }

    // Pengendali Navigasi Page 2 ➔ Page 3
    if (btnNextStep2) {
      btnNextStep2.addEventListener('click', () => {
        const step2Data = getStep2Answers();
        const valRes = ValiLusiaApp.validateStep2(step2Data);

        // Reset ralat
        document.querySelectorAll('#stepPage2 .error-text').forEach(e => e.style.display = 'none');
        document.querySelectorAll('#stepPage2 .dest-aspect-item').forEach(e => e.classList.remove('has-error'));

        if (!valRes.isValid) {
          Object.keys(valRes.errors).forEach(key => {
            const errEl = document.getElementById(`err_${key}`);
            const aspectEl = document.getElementById(`aspect_${key}`);
            if (errEl) {
              errEl.textContent = valRes.errors[key];
              errEl.style.display = 'block';
            }
            if (aspectEl) aspectEl.classList.add('has-error');
          });

          const firstErr = document.querySelector('#stepPage2 .has-error');
          if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        goToStep(3);
      });
    }

    // Pengendali Navigasi Page 3 ➔ Page 2
    if (btnPrevStep3) {
      btnPrevStep3.addEventListener('click', () => {
        goToStep(2);
      });
    }

    // Kumpul Jawapan Page 3
    function getStep3Answers() {
      const fields = ['ziarah_egypt', 'ziarah_madinah', 'ziarah_mekah'];
      const data = {};
      fields.forEach(f => {
        const el = document.querySelector(`input[name="${f}"]:checked`);
        data[f] = el ? el.value : null;
      });
      return data;
    }

    // Pengendali Penghantaran Borang (Langkah 3 ➔ Keputusan Graf)
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Semak Langkah 1
      const fullName = (fullNameInput ? fullNameInput.value : '').trim().toUpperCase();
      const phone = (phoneInput ? phoneInput.value : '').trim();
      const cat1El = document.querySelector('input[name="cat1"]:checked');
      const cat2El = document.querySelector('input[name="cat2"]:checked');
      const cat3El = document.querySelector('input[name="cat3"]:checked');
      const val1 = ValiLusiaApp.validateStep1(fullName, phone, cat1El ? cat1El.value : null, cat2El ? cat2El.value : null, cat3El ? cat3El.value : null);
      if (!val1.isValid) {
        goToStep(1);
        return;
      }

      // Semak Langkah 2
      const step2Data = getStep2Answers();
      const val2 = ValiLusiaApp.validateStep2(step2Data);
      if (!val2.isValid) {
        goToStep(2);
        return;
      }

      // Semak Langkah 3
      const step3Data = getStep3Answers();
      const feedbackText = (feedbackInput ? feedbackInput.value : '').trim().substring(0, 500);
      const val3 = ValiLusiaApp.validateStep3(step3Data, feedbackText);

      document.querySelectorAll('#stepPage3 .error-text').forEach(e => e.style.display = 'none');
      document.querySelectorAll('#stepPage3 .question-category-card').forEach(e => e.classList.remove('has-error'));

      if (!val3.isValid) {
        Object.keys(val3.errors).forEach(key => {
          const errEl = document.getElementById(`err_${key}`);
          const cardEl = document.getElementById(`card_${key}`);
          if (errEl) {
            errEl.textContent = val3.errors[key];
            errEl.style.display = 'block';
          }
          if (cardEl) cardEl.classList.add('has-error');
        });
        const firstErr = document.querySelector('#stepPage3 .has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Kumpul Konteks Perjalanan & NPS
      const packageTypeEl = document.getElementById('packageType');
      const mutawwifNameEl = document.getElementById('mutawwifName');
      const npsEl = document.querySelector('input[name="npsRecommendation"]:checked');

      const packageType = packageTypeEl ? packageTypeEl.value : 'Pakej Umrah Ziarah Mesir';
      const mutawwifName = (mutawwifNameEl ? mutawwifNameEl.value : '').trim();
      const npsRecommendation = npsEl ? npsEl.value : 'Pasti Syorkan';

      // Gabungkan Semua Jawapan
      const allAnswers = {
        cat1: cat1El.value,
        cat2: cat2El.value,
        cat3: cat3El.value,
        packageType,
        mutawwifName,
        npsRecommendation,
        ...step2Data,
        ...step3Data,
        ziarahFeedback: feedbackText
      };

      // Pengiraan Skor Menyeluruh (30 Markah)
      const scoreData = ValiLusiaApp.calculateScore(allAnswers);
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
        packageType,
        mutawwifName,
        npsRecommendation,
        ...allAnswers,
        totalScore: scoreData.total,
        maxScore: scoreData.maxScore,
        percentage: scoreData.percentage,
        rating: scoreData.rating,
        status: scoreData.initialStatus,
        dimensions: scoreData.dimensions,
        destinations: scoreData.destinations,
        submittedAt,
        notes: (scoreData.percentage < 50 ? 'Jemaah memberikan penilaian rendah (tindakan pemulihan khidmat diperlukan).' : 'Maklum balas kepuasan jemaah diterima bersama Indeks CSAT.')
      };

      // Simpan Rekod
      ValiLusiaApp.saveRecord(submissionRecord);
      activeRecord = submissionRecord;

      // Paparkan Graf Keputusan dalam Modal
      renderResultGraphModal(submissionRecord, scoreData);
    });

    // Render Graf Keputusan ke dalam Modal
    function renderResultGraphModal(record, scoreData) {
      if (!resultModal) return;

      document.getElementById('resApplicantName').textContent = record.fullName;
      document.getElementById('resApplicantPhone').textContent = record.phone;
      document.getElementById('resValidationCode').textContent = record.code;

      // Kemaskini Konteks Perjalanan & NPS jika elemen wujud
      const tripContextEl = document.getElementById('resTripContext');
      if (tripContextEl) {
        let ctx = record.packageType || 'Pakej Umrah Andalusia';
        if (record.mutawwifName) ctx += ` • Mutawwif: ${record.mutawwifName}`;
        tripContextEl.textContent = ctx;
        tripContextEl.style.display = 'inline-flex';
      }

      const npsBadgeEl = document.getElementById('resNpsBadge');
      if (npsBadgeEl) {
        if (record.npsRecommendation) {
          npsBadgeEl.textContent = `🤝 Rekomendasi: ${record.npsRecommendation}`;
          npsBadgeEl.style.display = 'inline-flex';
        } else {
          npsBadgeEl.style.display = 'none';
        }
      }

      document.getElementById('resTotalScore').textContent = scoreData.total;
      document.getElementById('resPercentageTag').textContent = `${scoreData.percentage}% Indeks Kepuasan CSAT`;

      const ratingBadge = document.getElementById('resRatingBadge');
      if (ratingBadge) {
        ratingBadge.className = `rating-badge-pill ${scoreData.badgeClass}`;
        ratingBadge.textContent = `⭐ ${scoreData.rating}`;
      }

      const ratingSubtext = document.getElementById('resRatingSubtext');
      if (ratingSubtext) ratingSubtext.textContent = scoreData.subtext;

      const insightBox = document.getElementById('resInsightBox');
      if (insightBox) insightBox.innerHTML = `<strong>Analisis Kepuasan CSAT:</strong> ${scoreData.insight}`;

      // Kemaskini Destinasi (Egypt, Madinah, Mekah)
      if (scoreData.destinations) {
        const destEg = scoreData.destinations.egypt;
        const destMd = scoreData.destinations.madinah;
        const destMk = scoreData.destinations.mekah;

        const elEgScore = document.getElementById('resDestScoreEgypt');
        const elEgPct = document.getElementById('resDestPercentEgypt');
        if (elEgScore && destEg) {
          elEgScore.textContent = `${destEg.score} / ${destEg.max}`;
          elEgPct.textContent = `${destEg.percent}% Kepuasan`;
        }

        const elMdScore = document.getElementById('resDestScoreMadinah');
        const elMdPct = document.getElementById('resDestPercentMadinah');
        if (elMdScore && destMd) {
          elMdScore.textContent = `${destMd.score} / ${destMd.max}`;
          elMdPct.textContent = `${destMd.percent}% Kepuasan`;
        }

        const elMkScore = document.getElementById('resDestScoreMekah');
        const elMkPct = document.getElementById('resDestPercentMekah');
        if (elMkScore && destMk) {
          elMkScore.textContent = `${destMk.score} / ${destMk.max}`;
          elMkPct.textContent = `${destMk.percent}% Kepuasan`;
        }
      }

      // Kemaskini 5 Dimensi Pengalaman
      if (scoreData.dimensions) {
        updateDimensionBar('1', scoreData.dimensions.service, 6);
        updateDimensionBar('2', scoreData.dimensions.room, 6);
        updateDimensionBar('3', scoreData.dimensions.hotelService, 6);
        updateDimensionBar('4', scoreData.dimensions.food, 6);
        updateDimensionBar('5', scoreData.dimensions.ziarah, 6);
      }

      // Paparan Ulasan / Maklum Balas Terbuka
      const feedbackWrap = document.getElementById('resFeedbackWrap');
      const feedbackText = document.getElementById('resFeedbackText');
      if (feedbackWrap && feedbackText) {
        if (record.ziarahFeedback && record.ziarahFeedback.trim().length > 0) {
          feedbackText.textContent = `"${record.ziarahFeedback.trim()}"`;
          feedbackWrap.style.display = 'block';
        } else {
          feedbackWrap.style.display = 'none';
        }
      }

      // Buka Modal & Kunci Tatalan Latar Belakang (Scroll Lock)
      document.body.classList.add('modal-open');
      resultModal.classList.add('active');
      const modalBody = resultModal.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    }

    function closeModal() {
      if (!resultModal) return;
      document.body.classList.remove('modal-open');
      resultModal.classList.remove('active');
      form.reset();
      if (charCountEl) charCountEl.textContent = '0';
      if (charCounterTag) charCounterTag.classList.remove('warn', 'limit');
      goToStep(1);
    }

    function updateDimensionBar(dimIndex, score, max) {
      const scoreEl = document.getElementById(`barScoreDim${dimIndex}`);
      const fillEl = document.getElementById(`barFillDim${dimIndex}`);
      if (!scoreEl || !fillEl) return;

      const pct = Math.round((score / max) * 100);
      let label = `${score} / ${max}`;
      let fillClass = 'fill-emerald';

      if (pct >= 80) {
        label += ' (Terbaik)';
        fillClass = 'fill-emerald';
      } else if (pct >= 50) {
        label += ' (Memuaskan)';
        fillClass = 'fill-gold';
      } else {
        label += ' (Perlu Penambahbaikan)';
        fillClass = 'fill-danger';
      }

      scoreEl.textContent = label;
      fillEl.className = `chart-fill ${fillClass}`;
      fillEl.style.width = '0%';
      setTimeout(() => {
        fillEl.style.width = `${Math.max(6, pct)}%`;
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
        document.body.classList.remove('modal-open');
        if (activeRecord && activeRecord.code) {
          window.location.href = `status.html?query=${encodeURIComponent(activeRecord.code)}`;
        } else {
          window.location.href = 'status.html';
        }
      });
    }

    // Butang Tutup Modal & Reset
    if (btnCloseResultModal) {
      btnCloseResultModal.addEventListener('click', closeModal);
    }
    if (btnDismissModal) {
      btnDismissModal.addEventListener('click', closeModal);
    }

    // Tutup Modal dengan Klik Backdrop di Luar Dialog
    if (resultModal) {
      resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
          closeModal();
        }
      });
    }

    // Tutup Modal dengan Menekan Kekunci ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resultModal && resultModal.classList.contains('active')) {
        closeModal();
      }
    });
  });
}

// Sokongan Eksport Modul untuk Persekitaran Ujian Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValiLusiaApp;
}
