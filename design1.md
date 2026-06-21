# UI/UX & Architecture Design Document: Birthday Surprise Web (v2)

## 0. Project Brief & Personalization Checklist

Sebelum development dimulai, siapkan data berikut — ini "variable" yang akan mengisi semua halaman, jadi lebih enak disiapkan duluan daripada nyari-nyari pas lagi coding.

| Data | Contoh | Dipakai di |
|---|---|---|
| Nama panggilan pasangan | "Sayang" / nama asli | Surat, judul halaman |
| Tanggal & jam target (ulang tahun) | `2026-07-15T00:00:00+07:00` | Countdown |
| Tanggal jadian (opsional) | `2022-03-10` | Counter "X hari bersama" |
| Isi surat / pesan utama | Teks ucapan | Stage 2: Letter Reveal |
| Pesan penutup | Kalimat pamungkas | Stage 4: The Promise |
| Foto/video hero | 1 file, landscape, terbaik | Hero Banner |
| Foto per kategori memori | min. 4–6 per baris | Memory Rows |
| Caption tiap foto | 1 kalimat romantis | Card hover/tap |
| Musik latar (opsional) | mp3 instrumental / "lagu kalian" | Background audio |

> **Catatan teknis:** simpan `targetDate` dalam format ISO dengan timezone eksplisit (`+07:00` untuk WIB). Kalau cuma `2026-07-15T00:00:00`, browser bisa salah interpretasi timezone kalau penerima bukanya dari device/lokasi lain — countdown bisa meleset beberapa jam.

---

## 1. Design System & Global Principles

Konsep visual tetap **"Ethereal to Cinematic"** — light & soft di halaman awal, bertransisi gelap & sinematik di halaman akhir.

**Prinsip Utama Layout: Full Immersion (No Navbar)**
Tidak ada *Navbar*, *Header*, maupun *Footer* di seluruh halaman. *User* hanya bisa bernavigasi maju lewat interaksi yang ditentukan (menunggu *countdown*, klik amplop, tombol *Next*). Ini pilihan yang kuat untuk format storytelling linear seperti ini — dipertahankan.

### 1.1. Color Palette (Hex Codes)

**Light Mode (Page 1: Countdown & Page 2: Mailbox)**
- `Primary Background`: `#FDFBF7` (Warm Alabaster)
- `Primary Accent`: `#E5989B` (Muted Dusty Rose)
- `Secondary Accent`: `#B5838D` (Deep Mauve) — *hover*/bayangan
- `Primary Text`: `#2B2D42` (Charcoal Navy)

**Dark Mode (Page 3 & 4: Memories / Netflix Style)**
- `Gallery Background`: `#141414` (Netflix Dark)
- `Card Background`: `#2F2F2F` (Soft Charcoal)
- `Text Light`: `#F5F5F1` (Off-white)

**Kontras teks:** pastikan rasio minimal 4.5:1 (WCAG AA). `#2B2D42` di atas `#FDFBF7` sudah aman. Untuk teks caption di atas foto (Stage 3), selalu pakai gradient overlay gelap di bawah teks — bukan alpha flat — supaya tetap terbaca walau fotonya terang.

**Signature moment (saran):** palette cream + dusty-rose ini enak dilihat tapi mirip dengan "default" banyak landing page AI-generated. Biar tetap berasa personal & bukan template, pilih satu elemen visual yang jadi "tanda tangan" halaman ini — contoh: efek *wax seal* di amplop yang meleleh terbuka saat diklik, atau satu kalimat kunci di surat yang muncul dengan efek *ink bleed* (tinta menyebar halus) sebelum tulisan terbentuk sempurna. Cukup satu momen saja yang dibuat istimewa — sisanya biarkan tenang.

### 1.2. Typography
- **Heading & Display:** `Playfair Display` atau `Cormorant Garamond` (Serif).
- **Body & UI Elements:** `Inter` atau `Montserrat` (Sans-Serif).
- Load via Google Fonts dengan `font-display: swap`, dan **preload** font yang dipakai di Stage 2 — supaya efek *typewriter* nggak "lompat" pas font baru selesai dimuat.

### 1.3. Romantic Visual Effects & Styling
- **Floral Ornaments:** SVG bunga di sudut layar, animasi *Gentle Sway* (rotasi 1–2°, looping halus).
- **Fountain Fireworks:** partikel *sparkle* halus warna `Soft Gold` (`#F4D03F`) + `Dusty Rose` (`#E5989B`), memancar dari lubang kotak surat ke atas lalu jatuh memudar dengan *gravity* yang smooth.
- **Shadows & Corners:** `12px` rounded + `box-shadow` halus untuk efek *floating*.
- **Motion sensitivity:** hormati `prefers-reduced-motion`. Kalau aktif, downgrade sway/fireworks/parallax ke versi statis atau lebih simpel — bukan cuma soal aksesibilitas, tapi partikel SVG yang banyak juga bisa nge-lag di HP low-end.

### 1.4. Sound Design (Baru)
- **Ambient:** musik latar instrumental, mulai *muted* lalu *fade-in* volume setelah interaksi pertama (klik amplop) — browser modern memblokir autoplay bersuara sebelum ada gesture dari user.
- **SFX:** suara kertas/amplop dibuka saat Stage 2 trigger, *chime* lembut saat fireworks muncul, *whoosh* halus saat transisi ke Stage 3.
- Sediakan toggle mute kecil (ikon speaker) di pojok — reachable tapi nggak mengganggu fullscreen immersion.

---

## 2. Component Architecture & State Flow

**Global States:**
`VIEW_STATE`: `COUNTDOWN` → `MAILBOX_IDLE` → `MAILBOX_OPENED` → `GALLERY` → `FINALE`

**Persistence:** simpan progress di `localStorage` (mis. key `bday_surprise_state`) supaya refresh tidak mengulang dari nol secara tidak sengaja. Atau, kalau "nonton ulang dari awal" justru dianggap charm tersendiri, biarkan reset — ini keputusan desain, bukan bug, jadi tentukan eksplisit salah satunya.

### Stage 1: The Anticipation (Countdown Page)
- **Layout**: *Center aligned*, *fullscreen*. Bunga estetik bergerak halus di sudut layar.
- **Komponen**: `<CountdownTimer targetDate={DATE} />`
- **Tambahan opsional:** counter kecil "X hari kita bersama" di bawah countdown utama (pakai tanggal jadian dari Section 0) — detail personal kecil yang biasanya paling nempel di hati penerima.
- **Trigger**: saat `timeRemaining === 0`, *fade out* layar perlahan → state `MAILBOX_IDLE`.

### Stage 2: The Surprise (Mailbox & Letter Page)
- **Layout**: *Center aligned*, *fullscreen*. Mailbox proporsional di tengah.
- **Flow**:
  1. **Idle**: amplop muncul sedikit di lubang, animasi *breathing* halus.
  2. **Trigger (Click/Tap)**: `<FountainFireworks />` memancar dari kotak surat; `<Envelope />` melayang ke tengah dan membesar (`scale: 1.5`).
  3. **Letter Reveal**: amplop terbuka, kertas ditarik keluar, teks diketik *typewriter*.
  4. **CTA**: tombol "Buka Kenangan Kita" *fade-in* setelah teks selesai — beri delay 300–500ms sebelum tombol muncul, biar momen "selesai membaca" terasa dulu, bukan buru-buru ke tombol.
- **Mobile note:** ganti istilah "hover" jadi tap-based state; pastikan target tap amplop minimal 44×44px.

### Stage 3: The Journey (Netflix-Style Memories Page)
- **Transisi**: background dari terang ke `#141414`.
- **Layout**:
  - `Hero Banner`: 100% width, 60vh, dark gradient overlay. Kalau pakai video: *muted* by default + poster image fallback untuk koneksi lambat.
  - `Memory Rows`: horizontal scroll tanpa scrollbar terlihat.
- **Interaksi Card**: hover/tap → foto membesar halus, sedikit gelap, caption muncul dari bawah dalam frame.
- **Teknis:**
  - Lazy-load gambar di luar viewport (`loading="lazy"` / Intersection Observer) — galeri foto biasanya berat, jangan load semua sekaligus.
  - Horizontal scroll mobile pakai native touch (`overflow-x: auto` + `scroll-snap-type`), hindari custom JS scroll yang berasa lag di HP.

### Stage 4: The Promise (Closing Scene) — Baru
Dokumen sebelumnya berhenti di galeri tanpa penutup — padahal ini momen paling penting untuk web romantis. Tambahkan akhir yang jelas secara emosional:
- Setelah baris memori terakhir, muncul tombol kecil "Ada satu hal lagi..." atau auto-trigger.
- Transisi: layar fade ke gelap total sebentar → pesan penutup pribadi (dari Section 0) muncul, tipografi besar serif, reveal satu kalimat per satu — beda rhythm dari typewriter Stage 2.
- Efek visual: kelopak bunga jatuh perlahan (`falling petals`, beda dari sparkle Stage 2 — svg kelopak, soft gold/dusty rose, jatuh dengan rotasi acak halus).
- CTA penutup opsional: "Putar ulang dari awal", atau kalau ada hadiah/surprise fisik, hint lokasi/instruksi singkat di sini.

---

## 3. Technical & Implementation Notes (Baru)

- **Stack**: untuk kompleksitas ini, vanilla HTML/CSS/JS + **GSAP** (animasi timeline presisi) sudah cukup dan ringan, mudah di-hosting di Netlify/Vercel/GitHub Pages. Kalau mau lebih maintainable jangka panjang (banyak foto, sering update), React + Framer Motion juga cocok.
- **Performance**: compress semua foto/video sebelum upload (WebP, target <300KB per foto galeri). Preload hanya asset Stage 1 di awal; lazy-load sisanya.
- **Accessibility minimum**: alt text di semua gambar (isi dengan caption romantisnya — sekalian berguna untuk screen reader), focus state yang visible di tombol CTA, hormati `prefers-reduced-motion`.
- **Responsive**: desain mobile-first — mayoritas penerima kemungkinan buka dari HP. Test di ~375px, ~768px, ~1280px+.
- **Timezone**: simpan target date dengan offset eksplisit (lihat Section 0).

---

## 4. Content & Asset Checklist (Quick Prep List)

- [ ] Tanggal & jam target ulang tahun (dengan timezone)
- [ ] Tanggal jadian (kalau mau pakai counter "hari bersama")
- [ ] Teks surat lengkap (Stage 2)
- [ ] Teks pesan penutup (Stage 4)
- [ ] 1 foto/video hero terbaik
- [ ] Minimal 3 kategori memori ("First Dates", "Random Moments", dst), masing-masing 4–6 foto
- [ ] Caption singkat tiap foto (1 kalimat)
- [ ] Musik latar (opsional, mp3, idealnya instrumental/"lagu kalian")
