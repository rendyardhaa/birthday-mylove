// Countdown Timer Module
const CountdownTimer = {
    targetDate: new Date('2026-06-23T00:00:00+07:00').getTime(), // 23 Juni 2026, 00:00 WIB
    elements: {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    },
    interval: null,
    onComplete: null,

    init(callback) {
        this.onComplete = callback;
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    },

    update() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance <= 0) {
            this.complete();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.elements.days.textContent = this.padZero(days);
        this.elements.hours.textContent = this.padZero(hours);
        this.elements.minutes.textContent = this.padZero(minutes);
        this.elements.seconds.textContent = this.padZero(seconds);
    },

    padZero(num) {
        return num.toString().padStart(2, '0');
    },

    complete() {
        clearInterval(this.interval);
        if (this.onComplete) {
            this.onComplete();
        }
    }
};

// Export for use in other modules
window.CountdownTimer = CountdownTimer;