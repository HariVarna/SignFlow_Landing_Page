/**
 * SignFlow Demo Animation
 * Handles the interactive demo animation sequence
 */

class DemoAnimation {
    constructor() {
        this.demoSvg = document.querySelector('.demo-svg');
        this.timeline = [];
        this.isAnimating = false;
        this.animationSpeed = 1; // Can be adjusted for speed control
        
        if (this.demoSvg) {
            this.init();
        }
    }

    init() {
        // Start animation when element becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isAnimating) {
                    this.startSequence();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.demoSvg);
    }

    startSequence() {
        this.isAnimating = true;
        this.resetAnimation();
        this.playAnimation();
    }

    resetAnimation() {
        // Reset all elements to initial state
        const hands = this.demoSvg.querySelector('.hands');
        const selectionBox = this.demoSvg.querySelector('.selection-box');
        const processing = this.demoSvg.querySelector('.processing');
        const caption = this.demoSvg.querySelector('.caption-overlay');

        if (hands) hands.setAttribute('opacity', '0');
        if (selectionBox) selectionBox.setAttribute('opacity', '0');
        if (processing) processing.setAttribute('opacity', '0');
        if (caption) caption.setAttribute('opacity', '0');
    }

    playAnimation() {
        const duration = 4000; // 4 second animation cycle
        
        // Step 1: Hands appear (0s - 0.5s)
        this.scheduleAction(0, () => this.showHands());
        
        // Step 2: Selection box appears (0.8s - 1.5s)
        this.scheduleAction(800, () => this.showSelectionBox());
        
        // Step 3: Processing indicator appears (1.5s - 2.5s)
        this.scheduleAction(1500, () => this.showProcessing());
        
        // Step 4: Caption appears (2.5s - 3.5s)
        this.scheduleAction(2500, () => this.showCaption());
        
        // Reset and restart animation (4s)
        this.scheduleAction(duration, () => {
            this.resetAnimation();
            setTimeout(() => this.playAnimation(), 1000);
        });
    }

    scheduleAction(delay, action) {
        setTimeout(action, delay / this.animationSpeed);
    }

    showHands() {
        const hands = this.demoSvg.querySelector('.hands');
        if (hands) {
            hands.style.transition = 'opacity 0.5s ease-in';
            hands.setAttribute('opacity', '1');
        }
    }

    showSelectionBox() {
        const hands = this.demoSvg.querySelector('.hands');
        const selectionBox = this.demoSvg.querySelector('.selection-box');
        
        if (hands) {
            hands.style.transition = 'opacity 0.3s ease-out';
            hands.setAttribute('opacity', '0.3');
        }
        
        if (selectionBox) {
            selectionBox.style.transition = 'opacity 0.6s ease-in';
            selectionBox.setAttribute('opacity', '1');
            
            // Animate selection box appearance
            const rect = selectionBox.querySelector('rect');
            if (rect) {
                rect.style.animation = 'draw-box 0.6s ease-in forwards';
            }
        }
    }

    showProcessing() {
        const selectionBox = this.demoSvg.querySelector('.selection-box');
        const processing = this.demoSvg.querySelector('.processing');
        
        if (selectionBox) {
            selectionBox.style.transition = 'opacity 0.3s ease-out';
            selectionBox.setAttribute('opacity', '0.5');
        }
        
        if (processing) {
            processing.style.transition = 'opacity 0.5s ease-in';
            processing.setAttribute('opacity', '1');
            
            // Pulse animation on processing indicator
            const circle = processing.querySelector('circle:first-of-type');
            if (circle) {
                circle.style.animation = 'pulse 1s ease-in-out infinite';
            }
        }
    }

    showCaption() {
        const processing = this.demoSvg.querySelector('.processing');
        const caption = this.demoSvg.querySelector('.caption-overlay');
        
        if (processing) {
            processing.style.transition = 'opacity 0.3s ease-out';
            processing.setAttribute('opacity', '0');
        }
        
        if (caption) {
            caption.style.transition = 'opacity 0.8s ease-in';
            caption.setAttribute('opacity', '1');
            
            // Glow effect on caption
            const captionBox = caption.querySelector('rect');
            if (captionBox) {
                captionBox.style.animation = 'glow-box 1s ease-in-out infinite';
            }
        }
    }
}

// Add required CSS animations
function injectDemoAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes draw-box {
            0% {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
            }
            100% {
                stroke-dasharray: 1000;
                stroke-dashoffset: 0;
            }
        }

        @keyframes pulse {
            0%, 100% {
                r: 8;
                opacity: 0.8;
            }
            50% {
                r: 12;
                opacity: 0.4;
            }
        }

        @keyframes glow-box {
            0%, 100% {
                fill-opacity: 0.1;
            }
            50% {
                fill-opacity: 0.2;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize demo animation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        injectDemoAnimationStyles();
        new DemoAnimation();
    });
} else {
    injectDemoAnimationStyles();
    new DemoAnimation();
}

// Export for use in other scripts
window.DemoAnimation = DemoAnimation;
