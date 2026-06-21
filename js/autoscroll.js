// ═══════════════════════════════════════════
//  AUTO-SCROLL — Memory Rows (Safari-Safe)
//  JavaScript-calculated width (no max-content)
//  Pixel-based animation for Safari compatibility
// ═══════════════════════════════════════════
const AutoScroll = {
    tracks: [],

    init() {
        const rowEls = document.querySelectorAll('.memory-row');

        rowEls.forEach((row, i) => {
            // ── Buat wrapper .memory-track ──
            const track = document.createElement('div');
            track.className = 'memory-track';

            // Ambil semua card asli (hanya element nodes, hindari text nodes)
            const cards = Array.from(row.children);
            
            // Acak urutan foto (Fisher-Yates shuffle)
            for (let j = cards.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [cards[j], cards[k]] = [cards[k], cards[j]];
            }

            // Pindahkan card yang sudah diacak ke dalam track
            cards.forEach(card => track.appendChild(card));

            // Clone semua card → total 2x → animasi bisa loop seamless
            const origCards = Array.from(track.children);
            origCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });

            // ── Set explicit width via JavaScript (Safari-safe) ──
            // HAPUS CSS width: max-content, hitung manual
            track.style.width = 'max-content';
            track.style.flexWrap = 'nowrap';
            track.style.padding = '0.4rem 0';

            row.appendChild(track);

            // ── Hitung width setelah DOM render ──
            requestAnimationFrame(() => {
                const trackWidth = track.scrollWidth;
                const halfWidth = trackWidth / 2;
                
                // Dynamic duration berdasarkan screen width & jumlah card
                const screenWidth = window.innerWidth;
                const baseDuration = 40 + i * 10;
                const mobileMultiplier = Math.max(0.6, screenWidth / 1440);
                const duration = Math.round(baseDuration / mobileMultiplier);
                const direction = i % 2 === 0 ? 'normal' : 'reverse';

                // ── Animasi berbasis pixel (bukan percentage) ──
                // Ini lebih aman untuk Safari karena tidak bergantung pada CSS width calculation
                track.style.animation = 'none'; // Reset dulu
                track.style.animationPlayState = 'paused';

                // Buat keyframes dinamis berdasarkan width yang dihitung
                const animName = `autoScroll_${i}`;
                const styleSheet = document.styleSheets[0];
                
                // Hapus keyframes lama jika ada (untuk re-init)
                try {
                    for (let r = styleSheet.cssRules.length - 1; r >= 0; r--) {
                        if (styleSheet.cssRules[r].name === animName) {
                            styleSheet.deleteRule(r);
                            break;
                        }
                    }
                } catch(e) {}

                // Tambah keyframes baru (pixel-based)
                try {
                    styleSheet.insertRule(
                        `@keyframes ${animName} { from { transform: translateX(0); } to { transform: translateX(-${halfWidth}px); } }`,
                        styleSheet.cssRules.length
                    );
                } catch(e) {}

                track.style.animation = `${animName} ${duration}s linear infinite ${direction}`;
                track.style.animationPlayState = 'paused';

                // ── Pause saat hover (desktop) ──
                row.addEventListener('mouseenter', () => {
                    track.style.animationPlayState = 'paused';
                });
                row.addEventListener('mouseleave', () => {
                    track.style.animationPlayState = 'running';
                });

                // ── Pause saat touch (mobile) ──
                row.addEventListener('touchstart', () => {
                    track.style.animationPlayState = 'paused';
                }, { passive: true });

                row.addEventListener('touchend', () => {
                    setTimeout(() => {
                        track.style.animationPlayState = 'running';
                    }, 3000); // 3 detik supaya user sempat baca caption
                }, { passive: true });

                this.tracks.push(track);
            });
        });
    },

    start() {
        this.tracks.forEach(track => {
            track.style.animationPlayState = 'running';
        });
    },

    stop() {
        this.tracks.forEach(track => {
            track.style.animationPlayState = 'paused';
        });
    }
};

window.AutoScroll = AutoScroll;
