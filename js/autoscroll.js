// ═══════════════════════════════════════════
//  AUTO-SCROLL — Memory Rows (CSS Animation)
//  Smooth infinite horizontal scroll
//  Pauses on hover (desktop) & touch (mobile)
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

            row.appendChild(track);

            // ── Set animasi CSS (SYNC - tidak ada requestAnimationFrame) ──
            const duration  = 40 + i * 10;              // lebih lambat: 40s & 50s
            const direction = i % 2 === 0 ? 'normal' : 'reverse';

            track.style.cssText += `
                animation: autoScrollTrack ${duration}s linear infinite ${direction};
                animation-play-state: paused;
            `;

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
                // Resume setelah 2.5 detik supaya user sempat baca caption
                setTimeout(() => {
                    track.style.animationPlayState = 'running';
                }, 2500);
            }, { passive: true });

            this.tracks.push(track);
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
