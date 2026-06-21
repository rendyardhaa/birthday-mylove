// ═══════════════════════════════════════════
//  AUTO-SCROLL — Memory Rows (JS Animation)
//  Menggunakan requestAnimationFrame untuk menghindari bug Webkit iOS
// ═══════════════════════════════════════════
const AutoScroll = {
    tracks: [],

    init() {
        const rowEls = document.querySelectorAll('.memory-row');

        rowEls.forEach((row, i) => {
            const track = document.createElement('div');
            track.className = 'memory-track';

            const cards = Array.from(row.children);
            
            for (let j = cards.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [cards[j], cards[k]] = [cards[k], cards[j]];
            }

            cards.forEach(card => track.appendChild(card));

            const origCards = Array.from(track.children);
            origCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });

            row.appendChild(track);

            // JS Animation Setup
            let isPaused = true; // start paused
            let pos = 0;
            // Kecepatan berdasarkan index (baris ganjil/genap)
            const speed = i % 2 === 0 ? 0.6 : -0.6; // Baris 1 & 3 ke kiri, 2 & 4 ke kanan
            
            const animate = () => {
                if (!isPaused && track.scrollWidth > 0) {
                    const halfWidth = track.scrollWidth / 2;
                    if (speed > 0) {
                        pos += speed;
                        if (pos >= halfWidth) pos -= halfWidth;
                    } else {
                        pos += speed;
                        if (pos <= 0) pos += halfWidth;
                    }
                    track.style.transform = `translateX(-${pos}px)`;
                }
                requestAnimationFrame(animate);
            };

            // Inisialisasi posisi awal reverse
            setTimeout(() => {
                if (speed < 0) pos = track.scrollWidth / 2;
                requestAnimationFrame(animate);
            }, 100);

            // ── Pause saat hover (desktop) ──
            row.addEventListener('mouseenter', () => { isPaused = true; });
            row.addEventListener('mouseleave', () => { isPaused = false; });

            // ── Pause saat touch (mobile) ──
            row.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
            row.addEventListener('touchend', () => {
                setTimeout(() => { isPaused = false; }, 2500);
            }, { passive: true });

            this.tracks.push({ track, play: () => isPaused = false, stop: () => isPaused = true });
        });
    },

    start() {
        this.tracks.forEach(t => t.play());
    },

    stop() {
        this.tracks.forEach(t => t.stop());
    }
};

window.AutoScroll = AutoScroll;
