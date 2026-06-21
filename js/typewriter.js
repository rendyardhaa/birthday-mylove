// Typewriter Effect Module
const Typewriter = {
    element: document.getElementById('letter-text'),
    text: `Selamat ulang tahun ya, Sayanggg.

Buat aku, hari ini bukan cuma sekadar ngerayain hari lahirmu, tapi ngerayain hal paling berharga yang pernah hadir di hidupku. Makasih ya udah selalu sabar nemenin aku ngelewatin banyak hal, dari obrolan yang penting sampai hal-hal paling random sekalipun.

Berada di dekatmu bikin semuanya kerasa lebih mudah dan hangat. Semoga di umur yang baru ini kamu makin bahagia, mimpimu satu per satu tercapai, dan kita bisa terus bareng-bareng.

Happy birthday, my loveee! ❤️`,
    speed: 50,
    currentIndex: 0,
    onComplete: null,

    init(callback) {
        this.onComplete = callback;
        this.element.textContent = '';
        this.currentIndex = 0;
    },

    start() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text.charAt(this.currentIndex);
            this.currentIndex++;

            // Add slight delay for natural typing feel
            const delay = this.text.charAt(this.currentIndex - 1) === '\n' ? 100 : this.speed;

            setTimeout(() => this.start(), delay);
        } else {
            if (this.onComplete) {
                this.onComplete();
            }
        }
    },

    reset() {
        this.element.textContent = '';
        this.currentIndex = 0;
    }
};

// Export for use in other modules
window.Typewriter = Typewriter;