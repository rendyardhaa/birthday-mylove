// ═══════════════════════════════════════════
//  GALAXY BACKGROUND — Spiral Galaxy + Planets
// ═══════════════════════════════════════════
const Galaxy = {
    canvas: null,
    ctx: null,
    stars: [],
    nebulae: [],
    planets: [],
    dustClouds: [],
    angle: 0,
    animFrame: null,
    isRunning: false,

    ROTATE_SPEED: 0.00010,   // sangat lambat — 1 rotasi penuh ~17 menit

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'galaxy-canvas';
        this.canvas.style.cssText = [
            'position:fixed', 'top:0', 'left:0',
            'width:100%', 'height:100%',
            'pointer-events:none',
            'z-index:9',
            'opacity:0',
            'transition:opacity 2.5s ease',
        ].join(';');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generate();
    },

    // ─── Generate semua elemen ────────────────
    generate() {
        const w = this.canvas.width, h = this.canvas.height;
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.46;

        this.stars      = [];
        this.nebulae    = [];
        this.planets    = [];
        this.dustClouds = [];

        // ── 1. Bintang inti galaksi (dense core) ──
        for (let i = 0; i < 120; i++) {
            const r   = Math.pow(Math.random(), 2.2) * maxR * 0.22;
            const ang = Math.random() * Math.PI * 2;
            this.stars.push(this.makeStar(ang, r, 'core'));
        }

        // ── 2. Lengan spiral (2 lengan, ~300 bintang) ──
        const numArms  = 2;
        const armStars = 150;
        for (let arm = 0; arm < numArms; arm++) {
            const armOffset = (arm / numArms) * Math.PI * 2;
            for (let i = 0; i < armStars; i++) {
                const t          = i / armStars;                        // 0→1
                const dist       = 0.08 * maxR + t * maxR * 0.92;      // jarak dari core
                const windAngle  = armOffset + t * Math.PI * 2.8;      // spiral curl
                const scatter    = (0.18 + t * 0.35) * (Math.PI / 2); // makin menyebar di ujung
                const finalAngle = windAngle + (Math.random() - 0.5) * scatter;
                const distScatter = dist + (Math.random() - 0.5) * maxR * 0.08;
                this.stars.push(this.makeStar(finalAngle, Math.max(0, distScatter), 'arm', t));
            }
        }

        // ── 3. Bintang latar belakang acak ──
        for (let i = 0; i < 80; i++) {
            const r   = Math.pow(Math.random(), 0.4) * Math.sqrt(w * w + h * h) * 0.5;
            const ang = Math.random() * Math.PI * 2;
            this.stars.push(this.makeStar(ang, r, 'bg'));
        }

        // ── 4. Nebula (awan warna di lengan) ──
        const nebulaColors = [
            [180, 70, 110], [140, 60, 150], [80, 50, 130],
            [200, 95, 130], [60, 45, 115], [165, 75, 120],
        ];
        for (let i = 0; i < 7; i++) {
            const t   = 0.25 + Math.random() * 0.65;
            const arm = Math.floor(Math.random() * numArms);
            const ao  = (arm / numArms) * Math.PI * 2;
            const ang = ao + t * Math.PI * 2.8 + (Math.random() - 0.5) * 0.6;
            const r   = 0.08 * maxR + t * maxR * 0.88 + (Math.random() - 0.5) * maxR * 0.1;
            const [cr, cg, cb] = nebulaColors[i % nebulaColors.length];
            this.nebulae.push({
                theta: ang, dist: Math.max(0, r),
                size:  (Math.random() * 130 + 80) * (w / 1440),
                r: cr, g: cg, b: cb,
                alpha: Math.random() * 0.09 + 0.04,
                aspectY: Math.random() * 0.5 + 0.4,
            });
        }

        // ── 5. Awan debu halus (dust lanes) ──
        for (let i = 0; i < 5; i++) {
            const t   = 0.1 + Math.random() * 0.7;
            const arm = i % numArms;
            const ao  = (arm / numArms) * Math.PI * 2;
            const ang = ao + t * Math.PI * 2.5;
            const r   = 0.08 * maxR + t * maxR * 0.85;
            this.dustClouds.push({
                theta: ang, dist: r,
                size:  (Math.random() * 80 + 50) * (w / 1440),
                alpha: Math.random() * 0.06 + 0.02,
            });
        }

        // ── 6. Planet (2-3 objek besar) ──
        const planetDefs = [
            { dist: maxR * 0.68, thetaOffset: 0.9,  size: (w / 1440) * 22, r:  80, g:  55, b: 110, hasRing: true  },
            { dist: maxR * 0.52, thetaOffset: 3.4,  size: (w / 1440) * 14, r: 160, g: 100, b: 130, hasRing: false },
            { dist: maxR * 0.85, thetaOffset: 5.8,  size: (w / 1440) * 10, r:  60, g:  80, b: 130, hasRing: true  },
        ];
        for (const pd of planetDefs) {
            this.planets.push({
                theta:  pd.thetaOffset,
                dist:   pd.dist,
                size:   Math.max(6, pd.size),
                r: pd.r, g: pd.g, b: pd.b,
                hasRing:   pd.hasRing,
                ringTilt:  Math.random() * 0.4 + 0.15,
                rotateSpeed: 0.00004 + Math.random() * 0.00006,
            });
        }
    },

    makeStar(theta, dist, type, armT = 0.5) {
        // Pilih warna berdasarkan tipe
        let r, g, b;
        if (type === 'core') {
            // Core: kebiruan/putih hangat
            const roll = Math.random();
            if (roll < 0.5) { r=250; g=245; b=240; }
            else if (roll < 0.75) { r=200; g=220; b=255; }
            else { r=255; g=220; b=160; }
        } else if (type === 'arm') {
            const roll = Math.random();
            if (roll < 0.45)      { r=245; g=238; b=230; }
            else if (roll < 0.65) { r=212; g=169; b=106; }  // gold
            else if (roll < 0.80) { r=232; g=160; b=168; }  // rose
            else if (roll < 0.90) { r=170; g=200; b=255; }  // blue
            else                  { r=200; g=180; b=240; }  // lavender
        } else {
            r=200; g=190; b=210;
        }

        const sizeBase = type === 'core' ? 1.6 : (type === 'arm' ? 1.2 : 0.8);
        return {
            theta, dist,
            r, g, b,
            size: Math.random() * sizeBase + 0.25,
            baseOpacity: type === 'bg' ? Math.random() * 0.35 + 0.15 : Math.random() * 0.6 + 0.35,
            twinkleSpeed: Math.random() * 0.015 + 0.003,
            twinklePhase: Math.random() * Math.PI * 2,
        };
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.canvas.style.opacity = '1';
        this.loop();
    },

    stop() {
        this.isRunning = false;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
        this.canvas.style.opacity = '0';
    },

    loop() {
        if (!this.isRunning) return;
        this.draw();
        this.angle += this.ROTATE_SPEED;
        this.animFrame = requestAnimationFrame(() => this.loop());
    },

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width, h = this.canvas.height;
        const cx = w / 2, cy = h / 2;
        const t  = performance.now() / 1000;

        // ── Background ──────────────────────────
        ctx.fillStyle = '#08060C';
        ctx.fillRect(0, 0, w, h);

        // ── Outer dim glow ──
        const outerGlow = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, Math.max(w, h) * 0.55);
        outerGlow.addColorStop(0,   'rgba(60,25,60,0.35)');
        outerGlow.addColorStop(0.4, 'rgba(30,12,40,0.15)');
        outerGlow.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, w, h);

        // ── Dust clouds ─────────────────────────
        for (const d of this.dustClouds) {
            const a  = d.theta + this.angle;
            const dx = cx + Math.cos(a) * d.dist;
            const dy = cy + Math.sin(a) * d.dist;
            const g  = ctx.createRadialGradient(dx, dy, 0, dx, dy, d.size);
            g.addColorStop(0,   `rgba(20,10,30,${d.alpha})`);
            g.addColorStop(0.5, `rgba(15,8,25,${(d.alpha * 0.5).toFixed(3)})`);
            g.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(dx, dy, d.size, d.size * 0.55, a * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // ── Nebulae ─────────────────────────────
        for (const n of this.nebulae) {
            const a  = n.theta + this.angle * 0.4;
            const nx = cx + Math.cos(a) * n.dist;
            const ny = cy + Math.sin(a) * n.dist;
            const g  = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.size);
            g.addColorStop(0,   `rgba(${n.r},${n.g},${n.b},${Math.min(0.99, n.alpha * 2.2).toFixed(3)})`);
            g.addColorStop(0.4, `rgba(${n.r},${n.g},${n.b},${n.alpha.toFixed(3)})`);
            g.addColorStop(1,   `rgba(${n.r},${n.g},${n.b},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(nx, ny, n.size, n.size * n.aspectY, a * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // ── Galaxy core glow ────────────────────
        const coreSize = Math.min(w, h) * 0.12;
        const core1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 1.8);
        core1.addColorStop(0,   'rgba(255,220,200,0.80)');
        core1.addColorStop(0.15,'rgba(220,160,180,0.55)');
        core1.addColorStop(0.4, 'rgba(180,100,150,0.25)');
        core1.addColorStop(0.7, 'rgba(120,60,130,0.10)');
        core1.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = core1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, coreSize * 1.8, coreSize * 1.1, this.angle * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // ── Stars ───────────────────────────────
        for (const s of this.stars) {
            const a  = s.theta + this.angle;
            const sx = cx + Math.cos(a) * s.dist;
            const sy = cy + Math.sin(a) * s.dist;
            const tw = Math.sin(t * s.twinkleSpeed * 60 + s.twinklePhase);
            const op = Math.max(0, Math.min(1, s.baseOpacity * (0.6 + 0.4 * tw)));

            ctx.save();

            // Glow untuk bintang besar
            if (s.size > 1.2) {
                const glowR = s.size * 4;
                const glowG = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
                glowG.addColorStop(0,   `rgba(${s.r},${s.g},${s.b},${(op * 0.28).toFixed(3)})`);
                glowG.addColorStop(1,   `rgba(${s.r},${s.g},${s.b},0)`);
                ctx.fillStyle = glowG;
                ctx.beginPath();
                ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = op;
            ctx.fillStyle   = `rgb(${s.r},${s.g},${s.b})`;
            ctx.beginPath();
            ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── Planet ──────────────────────────────
        for (const p of this.planets) {
            const a  = p.theta + this.angle * (1 + p.rotateSpeed * 500);
            const px = cx + Math.cos(a) * p.dist;
            const py = cy + Math.sin(a) * p.dist;
            ctx.save();

            // Atmospheric glow
            const atmR = p.size * 2.8;
            const atm  = ctx.createRadialGradient(px, py, 0, px, py, atmR);
            atm.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},0.35)`);
            atm.addColorStop(0.6, `rgba(${p.r},${p.g},${p.b},0.12)`);
            atm.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
            ctx.fillStyle = atm;
            ctx.beginPath();
            ctx.arc(px, py, atmR, 0, Math.PI * 2);
            ctx.fill();

            // Cincin planet (ring) — gambar di belakang planet
            if (p.hasRing) {
                ctx.save();
                ctx.translate(px, py);
                ctx.scale(1, p.ringTilt);
                const ringW = p.size * 2.4;
                const ringGrad = ctx.createLinearGradient(-ringW, 0, ringW, 0);
                ringGrad.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},0)`);
                ringGrad.addColorStop(0.2, `rgba(${p.r + 40},${p.g + 30},${p.b + 20},0.5)`);
                ringGrad.addColorStop(0.5, `rgba(${p.r + 60},${p.g + 50},${p.b + 40},0.7)`);
                ringGrad.addColorStop(0.8, `rgba(${p.r + 40},${p.g + 30},${p.b + 20},0.5)`);
                ringGrad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
                ctx.strokeStyle = ringGrad;
                ctx.lineWidth   = p.size * 0.55;
                ctx.beginPath();
                ctx.ellipse(0, 0, ringW, p.size * 0.18, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Bola planet
            const planetGrad = ctx.createRadialGradient(
                px - p.size * 0.3, py - p.size * 0.3, 0,
                px, py, p.size
            );
            planetGrad.addColorStop(0,   `rgba(${Math.min(255,p.r+80)},${Math.min(255,p.g+70)},${Math.min(255,p.b+80)},1)`);
            planetGrad.addColorStop(0.5, `rgba(${p.r},${p.g},${p.b},1)`);
            planetGrad.addColorStop(1,   `rgba(${Math.max(0,p.r-50)},${Math.max(0,p.g-50)},${Math.max(0,p.b-60)},1)`);
            ctx.fillStyle = planetGrad;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Shadow sisi planet
            const shadow = ctx.createRadialGradient(px + p.size * 0.3, py + p.size * 0.2, 0, px, py, p.size);
            shadow.addColorStop(0.4, 'rgba(0,0,0,0)');
            shadow.addColorStop(1,   'rgba(0,0,0,0.65)');
            ctx.fillStyle = shadow;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // ── Shooting star ────────────────────────
        if (Math.random() < 0.004) {
            const x1  = Math.random() * w * 0.7;
            const y1  = Math.random() * h * 0.45;
            const len = Math.random() * 140 + 80;
            const ang = 0.18 + Math.random() * 0.28;
            const x2  = x1 + Math.cos(ang) * len;
            const y2  = y1 + Math.sin(ang) * len;
            const sg  = ctx.createLinearGradient(x1, y1, x2, y2);
            sg.addColorStop(0,   'rgba(255,245,235,0.95)');
            sg.addColorStop(0.3, 'rgba(212,169,106,0.6)');
            sg.addColorStop(1,   'rgba(255,255,255,0)');
            ctx.save();
            ctx.strokeStyle = sg;
            ctx.lineWidth   = 1.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }
    }
};

window.Galaxy = Galaxy;
