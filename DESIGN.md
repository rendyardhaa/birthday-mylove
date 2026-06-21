# UI/UX & Architecture Design Document: Birthday Surprise Web
*Diperbarui: 21 Juni 2026*

---

## 1. Design System & Global Principles

Konsep visual menggunakan pendekatan **"Ethereal Bloom"** — dari awal yang hangat, lembut seperti kertas surat lama, hingga berakhir gelap dan sinematik di galeri kenangan.

**Prinsip Utama Layout: Full Immersion (No Navbar)**
Website dirancang *fullscreen* tanpa Navbar, Header, maupun Footer. Navigasi hanya bisa dilakukan melalui interaksi yang sudah ditentukan (menunggu *countdown*, mengklik amplop, menekan tombol *Next*).

---

### 1.1. Color Palette

**Light Mode (Page 1: Countdown & Page 2: Mailbox)**

| Peran | Hex | Nama |
|---|---|---|
| `--primary-bg` | `#FDF6F0` | Warm Ivory — bukan putih polos, hangat |
| `--bg-gradient-top` | `#FEF0F4` | Blush pink atas |
| `--bg-gradient-btm` | `#F9EEF5` | Lavender blush bawah |
| `--primary-accent` | `#C9707A` | **Dusty Rose** — romantis, muted, tidak harsh |
| `--accent-soft` | `#E8A0A8` | Soft petal pink |
| `--accent-lighter` | `#F2C4C8` | Barely-there blush |
| `--accent-deep` | `#9B545C` | Deep mauve untuk depth |
| `--accent-gold` | `#D4A96A` | **Champagne gold** — bukan kuning neon |
| `--primary-text` | `#5C3344` | Plum — hangat, tidak harsh |
| `--text-muted` | `#9B7080` | Muted mauve |

> **Perubahan dari versi sebelumnya:** Warna `#E11D48` (rose merah cerah) diganti dengan `#C9707A` (dusty rose muted) sebagai aksen utama. Warna emas `#F4D03F` diganti `#D4A96A` (champagne gold). Ini menghasilkan tampilan yang lebih *romantic* dan tidak melelahkan mata.

**Dark Mode (Page 3: Gallery)**

| Peran | Hex | Nama |
|---|---|---|
| `--gallery-bg` | `#12100E` | Near-black warm undertone |
| `--card-bg` | `#1E1A18` | Warm dark card |
| `--text-light` | `#F5EEE8` | Off-white with warm tint |

---

### 1.2. Typography

Pemilihan font menggunakan tiga level hierarki untuk menciptakan kedalaman visual:

| Level | Font | Kegunaan |
|---|---|---|
| **Script / Magical** | `Great Vibes` (cursive) | Judul hero kenangan, eyebrow text, subtitle romantis |
| **Elegant Serif** | `Cormorant Garamond` (light italic) | Angka countdown, judul halaman utama |
| **Display Serif** | `Playfair Display` (italic) | Section titles di gallery |
| **Body / Clean** | `Lato` (light, italic) | Isi surat, caption, label — bersih & airy |

**Mengapa ini lebih baik dari sebelumnya?**
- `Inter` sebelumnya terlalu *corporate* dan dingin untuk tema romantis.
- `Great Vibes` memberikan kesan kaligrafi yang dreamy dan personal.
- `Cormorant Garamond` jauh lebih elegan untuk display text daripada `Playfair Display` bold biasa — weight 300 italic terasa seperti puisi.
- `Lato` light italic di body teks surat memberikan kesan tulisan tangan yang lembut.

---

### 1.3. Romantic Visual Effects & Styling

**Background Texture**
- Bukan flat color — menggunakan `radial-gradient` berlapis dengan tiga warna warm yang bergeser halus, menciptakan efek seperti cahaya senja yang romantic.

**Floral Ornaments**
- Menggunakan SVG bunga di keempat sudut layar.
- Warna petal: **muted dusty rose** (`#D4888F`, `#E8A0A8`) — bukan merah cerah.
- Warna daun: **sage green** (`#6B8F71`, `#95B99A`) — bukan hijau neon.
- Animasi `gentleSway`: rotasi ±2.5° dengan scale halus, 10–13 detik.
- Opacity keseluruhan dikurangi ke 0.72 agar terasa seperti watercolor, bukan clip art.

**Time Block (Countdown)**
- Menggunakan efek **glassmorphism**: `background: rgba(255,255,255,0.55)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(201,112,122,0.18)`.
- Box-shadow dengan warna rose yang soft, bukan hitam.

**Sparkle Decorations**
- Menggunakan karakter `✦` (bintang 4 titik) berwarna champagne gold — bukan titik bulat.
- Drop shadow gold untuk efek berpendar lembut.

**Letter / Surat**
- Background: gradient warm ivory `#FFFDF9` ke `#FDF0EC` — terasa seperti kertas surat tua.
- Border: 1px solid halus, bukan dashed (lebih elegan).
- Inner border: pseudo-element ::before dengan garis tipis 1px rose di dalam card.
- Top accent: garis gradien tipis 5px di atas card (seperti pita surat).
- Background-image: subtle ruled-paper lines.
- Teks surat: Lato 300 weight italic — seperti tulisan tangan.
- Judul "Untukmu," menggunakan `Great Vibes` 2.8rem.

**CTA Button**
- Gradient dari `--accent-deep` ke `--primary-accent` ke `--accent-soft` — tiga warna rose yang harmonis.
- Text uppercase dengan letter-spacing 0.14em — terasa premium.
- Spring bounce animation on hover (`cubic-bezier(0.34,1.56,0.64,1)`).

**Hero Banner (Gallery)**
- `Great Vibes` 5rem dengan warm text-shadow rose — lebih dreamy dari Playfair Display bold.
- Subtitle: Lato 300 uppercase dengan letter-spacing lebar.
- Background hero: gradient dari `#1A0D12` (near black warm) → sinematik.
- Subtle `heroPulse` animation: radial glow rose di belakang konten.

---

## 2. Component Architecture & State Flow

**Global States:**
- `VIEW_STATE`: `COUNTDOWN` | `MAILBOX_IDLE` | `MAILBOX_OPENED` | `GALLERY`

### Stage 1: The Anticipation (Countdown)
- **Layout**: Center aligned, fullscreen. Bunga sage & dusty rose di sudut.
- **Eyebrow text**: `Great Vibes` italic — *"sesuatu yang spesial menantimu..."*
- **Judul**: `Cormorant Garamond` 300 italic — *"A Birthday Surprise"*
- **Time blocks**: Glassmorphism cards dengan angka `Cormorant Garamond`.
- **Subtitle bawah**: `Great Vibes` — *"dengan sepenuh hati, untukmu"*
- **Trigger**: `timeRemaining === 0` → fade out → `MAILBOX_IDLE`

### Stage 2: The Surprise (Mailbox & Letter)
- **Background**: Radial gradient dreamy (blush → ivory → lavender blush).
- **Mailbox SVG**: Dusty rose yang lebih dalam (`#D4888F` → `#A8666E`).
- **Flow**:
  1. **Idle**: Amplop mengambang naik-turun (breathing effect + drop shadow rose).
  2. **Click**: Fountain fireworks sparkle gold & rose, amplop terbang keluar.
  3. **Letter reveal**: Card muncul dengan spring animation.
  4. **Typewriter**: Teks diketik dengan Lato 300 italic.
  5. **CTA**: Button fade-in dari bawah.

### Stage 3: The Journey (Gallery)
- **Transisi**: Background berubah dari warm ivory ke `#12100E`.
- **Hero**: `Great Vibes` title dengan rose glow animation.
- **Memory rows**: Horizontal scroll, card dengan warm dark background.
- **Hover**: Spring scale + rose border glow + italic caption slide up.

---

## 3. Verification Checklist

- [ ] Font `Great Vibes`, `Cormorant Garamond`, `Lato` loaded via Google Fonts
- [ ] CSS custom properties terdefinisi di `:root`
- [ ] Countdown transition ke mailbox berjalan mulus
- [ ] Letter animation tidak broken di mobile
- [ ] Dark mode gallery readable
- [ ] `prefers-reduced-motion` respected