// Main Application Module
const App = {
    currentStage: 'countdown',
    stages: {
        countdown: document.getElementById('countdown-stage'),
        greeting: document.getElementById('greeting-stage'),
        cake: document.getElementById('cake-stage'),
        mailbox: document.getElementById('mailbox-stage'),
        memories: document.getElementById('memories-stage')
    },

    init() {
        // Setup background music
        const bgm = document.getElementById('bgm');
        const musicToggle = document.getElementById('music-toggle');
        
        if (bgm && musicToggle) {
            bgm.volume = 0.5; // Set starting volume to 50%
            
            musicToggle.addEventListener('click', () => {
                if (bgm.paused) {
                    bgm.play();
                    musicToggle.classList.remove('muted');
                } else {
                    bgm.pause();
                    musicToggle.classList.add('muted');
                }
            });

            // Trick mobile browsers into firing 'click' events on empty space
            document.body.style.cursor = 'pointer';

            const tryAutoPlay = () => {
                bgm.play().then(() => {
                    musicToggle.classList.remove('muted');
                    document.removeEventListener('click', tryAutoPlay);
                    document.removeEventListener('touchend', tryAutoPlay);
                    document.body.style.cursor = ''; // Cleanup trick
                }).catch((e) => {
                    musicToggle.classList.add('muted');
                    console.log("Menunggu interaksi user yang sah...", e);
                });
            };

            document.addEventListener('click', tryAutoPlay);
            document.addEventListener('touchend', tryAutoPlay, { passive: true });
            musicToggle.classList.add('muted');
        }

        // Initialize countdown with callback to move to GREETING stage
        CountdownTimer.init(() => this.moveToStage('greeting'));
        
        // Setup mailbox interaction
        this.setupMailbox();
        
        // Setup memories button
        this.setupMemoriesButton();
        
        // Create floating hearts for countdown
        this.createFloatingHearts();
        
        // Create floating petals for mailbox
        this.createFloatingPetals();

        // Initialize galaxy background & auto-scroll (start later when memories active)
        Galaxy.init();
        AutoScroll.init();
    },

    createFloatingHearts() {
        const container = document.getElementById('floating-hearts');
        const hearts = ['♥', '❤', '♡', '❦'];
        const colors = ['#D4A96A', '#E8A0A8', '#C9707A', '#F0D5A8', '#9B545C', '#FFFDF9'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = Math.random() * 100 + '%';
                heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
                heart.style.animationDelay = Math.random() * 5 + 's';
                heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
                container.appendChild(heart);
            }, i * 500);
        }
    },

    createFloatingPetals() {
        const container = document.getElementById('floating-petals');
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.className = 'floating-petal';
                petal.style.left = Math.random() * 100 + '%';
                petal.style.animationDuration = (Math.random() * 5 + 8) + 's';
                petal.style.animationDelay = Math.random() * 8 + 's';
                petal.style.width = (Math.random() * 10 + 10) + 'px';
                petal.style.height = petal.style.width;
                container.appendChild(petal);
            }, i * 400);
        }
    },

    createLetterEffects() {
        const heartsContainer = document.getElementById('letter-hearts');
        const sparklesContainer = document.getElementById('letter-sparkles');

        // ── 1. Hearts dari sisi KIRI & KANAN (bukan hanya tengah bawah) ──
        const heartChars = ['♥', '♡', '❤', '❦', '♥', '♡'];
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'letter-heart';
                heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];

                // Spawn dari kiri (0–20%) atau kanan (80–100%), hindari area tengah
                const side = Math.random() < 0.5 ? 'left' : 'right';
                const xPos = side === 'left'
                    ? Math.random() * 22          // 0–22% (sisi kiri)
                    : 78 + Math.random() * 22;    // 78–100% (sisi kanan)

                heart.style.left   = xPos + '%';
                heart.style.bottom = Math.random() * 30 + '%';
                heart.style.animationDuration = (Math.random() * 4 + 5) + 's';
                heart.style.animationDelay    = (Math.random() * 4) + 's';
                heart.style.fontSize = (Math.random() * 14 + 14) + 'px';
                // Hati sisi kiri lebih kecil agar tidak nabrak surat
                heart.style.opacity = (Math.random() * 0.4 + 0.5).toString();
                heartsContainer.appendChild(heart);
            }, i * 400);
        }

        // ── 2. Bintang sparkle ✦ melayang di kiri & kanan ──
        const starChars = ['✦', '✧', '⋆', '✦', '✧'];
        for (let i = 0; i < 22; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.className = 'letter-sparkle';
                star.textContent = starChars[Math.floor(Math.random() * starChars.length)];

                // Juga sebar di kiri & kanan — sebagian kecil di tengah atas/bawah
                let xPos;
                const zone = Math.random();
                if (zone < 0.4)      xPos = Math.random() * 20;         // kiri
                else if (zone < 0.8) xPos = 80 + Math.random() * 20;   // kanan
                else                 xPos = 20 + Math.random() * 60;   // tengah (sedikit)

                star.style.left   = xPos + '%';
                star.style.top    = Math.random() * 90 + '%';
                star.style.fontSize = (Math.random() * 10 + 10) + 'px';
                star.style.animationDuration = (Math.random() * 2 + 2) + 's';
                star.style.animationDelay    = (Math.random() * 5) + 's';
                // Warna berganti antara gold & rose
                star.style.color = Math.random() < 0.5 ? '#D4A96A' : '#E8A0A8';
                sparklesContainer.appendChild(star);
            }, i * 250);
        }

        // ── 3. Kelopak bunga 🌸 jatuh dari atas di sisi kiri & kanan ──
        const petalChars = ['✿', '❀', '✾', '❁'];
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.style.position   = 'absolute';
                petal.style.fontSize   = (Math.random() * 10 + 12) + 'px';
                petal.style.color      = Math.random() < 0.5 ? '#E8A0A8' : '#C9707A';
                petal.style.opacity    = '0';
                petal.style.pointerEvents = 'none';
                petal.style.zIndex     = '1';
                petal.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];

                // Spawn dari kiri atau kanan
                const isLeft = Math.random() < 0.5;
                petal.style.left = isLeft
                    ? (Math.random() * 18) + '%'
                    : (82 + Math.random() * 16) + '%';
                petal.style.top = '-30px';

                heartsContainer.appendChild(petal);

                // Animasi jatuh manual
                const duration = Math.random() * 5000 + 6000;
                const drift    = (Math.random() * 60 - 30) * (isLeft ? 1 : -1);
                petal.animate([
                    { opacity: 0,   transform: `translateY(0px) translateX(0px) rotate(0deg)` },
                    { opacity: 0.8, transform: `translateY(20vh) translateX(${drift * 0.3}px) rotate(120deg)`, offset: 0.15 },
                    { opacity: 0.7, transform: `translateY(60vh) translateX(${drift}px) rotate(280deg)`, offset: 0.7 },
                    { opacity: 0,   transform: `translateY(105vh) translateX(${drift * 1.2}px) rotate(400deg)` }
                ], {
                    duration,
                    delay: Math.random() * 4000,
                    easing: 'ease-in-out',
                    fill: 'both'
                });
            }, i * 500);
        }

        // ── 4. Ambient sparkle emitter — terus-menerus selama surat terbuka ──
        this._letterAmbientInterval = setInterval(() => {
            const el = document.createElement('div');
            el.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 8 + 8}px;
                color: ${Math.random() < 0.5 ? '#D4A96A' : '#E8A0A8'};
                pointer-events: none;
                z-index: 2;
            `;
            el.textContent = Math.random() < 0.5 ? '✦' : '✧';

            // Hanya kiri & kanan
            const left = Math.random() < 0.5
                ? (Math.random() * 18) + '%'
                : (82 + Math.random() * 16) + '%';
            el.style.left = left;
            el.style.top  = (Math.random() * 85 + 5) + '%';

            sparklesContainer.appendChild(el);
            el.animate([
                { opacity: 0, transform: 'scale(0.3) translateY(0)' },
                { opacity: 1, transform: `scale(1.4) translateY(-${Math.random() * 20 + 10}px)`, offset: 0.5 },
                { opacity: 0, transform: `scale(0.5) translateY(-${Math.random() * 35 + 20}px)` }
            ], { duration: Math.random() * 1500 + 1500, easing: 'ease-out', fill: 'both' })
            .onfinish = () => el.remove();
        }, 300);
    },

    stopLetterEffects() {
        if (this._letterAmbientInterval) {
            clearInterval(this._letterAmbientInterval);
            this._letterAmbientInterval = null;
        }
    },

    setupMailbox() {
        const mailboxWrapper = document.querySelector('.mailbox-wrapper');
        const mailboxDoor = document.querySelector('.mailbox-door');
        const instruction = document.querySelector('.mailbox-instruction');
        
        if (!mailboxWrapper) return;
        
        mailboxWrapper.addEventListener('click', () => {
            if (this.currentStage !== 'mailbox' || mailboxWrapper.classList.contains('opened')) return;
            
            // Trigger door, flag, and letter animation
            mailboxWrapper.classList.add('opened');
            if (instruction) {
                instruction.style.animation = 'none';
                instruction.style.opacity = '0';
            }
            
            // Get position for fireworks
            const rect = mailboxDoor.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top;
            
            // Start fountain fireworks as the letter flies out
            setTimeout(() => {
                if (window.FountainFireworks) FountainFireworks.start(centerX, centerY);
            }, 400);
            
            // Show full screen letter after animations
            setTimeout(() => {
                this.showLetter();
            }, 1800);
        });
    },

    showLetter() {
        const letterContainer = document.getElementById('letter-container');
        letterContainer.classList.add('visible');
        
        // Create romantic effects for letter
        this.createLetterEffects();
        
        // Initialize and start typewriter
        Typewriter.init(() => {
            // Show button after typing completes
            setTimeout(() => {
                const btn = document.getElementById('open-memories-btn');
                btn.classList.add('visible');
            }, 500);
        });
        
        setTimeout(() => {
            Typewriter.start();
        }, 800);
    },

    setupMemoriesButton() {
        const btn = document.getElementById('open-memories-btn');
        btn.addEventListener('click', () => {
            this.moveToStage('memories');
        });
    },

    moveToStage(stageName) {
        // Fade out current stage
        const currentStageEl = this.stages[this.currentStage];
        currentStageEl.classList.remove('active');
        
        // Update body class for dark mode if moving to memories
        if (stageName === 'memories') {
            document.body.classList.add('dark-mode');
            // Hentikan efek ambient surat supaya tidak bocor memori
            this.stopLetterEffects();
        }

        // Stop galaxy if leaving memories
        if (this.currentStage === 'memories' && stageName !== 'memories') {
            Galaxy.stop();
            AutoScroll.stop();
        }
        
        // Fade in new stage
        setTimeout(() => {
            this.currentStage = stageName;
            const newStageEl = this.stages[stageName];
            newStageEl.classList.add('active');

            // Start galaxy & auto-scroll when memories becomes visible
            if (stageName === 'memories') {
                setTimeout(() => {
                    Galaxy.start();
                    AutoScroll.start();
                }, 400);   // slight delay so fade-in completes first
            }

            // Handle Greeting Stage Explosion
            if (stageName === 'greeting') {
                const text = document.querySelector('.exploding-text');
                if (text) {
                    // Reveal the text smoothly
                    setTimeout(() => {
                        text.classList.add('reveal');
                    }, 500);

                    // Wait 2.5 seconds, then EXPLODE!
                    setTimeout(() => {
                        text.classList.add('explode');
                        
                        // Start fountain fireworks as the explosion hits
                        if (window.FountainFireworks) {
                            FountainFireworks.start(window.innerWidth / 2, window.innerHeight / 2);
                        }
                        
                        // After explosion finishes, move to cake
                        setTimeout(() => {
                            this.moveToStage('cake');
                        }, 900);
                    }, 3000);
                }
            }

            // Handle automatic cake blowout
            if (stageName === 'cake') {
                const flame = document.querySelector('.flame');
                if (flame) {
                    // Biarkan kue menyala selama 6.5 detik
                    setTimeout(() => {
                        flame.classList.add('blown-out');
                        const spotlight = document.querySelector('.spotlight');
                        const fireflies = document.querySelector('.cake-fireflies');
                        if (spotlight) spotlight.classList.add('blown-out');
                        if (fireflies) fireflies.classList.add('blown-out');
                        
                        // --- CREATE WIND EFFECT ---
                        const windContainer = document.getElementById('wind-container');
                        if (windContainer) {
                            for (let i = 0; i < 6; i++) {
                                setTimeout(() => {
                                    const streak = document.createElement('div');
                                    streak.className = 'wind-streak';
                                    streak.style.top = (Math.random() * 100) + '%';
                                    streak.style.width = (Math.random() * 200 + 100) + 'px';
                                    streak.style.opacity = (Math.random() * 0.5 + 0.3).toString();
                                    windContainer.appendChild(streak);
                                }, i * 80);
                            }
                        }
                        
                        // Tunggu 2.5 detik untuk efek dramatis api mati & angin reda, lalu pindah ke kotak surat
                        setTimeout(() => {
                            this.moveToStage('mailbox');
                            
                            // Cleanup wind classes so it resets if visited again
                            if (flame) flame.classList.remove('blown-out');
                            if (spotlight) spotlight.classList.remove('blown-out');
                            if (fireflies) fireflies.classList.remove('blown-out');
                            if (windContainer) windContainer.innerHTML = '';
                        }, 2500);
                    }, 6500);
                }
            }
        }, 1000);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});