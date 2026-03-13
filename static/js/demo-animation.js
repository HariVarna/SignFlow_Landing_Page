/**
 * SignFlow Demo Animation
 * Handles the interactive demo animation sequence
 */

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class DemoAnimation {
    constructor() {
        this.demoStage = document.querySelector('.demo-stage');
        this.selectionBox = document.querySelector('.selection-box');
        this.cursor = document.querySelector('.demo-cursor');
        this.processing = document.querySelector('.demo-processing');
        this.captionBox = document.querySelector('.demo-caption');
        this.captionText = document.querySelector('.caption-text');
        this.captionCaret = document.querySelector('.caption-caret');
        this.leftHand = document.querySelector('.hand-left');
        this.rightHand = document.querySelector('.hand-right');
        this.isAnimating = false;
        this.typingTimer = null;
        this.sequenceTimers = [];
        this.handTimer = null;

        if (this.demoStage) {
            this.init();
        }
    }

    init() {
        this.resetAnimation();

        if (prefersReducedMotion()) {
            this.typeCaption(true);
            return;
        }

        if (!('IntersectionObserver' in window)) {
            this.startSequence();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startSequence();
                } else {
                    this.stopSequence();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.demoStage);
    }

    startSequence() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.sequenceTimers.forEach(timer => clearTimeout(timer));
        this.sequenceTimers = [];
        this.startHandSequence();
        this.resetAnimation();
        this.playAnimation();
    }

    resetAnimation() {
        if (this.selectionBox) {
            this.selectionBox.classList.remove('is-drawing');
            this.selectionBox.style.animation = 'none';
            this.selectionBox.style.width = '0';
            this.selectionBox.style.height = '0';
            this.selectionBox.style.opacity = '0';
        }

        if (this.cursor) {
            this.cursor.classList.remove('is-dragging');
            this.cursor.style.animation = 'none';
            this.cursor.style.opacity = '0';
        }

        if (this.processing) {
            this.processing.classList.remove('is-active');
        }

        if (this.captionBox) {
            this.captionBox.classList.remove('is-visible');
        }

        if (this.captionText) {
            this.captionText.textContent = '';
        }

        if (this.captionCaret) {
            this.captionCaret.classList.remove('is-active');
        }
    }

    playAnimation() {
        const dragDuration = 2000;
        const processDelay = 800;
        const typingDelay = 500;
        const holdDuration = 3000;
        const typingInterval = 80;
        const text = (this.captionText && this.captionText.dataset.fulltext) || '';
        const typingDuration = Math.max(text.length * typingInterval, 600);

        this.sequenceTimers = [];
        this.schedule(() => this.drawSelection(dragDuration), 200);
        this.schedule(() => this.showProcessing(), 200 + dragDuration + 150);
        this.schedule(
            () => this.typeCaption(false, typingInterval),
            200 + dragDuration + processDelay + typingDelay
        );
        this.schedule(
            () => this.resetAnimation(),
            200 + dragDuration + processDelay + typingDelay + typingDuration + holdDuration
        );
        this.schedule(() => {
            if (this.isAnimating) {
                this.playAnimation();
            }
        }, 200 + dragDuration + processDelay + typingDelay + typingDuration + holdDuration + 600);
    }

    schedule(action, delay) {
        const timer = setTimeout(action, delay);
        this.sequenceTimers.push(timer);
    }

    drawSelection(duration) {
        if (this.selectionBox) {
            this.selectionBox.style.animation = 'none';
            this.selectionBox.style.width = '0';
            this.selectionBox.style.height = '0';
            void this.selectionBox.offsetWidth;
            this.selectionBox.classList.add('is-drawing');
            this.selectionBox.style.animation = `rect-draw ${duration}ms ease-in-out forwards`;
        }

        if (this.cursor) {
            this.cursor.style.animation = 'none';
            void this.cursor.offsetWidth;
            this.cursor.classList.add('is-dragging');
            this.cursor.style.animation = `cursor-drag ${duration}ms ease-in-out forwards`;
        }
    }

    showProcessing() {
        if (this.processing) {
            this.processing.classList.add('is-active');
        }
    }

    typeCaption(instant, interval = 55) {
        if (!this.captionText) return;
        const fullText = this.captionText.dataset.fulltext || '';
        this.captionText.textContent = '';
        if (this.captionCaret) {
            this.captionCaret.classList.add('is-active');
        }
        if (this.captionBox) {
            this.captionBox.classList.add('is-visible');
        }
        if (this.processing) {
            this.processing.classList.remove('is-active');
        }

        if (instant) {
            this.captionText.textContent = fullText;
            return;
        }

        let index = 0;
        clearInterval(this.typingTimer);
        this.typingTimer = setInterval(() => {
            this.captionText.textContent += fullText[index] || '';
            index += 1;
            if (index >= fullText.length) {
                clearInterval(this.typingTimer);
                this.typingTimer = null;
            }
        }, interval);
    }

    startHandSequence() {
        if (!this.leftHand || !this.rightHand) return;

        const leftFrames = ['🤟', '🖐️', '🤟', '👌'];
        const rightFrames = ['✋', '🤟', '✋', '👌'];
        let frameIndex = 0;

        clearInterval(this.handTimer);
        this.handTimer = setInterval(() => {
            this.leftHand.textContent = leftFrames[frameIndex % leftFrames.length];
            this.rightHand.textContent = rightFrames[frameIndex % rightFrames.length];
            frameIndex += 1;
        }, 600);
    }

    stopSequence() {
        this.isAnimating = false;
        this.sequenceTimers.forEach(timer => clearTimeout(timer));
        this.sequenceTimers = [];
        clearInterval(this.typingTimer);
        clearInterval(this.handTimer);
        this.typingTimer = null;
        this.handTimer = null;
        if (this.leftHand) this.leftHand.textContent = '🤟';
        if (this.rightHand) this.rightHand.textContent = '✋';
        this.resetAnimation();
    }
}

// Add required CSS animations
function injectDemoAnimationStyles() {
    // No-op: styles now live in CSS
}

// Initialize demo animation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DemoAnimation();
    });
} else {
    new DemoAnimation();
}

// Export for use in other scripts
window.DemoAnimation = DemoAnimation;
