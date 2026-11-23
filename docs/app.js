/**
 * Vali-Lusia: Logik Frontend & Validasi Borang Travel Andalusia
 * Menyokong: Pengesahan MyKad Malaysia, Peraturan Pasport 6 Bulan,
 * Multi-Step Form Wizard, Pratonton Muat Naik Fail, & Simpanan Tempatan (Mock).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi State Aplikasi
  const state = {
    currentStep: 1,
    totalSteps: 4,
    formData: {
      fullName: '',
      icNumber: '',
      phone: '',
      email: '',
      gender: 'LELAKI',
      birthDate: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRel: '',
      bookingRef: 'AND-2026-8801',
      packageId: '1',
      packageName: 'Pakej Umrah Cuti Sekolah Disember 2026 (12H 10M)',
      departureDate: '2026-12-18',
      branchId: 'BR-HQ',
      branchName: 'Ibu Pejabat Desa Pandan, KL',
      roomType: 'QUAD',
      specialNeeds: '',
      passportNumber: '',
      passportExpiry: '',
      files: {
        passport: null,
        mykad: null,
        receipt: null,
        vaccine: null
      }
    }
  };

  // Elemen DOM Teras
  const stepItems = document.querySelectorAll('.step-item');
  const stepContents = document.querySelectorAll('.step-content');
  const progressBar = document.querySelector('.stepper-progress-bar');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnSubmit = document.getElementById('btnSubmit');
  const stepBadge = document.getElementById('stepBadge');
  const stepHeaderTitle = document.getElementById('stepHeaderTitle');

  // Tajuk Setiap Langkah
  const stepTitles = [
    'Langkah 1: Maklumat Peribadi & Jemaah',
    'Langkah 2: Maklumat Pakej & Perjalanan',
    'Langkah 3: Maklumat Pasport & Dokumen Sokongan',
    'Langkah 4: Semakan Ringkasan & Perakuan'
  ];

  // ==========================================================================
  // 1. Validasi Kad Pengenalan Malaysia (MyKad) & Auto-Deteksi
  // ==========================================================================
  const icInput = document.getElementById('icNumber');
  const icHint = document.getElementById('icHint');
  const genderRadios = document.querySelectorAll('input[name="gender"]');
  const birthDateInput = document.getElementById('birthDate');

  if (icInput) {
    icInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, ''); // Ambil nombor sahaja
      if (val.length > 12) val = val.substring(0, 12);
      
      // Auto-format format ######-##-####
      let formatted = val;
      if (val.length > 6 && val.length <= 8) {
        formatted = `${val.substring(0,6)}-${val.substring(6)}`;
      } else if (val.length > 8) {
        formatted = `${val.substring(0,6)}-${val.substring(6,8)}-${val.substring(8)}`;
      }
      e.target.value = formatted;

      // Validasi & Auto-Deteksi Tarikh Lahir & Jantina
      if (val.length === 12) {
        const yearPart = parseInt(val.substring(0, 2), 10);
        const monthPart = parseInt(val.substring(2, 4), 10);
        const dayPart = parseInt(val.substring(4, 6), 10);
        const lastDigit = parseInt(val.substring(11, 12), 10);

        // Anggaran abad (Century)
        const currentYear2Digit = new Date().getFullYear() % 100;
        const fullYear = (yearPart > currentYear2Digit ? 1900 : 2000) + yearPart;

        if (monthPart >= 1 && monthPart <= 12 && dayPart >= 1 && dayPart <= 31) {
          const formattedDOB = `${fullYear}-${String(monthPart).padStart(2, '0')}-${String(dayPart).padStart(2, '0')}`;
          if (birthDateInput) birthDateInput.value = formattedDOB;
          
          // Jantina mengikut digit akhir (Ganjil: Lelaki, Genap: Perempuan)
          const isMale = (lastDigit % 2 !== 0);
          genderRadios.forEach(radio => {
            radio.checked = isMale ? (radio.value === 'LELAKI') : (radio.value === 'PEREMPUAN');
          });

          icInput.classList.remove('is-invalid');
          icInput.classList.add('is-valid');
          if (icHint) {
            icHint.textContent = `✓ Sah: Lahir ${dayPart}/${monthPart}/${fullYear} (${isMale ? 'Lelaki' : 'Perempuan'})`;
            icHint.style.color = 'var(--success)';
          }
        } else {
          icInput.classList.add('is-invalid');
          if (icHint) {
            icHint.textContent = '✗ Format tarikh lahir dalam MyKad tidak sah.';
            icHint.style.color = 'var(--danger)';
          }
        }
      } else {
        icInput.classList.remove('is-valid');
        if (icHint) {
          icHint.textContent = 'Format: 12 digit (cth: 920815-10-6188)';
          icHint.style.color = 'var(--text-muted)';
        }
      }
    });
  }

  // ==========================================================================
  // 2. Peraturan Pasport: Tempoh Sah Minimum 6 Bulan (180 Hari)
  // ==========================================================================
  const passportExpiryInput = document.getElementById('passportExpiry');
  const departureDateInput = document.getElementById('departureDate');
  const passportAlert = document.getElementById('passportAlert');
  const passportAlertText = document.getElementById('passportAlertText');

  function validatePassportValidity() {
    if (!passportExpiryInput || !departureDateInput) return true;

    const expiryVal = passportExpiryInput.value;
    const departureVal = departureDateInput.value;

    if (!expiryVal || !departureVal) {
      if (passportAlert) passportAlert.style.display = 'none';
      return true;
    }

    const expiryDate = new Date(expiryVal);
    const departureDate = new Date(departureVal);

    // Hitung perbezaan dalam hari
    const diffTime = expiryDate.getTime() - departureDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 180) {
      passportExpiryInput.classList.add('is-invalid');
      passportExpiryInput.classList.remove('is-valid');
      if (passportAlert && passportAlertText) {
        passportAlert.className = 'alert-box alert-danger';
        passportAlert.style.display = 'flex';
        passportAlertText.innerHTML = `<strong>Perhatian Kritikal:</strong> Pasport anda hanya sah selama <strong>${diffDays > 0 ? diffDays + ' hari' : 'telah tamat'}</strong> dari tarikh pelepasan (${departureVal}). Syarat imigresen dan penerbangan antarabangsa memerlukan minimum <strong>180 hari (6 bulan)</strong>. Permohonan visa berkemungkinan besar akan ditolak oleh pihak berkuasa Arab Saudi.`;
      }
      return false;
    } else {
      passportExpiryInput.classList.remove('is-invalid');
      passportExpiryInput.classList.add('is-valid');
      if (passportAlert && passportAlertText) {
        passportAlert.className = 'alert-box alert-info';
        passportAlert.style.display = 'flex';
        passportAlertText.innerHTML = `✓ Pasport anda sah selama <strong>${diffDays} hari</strong> dari tarikh penerbangan. Memenuhi syarat piawaian antarabangsa (> 6 bulan).`;
      }
      return true;
    }
  }

  if (passportExpiryInput) {
    passportExpiryInput.addEventListener('change', validatePassportValidity);
  }
  if (departureDateInput) {
    departureDateInput.addEventListener('change', validatePassportValidity);
  }

  // Pakej Selection Auto-Fill Tarikh Pelepasan
  const packageSelect = document.getElementById('packageSelect');
  if (packageSelect) {
    packageSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const depDate = selectedOption.getAttribute('data-departure');
      if (depDate && departureDateInput) {
        departureDateInput.value = depDate;
        validatePassportValidity();
      }
    });
  }

  // ==========================================================================
  // 3. Muat Naik Fail & Drag-and-Drop
  // ==========================================================================
  const dropzones = document.querySelectorAll('.upload-dropzone');

  dropzones.forEach(zone => {
    const fileKey = zone.getAttribute('data-file-key');
    const input = document.getElementById(`fileInput_${fileKey}`);
    const previewCard = document.getElementById(`preview_${fileKey}`);
    const previewName = previewCard ? previewCard.querySelector('.file-name') : null;
    const previewSize = previewCard ? previewCard.querySelector('.file-size') : null;
    const btnRemove = previewCard ? previewCard.querySelector('.btn-remove-file') : null;

    if (!input) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    input.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

    function handleFileSelection(file) {
      // Semakan saiz fail (Maksimum 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`Fail "${file.name}" melebihi had saiz 5MB.`);
        return;
      }

      // Semakan jenis fail
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Format fail "${file.name}" tidak sah. Hanya fail JPG, PNG dan PDF dibenarkan.`);
        return;
      }

      state.formData.files[fileKey] = file;
      if (previewCard && previewName && previewSize) {
        previewName.textContent = file.name;
        previewSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type.split('/')[1].toUpperCase()}`;
        previewCard.style.display = 'flex';
        zone.style.display = 'none';
      }
    }

    if (btnRemove) {
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        state.formData.files[fileKey] = null;
        input.value = '';
        if (previewCard) previewCard.style.display = 'none';
        zone.style.display = 'block';
      });
    }
  });

  // ==========================================================================
  // 4. Kawalan Langkah Borang (Multi-Step Stepper)
  // ==========================================================================
  function updateStepUI() {
    // Kemaskini Stepper Header
    stepItems.forEach((item, index) => {
      const stepNum = index + 1;
      item.classList.remove('active', 'completed');
      if (stepNum === state.currentStep) {
        item.classList.add('active');
      } else if (stepNum < state.currentStep) {
        item.classList.add('completed');
        item.querySelector('.step-circle').innerHTML = '✓';
      } else {
        item.querySelector('.step-circle').textContent = stepNum;
      }
    });

    // Kemaskini garis kemajuan (Progress Bar)
    if (progressBar) {
      const progressPercent = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Papar langkah berkaitan
    stepContents.forEach((content, index) => {
      content.classList.toggle('active', index + 1 === state.currentStep);
    });

    // Kemaskini butang kawalan
    if (btnPrev) btnPrev.style.display = state.currentStep > 1 ? 'inline-flex' : 'none';
    if (btnNext) btnNext.style.display = state.currentStep < state.totalSteps ? 'inline-flex' : 'none';
    if (btnSubmit) btnSubmit.style.display = state.currentStep === state.totalSteps ? 'inline-flex' : 'none';

    // Kemaskini tajuk & lencana
    if (stepBadge) stepBadge.textContent = `Langkah ${state.currentStep} / ${state.totalSteps}`;
    if (stepHeaderTitle) stepHeaderTitle.textContent = stepTitles[state.currentStep - 1];

    // Jika masuk ke Langkah 4, jana ringkasan
    if (state.currentStep === 4) {
      populateReviewSummary();
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function validateCurrentStep() {
    const currentStepEl = document.querySelector(`.step-content[data-step="${state.currentStep}"]`);
    if (!currentStepEl) return true;

    let isValid = true;
    const requiredInputs = currentStepEl.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
      const parentGroup = input.closest('.form-group') || input.parentElement;
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('is-invalid');
        if (parentGroup) parentGroup.classList.add('has-error');
      } else {
        input.classList.remove('is-invalid');
        if (parentGroup) parentGroup.classList.remove('has-error');
      }
    });

    // Validasi khas Langkah 1
    if (state.currentStep === 1) {
      const ic = document.getElementById('icNumber');
      if (ic && ic.value.replace(/\D/g, '').length !== 12) {
        ic.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Validasi khas Langkah 3
    if (state.currentStep === 3) {
      if (!validatePassportValidity()) {
        const confirmProceed = confirm("Amaran: Pasport anda tidak memenuhi syarat sah 6 bulan. Adakah anda tetap ingin meneruskan dan mengemaskini pasport kemudian?");
        if (!confirmProceed) return false;
      }
      // Pastikan pasport dimuat naik
      if (!state.formData.files.passport) {
        alert("Sila muat naik salinan muka surat pasport anda.");
        isValid = false;
      }
    }

    return isValid;
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        saveCurrentStepData();
        if (state.currentStep < state.totalSteps) {
          state.currentStep++;
          updateStepUI();
        }
      } else {
        alert("Sila lengkapkan semua maklumat bertanda bintang (*) dengan tepat sebelum meneruskan.");
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (state.currentStep > 1) {
        state.currentStep--;
        updateStepUI();
      }
    });
  }

  // ==========================================================================
  // 5. Simpan Data Langkah Semasa & Jana Ringkasan Langkah 4
  // ==========================================================================
  function saveCurrentStepData() {
    if (state.currentStep === 1) {
      state.formData.fullName = document.getElementById('fullName')?.value || '';
      state.formData.icNumber = document.getElementById('icNumber')?.value || '';
      state.formData.phone = document.getElementById('phoneNumber')?.value || '';
      state.formData.email = document.getElementById('email')?.value || '';
      state.formData.birthDate = document.getElementById('birthDate')?.value || '';
      state.formData.gender = document.querySelector('input[name="gender"]:checked')?.value || 'LELAKI';
      state.formData.emergencyName = document.getElementById('emergencyName')?.value || '';
      state.formData.emergencyPhone = document.getElementById('emergencyPhone')?.value || '';
      state.formData.emergencyRel = document.getElementById('emergencyRel')?.value || '';
    } else if (state.currentStep === 2) {
      const pkg = document.getElementById('packageSelect');
      state.formData.packageId = pkg?.value || '';
      state.formData.packageName = pkg?.options[pkg.selectedIndex]?.text || '';
      state.formData.departureDate = document.getElementById('departureDate')?.value || '';
      const branch = document.getElementById('branchSelect');
      state.formData.branchId = branch?.value || '';
      state.formData.branchName = branch?.options[branch.selectedIndex]?.text || '';
      state.formData.bookingRef = document.getElementById('bookingRef')?.value || '';
      state.formData.roomType = document.getElementById('roomTypeSelect')?.value || 'QUAD';
      state.formData.specialNeeds = document.getElementById('specialNeeds')?.value || 'Tiada';
    } else if (state.currentStep === 3) {
      state.formData.passportNumber = document.getElementById('passportNumber')?.value || '';
      state.formData.passportExpiry = document.getElementById('passportExpiry')?.value || '';
    }
  }

  function populateReviewSummary() {
    saveCurrentStepData();
    
    // Set teks pada kad ringkasan
    setText('sum_fullName', state.formData.fullName);
    setText('sum_icNumber', state.formData.icNumber);
    setText('sum_phone', state.formData.phone);
    setText('sum_email', state.formData.email);
    setText('sum_gender', state.formData.gender);
    setText('sum_birthDate', state.formData.birthDate);
    setText('sum_emergency', `${state.formData.emergencyName} (${state.formData.emergencyRel} - ${state.formData.emergencyPhone})`);

    setText('sum_bookingRef', state.formData.bookingRef);
    setText('sum_packageName', state.formData.packageName);
    setText('sum_departureDate', state.formData.departureDate);
    setText('sum_branchName', state.formData.branchName);
    setText('sum_roomType', `Bilik ${state.formData.roomType}`);
    setText('sum_specialNeeds', state.formData.specialNeeds || 'Tiada');

    setText('sum_passportNumber', state.formData.passportNumber);
    setText('sum_passportExpiry', state.formData.passportExpiry);

    // Dokumen muat naik
    setText('sum_docPassport', state.formData.files.passport ? `✓ ${state.formData.files.passport.name}` : '✗ Tiada fail');
    setText('sum_docMykad', state.formData.files.mykad ? `✓ ${state.formData.files.mykad.name}` : '✗ Tiada fail');
    setText('sum_docReceipt', state.formData.files.receipt ? `✓ ${state.formData.files.receipt.name}` : '✗ Tiada fail');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '-';
  }

  // ==========================================================================
  // 6. Penghantaran Borang & Modal Pengesahan
  // ==========================================================================
  const validationForm = document.getElementById('validationForm');
  const successModal = document.getElementById('successModal');
  const modalSlipCode = document.getElementById('modalSlipCode');
  const modalApplicantName = document.getElementById('modalApplicantName');
  const modalBookingRef = document.getElementById('modalBookingRef');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnPrintSlip = document.getElementById('btnPrintSlip');

  if (validationForm) {
    validationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const consentCheck = document.getElementById('consentCheck');
      if (!consentCheck || !consentCheck.checked) {
        alert("Sila tandakan kotak persetujuan dan perakuan sebelum menghantar borang.");
        return;
      }

      // Jana kod rujukan rawak unik (cth: VAL-882194)
      const randomCode = 'VAL-' + Math.floor(100000 + Math.random() * 900000);

      // Simpan ke LocalStorage untuk simulasi status semakan
      const submissionRecord = {
        code: randomCode,
        fullName: state.formData.fullName,
        icNumber: state.formData.icNumber,
        bookingRef: state.formData.bookingRef,
        packageName: state.formData.packageName,
        departureDate: state.formData.departureDate,
        branchName: state.formData.branchName,
        passportNumber: state.formData.passportNumber,
        passportExpiry: state.formData.passportExpiry,
        status: 'PENDING_REVIEW',
        submittedAt: new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })
      };

      const existingRecords = JSON.parse(localStorage.getItem('vali_lusia_submissions') || '[]');
      existingRecords.unshift(submissionRecord);
      localStorage.setItem('vali_lusia_submissions', JSON.stringify(existingRecords));

      // Buka modal kejayaan
      if (modalSlipCode) modalSlipCode.textContent = randomCode;
      if (modalApplicantName) modalApplicantName.textContent = state.formData.fullName;
      if (modalBookingRef) modalBookingRef.textContent = state.formData.bookingRef;
      if (successModal) successModal.classList.add('active');
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('active');
      window.location.href = 'status.html';
    });
  }

  if (btnPrintSlip) {
    btnPrintSlip.addEventListener('click', () => {
      window.print();
    });
  }

  // Permulaan
  updateStepUI();
});
