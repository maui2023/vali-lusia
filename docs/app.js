/**
 * Vali-Lusia: Logik Frontend & Validasi Borang Andalusia Travel & Tours
 *
 * Ciri-ciri:
 * 1. Multi-Step Form Wizard (5 Langkah Pintar).
 * 2. Pilihan Pendaftaran Pantas (Langkah 1: Nama & Telefon Sahaja).
 * 3. Validasi MyKad 12-digit dengan auto-kira Tarikh Lahir & Jantina.
 * 4. Pengesahan Pasport Masa-Nyata (Syarat Imigresen >6 Bulan sebelum pelepasan).
 * 5. Muat naik dokumen sokongan dengan pratonton nama & saiz fail.
 * 6. Ringkasan semakan & perakuan PDPA 2010.
 * 7. Integrasi penuh bersama enjin PDF (Baca & Muat Turun PDF).
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. STATE & KONFIGURASI APLIKASI
  // =========================================================================
  const state = {
    currentStep: 1,
    totalSteps: 5,
    maxReachedStep: 1,
    isPassportValid: true,
    files: {
      passport: null,
      mykad: null,
      receipt: null
    }
  };

  let latestSubmissionRecord = null;

  // DOM Elemen Navigasi & Wizard
  const form = document.getElementById('validationForm') || document.getElementById('simpleForm');
  const stepItems = document.querySelectorAll('.step-item');
  const stepContents = document.querySelectorAll('.step-content');
  const progressBar = document.getElementById('stepperProgressBar');
  const stepHeaderTitle = document.getElementById('stepHeaderTitle');
  const stepBadge = document.getElementById('stepBadge');

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnQuickSubmit = document.getElementById('btnQuickSubmit');
  const btnSubmit = document.getElementById('btnSubmit');

  // Input Medan
  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const icNumberInput = document.getElementById('icNumber');
  const birthDateInput = document.getElementById('birthDate');
  const emailInput = document.getElementById('email');
  const emergencyNameInput = document.getElementById('emergencyName');
  const emergencyPhoneInput = document.getElementById('emergencyPhone');
  const emergencyRelInput = document.getElementById('emergencyRel');

  const bookingRefInput = document.getElementById('bookingRef');
  const branchSelect = document.getElementById('branchSelect');
  const packageSelect = document.getElementById('packageSelect');
  const departureDateInput = document.getElementById('departureDate');
  const roomSelect = document.getElementById('roomSelect');
  const specialNeedsInput = document.getElementById('specialNeeds');

  const passportNumberInput = document.getElementById('passportNumber');
  const passportExpiryInput = document.getElementById('passportExpiry');
  const passportAlert = document.getElementById('passportAlert');
  const passportAlertText = document.getElementById('passportAlertText');

  // Muat Naik Fail
  const filePassport = document.getElementById('file_passport');
  const dropzonePassport = document.getElementById('dropzonePassport');
  const previewPassport = document.getElementById('previewPassport');
  const namePassport = document.getElementById('namePassport');
  const sizePassport = document.getElementById('sizePassport');
  const removePassport = document.getElementById('removePassport');

  const fileMykad = document.getElementById('file_mykad');
  const dropzoneMykad = document.getElementById('dropzoneMykad');
  const previewMykad = document.getElementById('previewMykad');
  const nameMykad = document.getElementById('nameMykad');
  const sizeMykad = document.getElementById('sizeMykad');
  const removeMykad = document.getElementById('removeMykad');

  const fileReceipt = document.getElementById('file_receipt');
  const dropzoneReceipt = document.getElementById('dropzoneReceipt');
  const previewReceipt = document.getElementById('previewReceipt');
  const nameReceipt = document.getElementById('nameReceipt');
  const sizeReceipt = document.getElementById('sizeReceipt');
  const removeReceipt = document.getElementById('removeReceipt');

  // Modal Kejayaan
  const successModal = document.getElementById('successModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalSlipCode = document.getElementById('modalSlipCode');
  const modalApplicantName = document.getElementById('modalApplicantName');
  const modalApplicantPhone = document.getElementById('modalApplicantPhone');
  const modalTypeBadge = document.getElementById('modalTypeBadge');
  const modalNotesDesc = document.getElementById('modalNotesDesc');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnPrintSlip = document.getElementById('btnPrintSlip');
  const btnViewPdfModal = document.getElementById('btnViewPdfModal');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');

  // Tajuk Setiap Langkah
  const stepTitles = [
    'Langkah 1: Maklumat Asas Jemaah',
    'Langkah 2: Soalan Validasi Jemaah & MyKad',
    'Langkah 3: Maklumat Pakej & Pelepasan Umrah',
    'Langkah 4: Validasi Pasport & Dokumen Sokongan',
    'Langkah 5: Semakan Ringkasan & Perakuan'
  ];

  // =========================================================================
  // 2. FORMAT AUTOMATIK MEDAN INPUT (AUTO-FORMATTING & MASKING)
  // =========================================================================

  // Auto-uppercase untuk Nama Penuh
  if (fullNameInput) {
    fullNameInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      clearError('nameError', fullNameInput);
    });
  }

  // Format Nombor Telefon Malaysia (cth: 012-3456789)
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/[^\d+]/g, '');
      if (raw.startsWith('01') && !raw.includes('+')) {
        let digits = raw.replace(/\D/g, '');
        if (digits.length > 3 && digits.length <= 7) {
          e.target.value = `${digits.substring(0, 3)}-${digits.substring(3)}`;
        } else if (digits.length > 7) {
          e.target.value = `${digits.substring(0, 3)}-${digits.substring(3, 7)}${digits.substring(7, 11)}`;
        } else {
          e.target.value = digits;
        }
      } else {
        e.target.value = raw;
      }
      clearError('phoneError', phoneInput);
    });
  }

  // Format MyKad 12-digit & Auto-Kira Tarikh Lahir & Jantina
  if (icNumberInput) {
    icNumberInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 12) val = val.substring(0, 12);

      let formatted = val;
      if (val.length > 6 && val.length <= 8) {
        formatted = `${val.substring(0, 6)}-${val.substring(6)}`;
      } else if (val.length > 8) {
        formatted = `${val.substring(0, 6)}-${val.substring(6, 8)}-${val.substring(8)}`;
      }
      e.target.value = formatted;

      const icHint = document.getElementById('icHint');
      if (val.length === 12) {
        const yearPart = parseInt(val.substring(0, 2), 10);
        const monthPart = parseInt(val.substring(2, 4), 10);
        const dayPart = parseInt(val.substring(4, 6), 10);
        const lastDigit = parseInt(val.substring(11, 12), 10);

        const currentYear2Digit = new Date().getFullYear() % 100;
        const fullYear = (yearPart > currentYear2Digit ? 1900 : 2000) + yearPart;

        if (monthPart >= 1 && monthPart <= 12 && dayPart >= 1 && dayPart <= 31) {
          const formattedDOB = `${fullYear}-${String(monthPart).padStart(2, '0')}-${String(dayPart).padStart(2, '0')}`;
          if (birthDateInput) birthDateInput.value = formattedDOB;

          // Jantina: Ganjil = Lelaki, Genap = Perempuan
          const isMale = (lastDigit % 2 !== 0);
          const genderRadios = document.querySelectorAll('input[name="gender"]');
          genderRadios.forEach(radio => {
            radio.checked = isMale ? (radio.value === 'LELAKI') : (radio.value === 'PEREMPUAN');
          });

          icNumberInput.classList.remove('is-invalid');
          icNumberInput.classList.add('is-valid');
          if (icHint) {
            icHint.textContent = `✓ Sah: Lahir ${dayPart}/${monthPart}/${fullYear} (${isMale ? 'Lelaki' : 'Perempuan'})`;
            icHint.style.color = 'var(--success)';
          }
        } else {
          icNumberInput.classList.add('is-invalid');
          if (icHint) {
            icHint.textContent = '✗ Format tarikh lahir dalam MyKad tidak sah.';
            icHint.style.color = 'var(--danger)';
          }
        }
      } else {
        icNumberInput.classList.remove('is-valid');
        if (icHint) {
          icHint.textContent = 'Format: 12 digit (cth: 920815-10-6188)';
          icHint.style.color = 'var(--text-muted)';
        }
      }
    });
  }

  // Format Huruf Besar Pasport
  if (passportNumberInput) {
    passportNumberInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      clearError('passportNumberError', passportNumberInput);
    });
  }

  // =========================================================================
  // 3. PENGESAHAN TEMPOH SAH PASPORT 6 BULAN (REAL-TIME VALIDITY ENGINE)
  // =========================================================================
  function checkPassportValidity() {
    if (!passportExpiryInput || !departureDateInput) return;

    const expiryVal = passportExpiryInput.value;
    const depVal = departureDateInput.value;

    if (!expiryVal || !depVal) {
      if (passportAlert) passportAlert.style.display = 'none';
      return;
    }

    const expiryDate = new Date(expiryVal);
    const departureDate = new Date(depVal);

    // Kira perbezaan hari
    const diffTime = expiryDate.getTime() - departureDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const requiredDays = 180; // 6 bulan

    if (passportAlert && passportAlertText) {
      passportAlert.style.display = 'flex';
      if (diffDays < requiredDays) {
        state.isPassportValid = false;
        passportAlert.className = 'alert-box alert-warning';
        passportAlert.style.border = '1px solid #fecaca';
        passportAlert.style.background = '#fef2f2';
        passportAlertText.innerHTML = `
          <strong style="color:#991b1b;">⚠️ AMARAN SYARAT PASPORT:</strong>
          Tempoh sah pasport anda hanya berbaki <strong>${diffDays > 0 ? diffDays : 0} hari</strong> dari tarikh pelepasan (${depVal}).
          Syarat Imigresen Arab Saudi dan Malaysia memerlukan pasport sah <strong>sekurang-kurangnya 6 bulan (180 hari)</strong>. Sila perbaharui pasport anda segera.
        `;
      } else {
        state.isPassportValid = true;
        passportAlert.className = 'alert-box alert-success';
        passportAlert.style.border = '1px solid #bbf7d0';
        passportAlert.style.background = '#f0fdf4';
        passportAlertText.innerHTML = `
          <strong style="color:#166534;">✓ STATUS PASPORT SAH:</strong>
          Pasport sah selama <strong>${diffDays} hari</strong> dari tarikh pelepasan. Memenuhi syarat 6 bulan Jabatan Imigresen Malaysia dan Kementerian Haji Arab Saudi.
        `;
      }
    }
  }

  if (passportExpiryInput) {
    passportExpiryInput.addEventListener('change', checkPassportValidity);
  }
  if (departureDateInput) {
    departureDateInput.addEventListener('change', checkPassportValidity);
  }

  // =========================================================================
  // 4. PENGENDALI MUAT NAIK FAIL (DRAG-AND-DROP & PREVIEWS)
  // =========================================================================
  function setupFileUpload(fileInput, dropzone, previewCard, nameEl, sizeEl, removeBtn, key) {
    if (!fileInput || !dropzone) return;

    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileChange();
      }
    });

    fileInput.addEventListener('change', handleFileChange);

    function handleFileChange() {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        state.files[key] = file;

        if (nameEl) nameEl.textContent = file.name;
        if (sizeEl) sizeEl.textContent = formatFileSize(file.size);

        if (dropzone) dropzone.style.display = 'none';
        if (previewCard) previewCard.style.display = 'flex';
        clearError(`${key}FileError`);
      }
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        state.files[key] = null;
        if (dropzone) dropzone.style.display = 'block';
        if (previewCard) previewCard.style.display = 'none';
      });
    }
  }

  setupFileUpload(filePassport, dropzonePassport, previewPassport, namePassport, sizePassport, removePassport, 'passport');
  setupFileUpload(fileMykad, dropzoneMykad, previewMykad, nameMykad, sizeMykad, removeMykad, 'mykad');
  setupFileUpload(fileReceipt, dropzoneReceipt, previewReceipt, nameReceipt, sizeReceipt, removeReceipt, 'receipt');

  function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // =========================================================================
  // 5. NAVIGASI LANGKAH (STEPPER CONTROLLER & VALIDATIONS)
  // =========================================================================

  function updateStepUI(step) {
    state.currentStep = step;
    if (step > state.maxReachedStep) state.maxReachedStep = step;

    // Kemaskini Tajuk & Badge
    if (stepHeaderTitle) {
      stepHeaderTitle.textContent = stepTitles[step - 1] || `Langkah ${step}`;
    }
    if (stepBadge) {
      stepBadge.textContent = `Langkah ${step} / ${state.totalSteps}`;
    }

    // Kemaskini Progress Bar
    if (progressBar) {
      const percentage = ((step - 1) / (state.totalSteps - 1)) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Kemaskini Stepper Nodes
    stepItems.forEach((item) => {
      const itemStep = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active', 'completed');
      if (itemStep === step) {
        item.classList.add('active');
      } else if (itemStep < step) {
        item.classList.add('completed');
      }
    });

    // Kemaskini Kandungan Setiap Langkah
    stepContents.forEach((content) => {
      const contentStep = parseInt(content.getAttribute('data-step'), 10);
      if (contentStep === step) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Kemaskini Butang Navigasi Footer
    if (btnPrev) {
      btnPrev.style.display = (step > 1) ? 'inline-flex' : 'none';
    }
    if (btnQuickSubmit) {
      btnQuickSubmit.style.display = (step === 1) ? 'inline-flex' : 'none';
    }
    if (btnNext) {
      btnNext.style.display = (step < state.totalSteps) ? 'inline-flex' : 'none';
    }
    if (btnSubmit) {
      btnSubmit.style.display = (step === state.totalSteps) ? 'inline-flex' : 'none';
    }

    // Skrol lancar ke atas borang
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  // Navigasi dengan klik pada stepper (jika langkah sudah pernah dilalui)
  stepItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep <= state.maxReachedStep) {
        if (targetStep === 5) populateReviewSummary();
        updateStepUI(targetStep);
      }
    });
  });

  // Validasi Langkah 1: Asas (Nama & Telefon)
  function validateStep1() {
    let isValid = true;
    const nameVal = fullNameInput ? fullNameInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';

    if (!nameVal || nameVal.length < 3) {
      showError('nameError', fullNameInput, 'Sila masukkan nama penuh anda (sekurang-kurangnya 3 huruf).');
      isValid = false;
    } else {
      clearError('nameError', fullNameInput);
    }

    const cleanDigits = phoneVal.replace(/\D/g, '');
    if (!phoneVal || cleanDigits.length < 9 || cleanDigits.length > 14) {
      showError('phoneError', phoneInput, 'Sila masukkan nombor telefon yang sah (antara 9 hingga 14 digit).');
      isValid = false;
    } else {
      clearError('phoneError', phoneInput);
    }

    return isValid;
  }

  // Validasi Langkah 2: MyKad & Peribadi
  function validateStep2() {
    let isValid = true;
    const icVal = icNumberInput ? icNumberInput.value.replace(/\D/g, '') : '';
    if (!icVal || icVal.length !== 12) {
      showError('icError', icNumberInput, 'Sila masukkan 12 digit nombor MyKad yang sah.');
      isValid = false;
    } else {
      clearError('icError', icNumberInput);
    }

    const emailVal = emailInput ? emailInput.value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      showError('emailError', emailInput, 'Sila masukkan alamat emel yang sah (cth: nama@emel.com).');
      isValid = false;
    } else {
      clearError('emailError', emailInput);
    }

    const emName = emergencyNameInput ? emergencyNameInput.value.trim() : '';
    if (!emName) {
      showError('emergencyNameError', emergencyNameInput, 'Sila nyatakan nama waris kecemasan.');
      isValid = false;
    } else {
      clearError('emergencyNameError', emergencyNameInput);
    }

    const emPhone = emergencyPhoneInput ? emergencyPhoneInput.value.trim() : '';
    if (!emPhone) {
      showError('emergencyPhoneError', emergencyPhoneInput, 'Sila masukkan no. telefon waris.');
      isValid = false;
    } else {
      clearError('emergencyPhoneError', emergencyPhoneInput);
    }

    const emRel = emergencyRelInput ? emergencyRelInput.value : '';
    if (!emRel) {
      showError('emergencyRelError', emergencyRelInput, 'Sila pilih hubungan waris.');
      isValid = false;
    } else {
      clearError('emergencyRelError', emergencyRelInput);
    }

    return isValid;
  }

  // Validasi Langkah 3: Pakej & Pelepasan
  function validateStep3() {
    let isValid = true;
    const bookingVal = bookingRefInput ? bookingRefInput.value.trim() : '';
    if (!bookingVal) {
      showError('bookingRefError', bookingRefInput, 'Sila masukkan nombor rujukan tempahan.');
      isValid = false;
    } else {
      clearError('bookingRefError', bookingRefInput);
    }

    const depVal = departureDateInput ? departureDateInput.value : '';
    if (!depVal) {
      showError('departureDateError', departureDateInput, 'Sila nyatakan tarikh cadangan pelepasan.');
      isValid = false;
    } else {
      clearError('departureDateError', departureDateInput);
    }

    return isValid;
  }

  // Validasi Langkah 4: Pasport & Dokumen
  function validateStep4() {
    let isValid = true;
    const passVal = passportNumberInput ? passportNumberInput.value.trim() : '';
    if (!passVal || passVal.length < 6) {
      showError('passportNumberError', passportNumberInput, 'Sila masukkan nombor pasport yang sah.');
      isValid = false;
    } else {
      clearError('passportNumberError', passportNumberInput);
    }

    const passExp = passportExpiryInput ? passportExpiryInput.value : '';
    if (!passExp) {
      showError('passportExpiryError', passportExpiryInput, 'Sila nyatakan tarikh tamat tempoh pasport.');
      isValid = false;
    } else {
      clearError('passportExpiryError', passportExpiryInput);
    }

    // Salinan pasport digalakkan/wajib
    if (!state.files.passport) {
      const fileErr = document.getElementById('passportFileError');
      if (fileErr) fileErr.style.display = 'block';
    } else {
      clearError('passportFileError');
    }

    checkPassportValidity();
    return isValid;
  }

  // Butang Seterusnya (Next)
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      let stepValid = false;
      if (state.currentStep === 1) stepValid = validateStep1();
      else if (state.currentStep === 2) stepValid = validateStep2();
      else if (state.currentStep === 3) stepValid = validateStep3();
      else if (state.currentStep === 4) stepValid = validateStep4();

      if (stepValid) {
        if (state.currentStep === 4) {
          populateReviewSummary();
        }
        updateStepUI(state.currentStep + 1);
      }
    });
  }

  // Butang Kembali (Prev)
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (state.currentStep > 1) {
        updateStepUI(state.currentStep - 1);
      }
    });
  }

  // =========================================================================
  // 6. POPULATE RINGKASAN SEMAKAN (LANGKAH 5)
  // =========================================================================
  function populateReviewSummary() {
    setText('sum_fullName', fullNameInput ? fullNameInput.value.trim() : '-');
    setText('sum_phone', phoneInput ? phoneInput.value.trim() : '-');
    setText('sum_icNumber', icNumberInput ? icNumberInput.value.trim() : '-');
    setText('sum_email', emailInput ? emailInput.value.trim() : '-');

    const selectedGender = document.querySelector('input[name="gender"]:checked');
    setText('sum_gender', selectedGender ? selectedGender.value : '-');
    setText('sum_birthDate', birthDateInput ? birthDateInput.value : '-');

    const emName = emergencyNameInput ? emergencyNameInput.value.trim() : '-';
    const emRel = emergencyRelInput ? emergencyRelInput.value : '-';
    setText('sum_emergencyName', emName);
    setText('sum_emergencyRel', emRel);

    const pkgText = packageSelect && packageSelect.options[packageSelect.selectedIndex] ?
      packageSelect.options[packageSelect.selectedIndex].text : '-';
    setText('sum_package', pkgText);

    setText('sum_departureDate', departureDateInput ? departureDateInput.value : '-');

    const branchText = branchSelect && branchSelect.options[branchSelect.selectedIndex] ?
      branchSelect.options[branchSelect.selectedIndex].text : '-';
    setText('sum_branch', branchText);

    const roomText = roomSelect && roomSelect.options[roomSelect.selectedIndex] ?
      roomSelect.options[roomSelect.selectedIndex].text : '-';
    setText('sum_room', roomText);

    setText('sum_passportNumber', passportNumberInput ? passportNumberInput.value.trim() : '-');
    setText('sum_passportExpiry', passportExpiryInput ? passportExpiryInput.value : '-');

    const badgeEl = document.getElementById('sum_passportStatusBadge');
    if (badgeEl) {
      if (state.isPassportValid) {
        badgeEl.textContent = 'STATUS 6 BULAN: SAH ✓';
        badgeEl.style.color = 'var(--success)';
      } else {
        badgeEl.textContent = 'STATUS: PERLU DIPERBAHARUI ⚠️';
        badgeEl.style.color = 'var(--danger)';
      }
    }

    setText('sum_docPassport', state.files.passport ? `✓ ${state.files.passport.name}` : '✗ Tiada fail dimuat naik');
    setText('sum_docReceipt', state.files.receipt ? `✓ ${state.files.receipt.name}` : '✗ Tiada fail dimuat naik');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '-';
  }

  function showError(id, inputEl, message) {
    const err = document.getElementById(id);
    if (err) {
      if (message) err.textContent = message;
      err.style.display = 'block';
    }
    if (inputEl) {
      inputEl.classList.add('is-invalid');
      inputEl.focus();
    }
  }

  function clearError(id, inputEl) {
    const err = document.getElementById(id);
    if (err) err.style.display = 'none';
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    }
  }

  // =========================================================================
  // 7. PENGHANTARAN BORANG PANTAS (LANGKAH 1)
  // =========================================================================
  if (btnQuickSubmit) {
    btnQuickSubmit.addEventListener('click', () => {
      if (!validateStep1()) return;

      const fullName = fullNameInput ? fullNameInput.value.trim().toUpperCase() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const randomCode = 'VAL-' + Math.floor(100000 + Math.random() * 900000);
      const submissionTime = new Date().toLocaleString('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const submissionRecord = {
        code: randomCode,
        fullName: fullName,
        phone: phone,
        isFullForm: false,
        status: 'PENDING_REVIEW',
        submittedAt: submissionTime,
        notes: 'Pendaftaran pantas (Nama & Telefon). Pegawai akan menghubungi untuk pengumpulan maklumat pasport.'
      };

      saveSubmission(submissionRecord);
      latestSubmissionRecord = submissionRecord;

      // Paparkan Modal Kejayaan
      if (modalTitle) modalTitle.textContent = 'Pendaftaran Pantas Diterima!';
      if (modalSubtitle) modalSubtitle.textContent = 'Maklumat asas anda telah selamat diterima ke dalam pangkalan data Andalusia.';
      if (modalSlipCode) modalSlipCode.textContent = randomCode;
      if (modalApplicantName) modalApplicantName.textContent = fullName;
      if (modalApplicantPhone) modalApplicantPhone.textContent = phone;
      if (modalTypeBadge) modalTypeBadge.textContent = 'PENDAFTARAN PANTAS (NAMA & NO TELEFON)';
      if (modalNotesDesc) {
        modalNotesDesc.textContent = 'Pegawai khidmat pelanggan Andalusia akan menghubungi anda melalui WhatsApp atau panggilan dalam tempoh 1-2 hari bekerja.';
      }
      if (successModal) successModal.classList.add('active');
    });
  }

  // =========================================================================
  // 8. PENGHANTARAN BORANG LENGKAP (LANGKAH 5)
  // =========================================================================
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const declarationCheck = document.getElementById('declarationCheck');
      const declarationError = document.getElementById('declarationError');
      if (declarationCheck && !declarationCheck.checked) {
        if (declarationError) declarationError.style.display = 'block';
        alert('Sila tandakan kotak perakuan dan persetujuan PDPA sebelum menghantar borang.');
        return;
      }
      if (declarationError) declarationError.style.display = 'none';

      const randomCode = 'VAL-' + Math.floor(100000 + Math.random() * 900000);
      const submissionTime = new Date().toLocaleString('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const selectedGender = document.querySelector('input[name="gender"]:checked');
      const pkgOption = packageSelect && packageSelect.options[packageSelect.selectedIndex];
      const branchOption = branchSelect && branchSelect.options[branchSelect.selectedIndex];
      const roomOption = roomSelect && roomSelect.options[roomSelect.selectedIndex];

      const submissionRecord = {
        code: randomCode,
        isFullForm: true,
        fullName: fullNameInput ? fullNameInput.value.trim().toUpperCase() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        icNumber: icNumberInput ? icNumberInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        gender: selectedGender ? selectedGender.value : 'LELAKI',
        birthDate: birthDateInput ? birthDateInput.value : '',
        emergencyName: emergencyNameInput ? emergencyNameInput.value.trim() : '',
        emergencyPhone: emergencyPhoneInput ? emergencyPhoneInput.value.trim() : '',
        emergencyRel: emergencyRelInput ? emergencyRelInput.value : '',
        bookingRef: bookingRefInput ? bookingRefInput.value.trim() : 'AND-2026-8801',
        packageId: packageSelect ? packageSelect.value : '1',
        packageName: pkgOption ? pkgOption.text : 'Pakej Umrah Andalusia',
        departureDate: departureDateInput ? departureDateInput.value : '',
        branchName: branchOption ? branchOption.text : 'Ibu Pejabat Desa Pandan, KL',
        roomType: roomOption ? roomOption.text : 'Bilik Berempat (Quad)',
        specialNeeds: specialNeedsInput ? specialNeedsInput.value.trim() : 'Tiada',
        passportNumber: passportNumberInput ? passportNumberInput.value.trim().toUpperCase() : '',
        passportExpiry: passportExpiryInput ? passportExpiryInput.value : '',
        passportValid: state.isPassportValid,
        docPassport: state.files.passport ? state.files.passport.name : null,
        docReceipt: state.files.receipt ? state.files.receipt.name : null,
        status: 'PENDING_REVIEW',
        submittedAt: submissionTime,
        notes: 'Borang validasi dokumen lengkap diterima. Menunggu semakan pasport dan visa pegawai.'
      };

      saveSubmission(submissionRecord);
      latestSubmissionRecord = submissionRecord;

      // Paparkan Modal Kejayaan
      if (modalTitle) modalTitle.textContent = 'Borang Validasi Berjaya Dihantar!';
      if (modalSubtitle) modalSubtitle.textContent = 'Maklumat dan dokumen anda telah selamat diterima ke dalam sistem pangkalan data Andalusia.';
      if (modalSlipCode) modalSlipCode.textContent = randomCode;
      if (modalApplicantName) modalApplicantName.textContent = submissionRecord.fullName;
      if (modalApplicantPhone) modalApplicantPhone.textContent = submissionRecord.phone;
      if (modalTypeBadge) modalTypeBadge.textContent = 'PENDAFTARAN VALIDASI DOKUMEN LENGKAP';
      if (modalNotesDesc) {
        modalNotesDesc.textContent = 'Pegawai operasi cawangan akan menyemak dokumen dan pasport anda dalam tempoh 1-2 hari bekerja. Anda boleh membaca slip PDF atau menyemak status permohonan.';
      }
      if (successModal) successModal.classList.add('active');
    });
  }

  function saveSubmission(record) {
    const existing = JSON.parse(localStorage.getItem('vali_lusia_submissions') || '[]');
    existing.unshift(record);
    localStorage.setItem('vali_lusia_submissions', JSON.stringify(existing));
  }

  // =========================================================================
  // 9. TINDAKAN MODAL & BACA / MUAT TURUN PDF (PDF POST-SUBMISSION ACTIONS)
  // =========================================================================

  // Butang Baca Borang PDF (Membuka In-Modal PDF Reader)
  if (btnViewPdfModal) {
    btnViewPdfModal.addEventListener('click', () => {
      const recordToView = latestSubmissionRecord || {
        code: modalSlipCode ? modalSlipCode.textContent : 'VAL-882194',
        fullName: modalApplicantName ? modalApplicantName.textContent : 'Jemaah Andalusia',
        phone: modalApplicantPhone ? modalApplicantPhone.textContent : '-'
      };

      if (window.PdfService) {
        window.PdfService.openModal(recordToView);
      } else {
        alert('Enjin PDF sedang dimuatkan, sila cuba sebentar lagi.');
      }
    });
  }

  // Butang Muat Turun Fail PDF
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      const recordToDownload = latestSubmissionRecord || {
        code: modalSlipCode ? modalSlipCode.textContent : 'VAL-882194',
        fullName: modalApplicantName ? modalApplicantName.textContent : 'Jemaah Andalusia',
        phone: modalApplicantPhone ? modalApplicantPhone.textContent : '-'
      };

      if (window.PdfService) {
        window.PdfService.downloadPdf(recordToDownload);
      } else {
        alert('Enjin PDF sedang dimuatkan, sila cuba sebentar lagi.');
      }
    });
  }

  // Butang Cetak Slip
  if (btnPrintSlip) {
    btnPrintSlip.addEventListener('click', () => {
      window.print();
    });
  }

  // Tutup Modal & Navigasi ke Status Permohonan
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('active');
      window.location.href = 'status.html';
    });
  }

  // Inisialisasi awal
  updateStepUI(1);
  checkPassportValidity();
});
