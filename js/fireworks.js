// Fountain Fireworks Module
const FountainFireworks = {
    container: document.getElementById('fountain-fireworks'),
    colors: ['#D4A96A', '#E8A0A8', '#C9707A', '#FDF6F0'], // Updated to new romantic palette
    isAnimating: false,

    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random properties
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 6 + 4;
        const angle = Math.random() * Math.PI - Math.PI / 2; // -90 to 90 degrees
        const velocity = Math.random() * 150 + 100;
        const gravity = 0.5;
        
        // Calculate end position
        const endX = x + Math.cos(angle) * velocity;
        const endY = y + Math.sin(angle) * velocity + 200; // Add gravity effect
        
        // Apply styles
        sparkle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size}px ${color};
        `;
        
        this.container.appendChild(sparkle);
        
        // Animate sparkle
        const animation = sparkle.animate([
            { 
                left: `${x}px`,
                top: `${y}px`,
                opacity: 1,
                transform: 'scale(1)'
            },
            { 
                left: `${endX}px`,
                top: `${endY}px`,
                opacity: 0,
                transform: 'scale(0)'
            }
        ], {
            duration: 1500 + Math.random() * 500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => sparkle.remove();
    },

    createBurst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createSparkle(x, y);
            }, Math.random() * 300);
        }
    },

    start(x, y) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Create multiple bursts
        this.createBurst(x, y, 40);
        
        setTimeout(() => {
            this.createBurst(x - 30, y + 20, 20);
        }, 200);
        
        setTimeout(() => {
            this.createBurst(x + 30, y + 20, 20);
        }, 400);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 2000);
    }
};

// Export for use in other modules
window.FountainFireworks = FountainFireworks;