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
        this.captureBox = document.querySelector('.capture-box');
        this.processing = document.querySelector('.demo-processing');
        this.captionText = document.querySelector('.caption-text');
        this.captionCaret = document.querySelector('.caption-caret');
        this.leftHand = document.querySelector('.hand-left');
        this.rightHand = document.querySelector('.hand-right');
        this.isAnimating = false;
        this.typingTimer = null;
        this.sequenceTimer = null;
        this.handTimer = null;

        if (this.demoStage) {
            this.init();
        }
    }

    init() {
        if (prefersReducedMotion()) {
            this.resetAnimation();
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
        this.startHandSequence();
        this.resetAnimation();
        this.playAnimation();
    }

    resetAnimation() {
        if (this.captureBox) {
            this.captureBox.classList.remove('is-drawing');
            this.captureBox.style.strokeDasharray = '18 12';
            const length = this.captureBox.getTotalLength();
            this.captureBox.style.strokeDashoffset = length;
            this.captureBox.style.transition = 'none';
        }

        if (this.processing) {
            this.processing.classList.remove('is-active');
        }

        if (this.captionText) {
            this.captionText.textContent = '';
        }

        if (this.captionCaret) {
            this.captionCaret.classList.remove('is-active');
        }
    }

    playAnimation() {
        const drawDuration = 1200;
        const processDelay = 400;
        const typeDelay = 600;
        const cycleDelay = 2200;

        this.schedule(() => this.drawCaptureBox(drawDuration), 150);
        this.schedule(() => this.showProcessing(), 150 + drawDuration + processDelay);
        this.schedule(() => this.typeCaption(false), 150 + drawDuration + processDelay + typeDelay);
        this.schedule(() => {
            this.resetAnimation();
            if (this.isAnimating) {
                this.playAnimation();
            }
        }, 150 + drawDuration + processDelay + typeDelay + cycleDelay);
    }

    schedule(action, delay) {
        clearTimeout(this.sequenceTimer);
        this.sequenceTimer = setTimeout(action, delay);
    }

    drawCaptureBox(duration) {
        if (!this.captureBox) return;
        const length = this.captureBox.getTotalLength();
        this.captureBox.classList.add('is-drawing');
        this.captureBox.style.strokeDasharray = '18 12';
        this.captureBox.style.strokeDashoffset = length;
        requestAnimationFrame(() => {
            this.captureBox.style.transition = `stroke-dashoffset ${duration}ms ease-in-out, opacity 300ms ease-in-out`;
            this.captureBox.style.strokeDashoffset = '0';
        });
    }

    showProcessing() {
        if (this.processing) {
            this.processing.classList.add('is-active');
        }
    }

    typeCaption(instant) {
        if (!this.captionText) return;
        const fullText = this.captionText.dataset.fulltext || '';
        this.captionText.textContent = '';
        if (this.captionCaret) {
            this.captionCaret.classList.add('is-active');
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
        }, 55);
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
        clearTimeout(this.sequenceTimer);
        clearInterval(this.typingTimer);
        clearInterval(this.handTimer);
        this.sequenceTimer = null;
        this.typingTimer = null;
        this.handTimer = null;
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
