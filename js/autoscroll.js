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

            // ── Set animasi CSS dengan durasi dinamis berdasarkan lebar ──
            // requestAnimationFrame memastikan browser sudah menghitung lebar elemen
            requestAnimationFrame(() => {
                const halfWidth = track.scrollWidth / 2;
                // Target speed: ~60 pixel per detik agar seragam di semua baris
                // Kita beri sedikit variasi kecil antar baris agar terlihat natural
                const speed = 60 - (i * 2); // Baris bawah sedikit lebih lambat 
                const duration = halfWidth / speed;

                if (i % 2 !== 0) {
                    row.classList.add('reverse-row');
                    track.style.cssText += `
                        animation: autoScrollTrackRight ${duration}s linear infinite normal;
                        animation-play-state: paused;
                    `;
                } else {
                    track.style.cssText += `
                        animation: autoScrollTrack ${duration}s linear infinite normal;
                        animation-play-state: paused;
                    `;
                }
            });

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
