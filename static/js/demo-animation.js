/**
 * SignFlow Demo Animation
 * Handles the interactive demo animation sequence
 */

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const DEMO_MOTION = {
    dragDuration: 2300,
    processDelay: 950,
    typingDelay: 600,
    holdDuration: 3200,
    typingInterval: 90,
    startOffset: 250,
    postDragDelay: 180,
    loopPause: 700,
    typingDefault: 65,
    handInterval: 750
};

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
        const dragDuration = DEMO_MOTION.dragDuration;
        const processDelay = DEMO_MOTION.processDelay;
        const typingDelay = DEMO_MOTION.typingDelay;
        const holdDuration = DEMO_MOTION.holdDuration;
        const typingInterval = DEMO_MOTION.typingInterval;
        const text = (this.captionText && this.captionText.dataset.fulltext) || '';
        const typingDuration = Math.max(text.length * typingInterval, 600);

        this.sequenceTimers = [];
        this.schedule(() => this.drawSelection(dragDuration), DEMO_MOTION.startOffset);
        this.schedule(() => this.showProcessing(), DEMO_MOTION.startOffset + dragDuration + DEMO_MOTION.postDragDelay);
        this.schedule(
            () => this.typeCaption(false, typingInterval),
            DEMO_MOTION.startOffset + dragDuration + processDelay + typingDelay
        );
        this.schedule(
            () => this.resetAnimation(),
            DEMO_MOTION.startOffset + dragDuration + processDelay + typingDelay + typingDuration + holdDuration
        );
        this.schedule(() => {
            if (this.isAnimating) {
                this.playAnimation();
            }
        }, DEMO_MOTION.startOffset + dragDuration + processDelay + typingDelay + typingDuration + holdDuration + DEMO_MOTION.loopPause);
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

    typeCaption(instant, interval = DEMO_MOTION.typingDefault) {
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
        clearInterval(this.handTimer);
        this.handTimer = null;
    }

    stopSequence() {
        this.isAnimating = false;
        this.sequenceTimers.forEach(timer => clearTimeout(timer));
        this.sequenceTimers = [];
        clearInterval(this.typingTimer);
        clearInterval(this.handTimer);
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
