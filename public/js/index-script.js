/* ── File handling ─────────────────────── */
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) showPreview(file);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById("file-input").files = dt.files;
    showPreview(file);
  }
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("preview-img").src = e.target.result;
    document.getElementById("preview-area").classList.add("show");
    document.getElementById("dropzone").style.display = "none";
  };
  reader.readAsDataURL(file);
}

function clearPreview() {
  document.getElementById("preview-img").src = "";
  document.getElementById("preview-area").classList.remove("show");
  document.getElementById("dropzone").style.display = "";
  ["file-input", "camera-input"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ── Loading & Modal Controls ─────────────────────── */
const loadSteps = [
  "Membaca tulisan di nota...",
  "Mengaudit semua perhitungan...",
  "Menyiapkan data untuk file Excel...",
];
let loadInterval = null;

// Intersepsi Form Submit menggunakan AJAX Fetch
document
  .getElementById("upload-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("file-input");
    const cameraInput = document.getElementById("camera-input");

    let selectedFile = fileInput.files[0] || cameraInput.files[0];

    if (!selectedFile) {
      const dz = document.getElementById("dropzone");
      dz.style.boxShadow = "0 0 0 2px rgba(239, 68, 68, 0.6)";
      setTimeout(() => (dz.style.boxShadow = ""), 1500);
      return;
    }

    // 1. Tampilkan Loading
    startLoadingEffect();

    const formData = new FormData();
    formData.append("financialRecordFile", selectedFile);

    try {
      // 2. Kirim data
      const response = await fetch("/api/v1/audit-catatan", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // 3. Ambil response sebagai BLOB (karena isinya file Excel, bukan JSON)
        const blob = await response.blob();

        // Buat URL sementara untuk file tersebut
        const downloadUrl = window.URL.createObjectURL(blob);

        stopLoadingEffect();

        // 4. Tampilkan Modal Sukses & Pasang link ke tombol download
        const downloadBtn = document.getElementById("download-link");
        downloadBtn.href = downloadUrl;
        downloadBtn.download = "Catat_Digital.xlsx"; // Nama file saat didownload

        document.getElementById("result-modal").classList.add("active");

        // Opsional: Karena server mengirim file biner, kita tidak bisa ambil data total/selisih
        // kecuali server mengirimnya via Custom Headers. Untuk sementara kita sembunyikan summary-box-nya.
        document.querySelector(".audit-summary-box").style.display = "none";
        document.getElementById("res-notes").textContent =
          "File laporan Excel berhasil dibuat. Silakan klik tombol di bawah untuk mengunduh.";
      } else {
        // Jika status code bukan 2xx (misal 400 atau 500)
        stopLoadingEffect();
        openErrorModal(
          `Gagal memproses file. Pastikan file yang diunggah adalah nota keuangan yang valid dan terlihat dengan jelas.`,
        );
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      stopLoadingEffect();
      openErrorModal("Terjadi kesalahan jaringan atau server tidak merespon.");
    }
  });

function startLoadingEffect() {
  const overlay = document.getElementById("loading-overlay");
  overlay.classList.add("active");

  // Reset Stepper ke keadaan awal
  document.getElementById("si-2").classList.remove("done");
  document.getElementById("si-2").classList.add("active");
  document.getElementById("si-3").classList.remove("active");

  // Reset progress bar animation
  const fill = document.getElementById("prog-fill");
  fill.style.animation = "none";
  fill.offsetHeight; // force reflow
  fill.style.animation = "";

  let i = 0;
  const title = document.getElementById("load-title");
  title.textContent = loadSteps[0];

  loadInterval = setInterval(() => {
    i++;
    if (i < loadSteps.length) {
      title.style.opacity = "0";
      setTimeout(() => {
        title.textContent = loadSteps[i];
        title.style.opacity = "1";
      }, 280);

      if (i === 1) {
        document.getElementById("si-2").classList.remove("active");
        document.getElementById("si-2").classList.add("done");
        document.getElementById("si-3").classList.add("active");
      }
    }
  }, 2200); // Penyesuaian waktu transisi teks biar selaras dengan progress bar
}

function stopLoadingEffect() {
  if (loadInterval) clearInterval(loadInterval);
  document.getElementById("loading-overlay").classList.remove("active");
}

/* ── Modal Trigger Functions ─────────────────────── */
function openResultModal(data) {
  // Parsing angka ke dalam format Rupiah terformat standar lokal
  document.getElementById("res-total").textContent = new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(data.audit.total_calculated);

  document.getElementById("res-discrepancy").textContent =
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(data.audit.detected_discrepancy);

  document.getElementById("res-notes").textContent = data.audit.notes;

  // Pasang link unduh laporan berdasarkan response file dari backend.
  // Catatan: Pastikan backend mengirim properti seperti `downloadUrl` atau `fileUrl` di objek datanya.
  const downloadBtn = document.getElementById("download-link");
  if (data.downloadUrl) {
    downloadBtn.href = data.downloadUrl;
    downloadBtn.style.display = "inline-flex";
  }
  document.getElementById("result-modal").classList.add("active");
}

function closeResultModal() {
  document.getElementById("result-modal").classList.remove("active");
  clearPreview();
}

function openErrorModal(message) {
  document.getElementById("error-message").textContent = message;
  document.getElementById("error-modal").classList.add("active");
}

function closeErrorModal() {
  document.getElementById("error-modal").classList.remove("active");
}

/* ── Intersection Observer fade-up ─────── */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".fade-up").forEach((el) => io.observe(el));
