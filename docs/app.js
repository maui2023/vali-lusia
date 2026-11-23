/**
 * Vali-Lusia: Logik Frontend Borang Pendaftaran Ringkas Jemaah
 * Andalusia Travel & Tours
 * Mengendalikan pengesahan hanya untuk Nama Penuh dan No. Telefon.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('simpleForm');
  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');

  const successModal = document.getElementById('successModal');
  const modalSlipCode = document.getElementById('modalSlipCode');
  const modalApplicantName = document.getElementById('modalApplicantName');
  const modalApplicantPhone = document.getElementById('modalApplicantPhone');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnPrintSlip = document.getElementById('btnPrintSlip');

  // Format telefon automatik (cth: 012-3456789)
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/[^\d+]/g, '');
      
      // Jika nombor tempatan Malaysia yang bermula dengan 01
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

      if (phoneInput.classList.contains('is-invalid')) {
        phoneInput.classList.remove('is-invalid');
        if (phoneError) phoneError.style.display = 'none';
      }
    });
  }

  // Auto-uppercase untuk nama
  if (fullNameInput) {
    fullNameInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (fullNameInput.classList.contains('is-invalid')) {
        fullNameInput.classList.remove('is-invalid');
        if (nameError) nameError.style.display = 'none';
      }
    });
  }

  // Pengendali Penghantaran Borang
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = fullNameInput ? fullNameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      let isValid = true;

      // 1. Validasi Nama Penuh
      if (!fullName || fullName.length < 3) {
        if (fullNameInput) fullNameInput.classList.add('is-invalid');
        if (nameError) {
          nameError.textContent = 'Sila masukkan nama penuh anda (sekurang-kurangnya 3 huruf).';
          nameError.style.display = 'block';
        }
        isValid = false;
      } else {
        if (fullNameInput) {
          fullNameInput.classList.remove('is-invalid');
          fullNameInput.classList.add('is-valid');
        }
        if (nameError) nameError.style.display = 'none';
      }

      // 2. Validasi Nombor Telefon
      const cleanDigits = phone.replace(/\D/g, '');
      if (!phone || cleanDigits.length < 9 || cleanDigits.length > 14) {
        if (phoneInput) phoneInput.classList.add('is-invalid');
        if (phoneError) {
          phoneError.textContent = 'Sila masukkan nombor telefon yang sah (antara 9 hingga 14 digit).';
          phoneError.style.display = 'block';
        }
        isValid = false;
      } else {
        if (phoneInput) {
          phoneInput.classList.remove('is-invalid');
          phoneInput.classList.add('is-valid');
        }
        if (phoneError) phoneError.style.display = 'none';
      }

      if (!isValid) return;

      // Jana kod rujukan unik rawak (cth: VAL-882194)
      const randomCode = 'VAL-' + Math.floor(100000 + Math.random() * 900000);
      const submissionTime = new Date().toLocaleString('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Simpan ke LocalStorage untuk rujukan status semakan dan portal pegawai
      const submissionRecord = {
        code: randomCode,
        fullName: fullName,
        phone: phone,
        status: 'PENDING_REVIEW',
        submittedAt: submissionTime
      };

      const existingRecords = JSON.parse(localStorage.getItem('vali_lusia_submissions') || '[]');
      existingRecords.unshift(submissionRecord);
      localStorage.setItem('vali_lusia_submissions', JSON.stringify(existingRecords));

      // Kemaskini dan buka modal kejayaan
      if (modalSlipCode) modalSlipCode.textContent = randomCode;
      if (modalApplicantName) modalApplicantName.textContent = fullName;
      if (modalApplicantPhone) modalApplicantPhone.textContent = phone;
      if (successModal) successModal.classList.add('active');
    });
  }

  // Tutup Modal & Navigasi ke Status
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('active');
      window.location.href = 'status.html';
    });
  }

  // Butang Cetak Slip
  if (btnPrintSlip) {
    btnPrintSlip.addEventListener('click', () => {
      window.print();
    });
  }
});
