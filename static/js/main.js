/**
 * SignFlow Main JavaScript
 * Initialization and utility functions
 */

const safeStorage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Ignore storage errors (private mode, disabled storage, etc.)
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            // Ignore storage errors
        }
    }
};

const DOODLE_CONFIG = {
    minCount: 8,
    maxCount: 20,
    areaPerDoodle: 140000,
    minSize: 60,
    maxSize: 140,
    minOpacity: 0.04,
    maxOpacity: 0.08,
    insetPadding: 6
};

const DOODLE_SVGS = (() => {
    const toDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
    const buildSet = (stroke) => ([
        `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none"><path d="M16 42 C 36 12, 60 72, 86 42 S 124 72, 124 96" stroke="${stroke}" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="18" stroke="${stroke}" stroke-opacity="0.55" stroke-width="2"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none"><path d="M20 100 L70 30 L120 100 Z" stroke="${stroke}" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><path d="M60 12 L66 46 L100 52 L66 58 L60 96 L54 58 L20 52 L54 46 Z" stroke="${stroke}" stroke-opacity="0.55" stroke-width="2" stroke-linejoin="round"/></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none"><path d="M20 70 C 20 40, 120 40, 120 70 C 120 100, 20 100, 20 70 Z" stroke="${stroke}" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    ]);

    return {
        light: buildSet('#000000').map(toDataUri),
        dark: buildSet('#ffffff').map(toDataUri)
    };
})();

let doodleResizeTimer;

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isHomePage() {
    return Boolean(document.querySelector('.hero'));
}

function getDoodleSet() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? DOODLE_SVGS.dark : DOODLE_SVGS.light;
}

function buildDoodlesForSection(section, doodles) {
    if (!section) return;

    let layer = section.querySelector('.doodle-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.className = 'doodle-layer';
        layer.setAttribute('aria-hidden', 'true');
        section.insertBefore(layer, section.firstChild);
    }

    layer.innerHTML = '';

    const area = section.offsetWidth * section.offsetHeight;
    const estimated = Math.round(area / DOODLE_CONFIG.areaPerDoodle);
    const count = Math.min(
        DOODLE_CONFIG.maxCount,
        Math.max(DOODLE_CONFIG.minCount, estimated)
    );

    for (let i = 0; i < count; i += 1) {
        const doodle = document.createElement('span');
        doodle.className = 'doodle';
        const size = DOODLE_CONFIG.minSize + Math.random() * (DOODLE_CONFIG.maxSize - DOODLE_CONFIG.minSize);
        const top = DOODLE_CONFIG.insetPadding + Math.random() * (100 - DOODLE_CONFIG.insetPadding * 2);
        const left = DOODLE_CONFIG.insetPadding + Math.random() * (100 - DOODLE_CONFIG.insetPadding * 2);

        doodle.style.width = `${size.toFixed(0)}px`;
        doodle.style.height = `${size.toFixed(0)}px`;
        doodle.style.top = `${top.toFixed(2)}%`;
        doodle.style.left = `${left.toFixed(2)}%`;
        doodle.style.opacity = (DOODLE_CONFIG.minOpacity + Math.random() * (DOODLE_CONFIG.maxOpacity - DOODLE_CONFIG.minOpacity)).toFixed(2);
        doodle.style.transform = `rotate(${Math.round(Math.random() * 360)}deg)`;
        doodle.style.backgroundImage = `url("${doodles[Math.floor(Math.random() * doodles.length)]}")`;

        layer.appendChild(doodle);
    }
}

function initDoodleLayers() {
    const sections = document.querySelectorAll('section, .footer');
    const doodles = getDoodleSet();
    sections.forEach(section => buildDoodlesForSection(section, doodles));
}

// Detect user's system theme preference
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Navigation state
let lastScrollTime = 0;
let scrollTimeout;
const SCROLL_DEBOUNCE = 100;
let suppressScrollSpyUntil = 0;

// Initialize application
function initApp() {
    // Check for saved theme preference
    const savedTheme = safeStorage.get('signflow-theme');
    const theme = savedTheme || getSystemTheme();

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Initialize random background doodles
    initDoodleLayers();

    // Initialize intersection observer for animations
    initIntersectionObserver();

    // Add event listeners
    setupEventListeners();

    // Initialize mobile navigation
    initMobileNav();

    if (isHomePage()) {
        // Initialize hash-based navigation
        initHashNavigation();

        // Handle initial hash after DOM ready
        setTimeout(() => {
            handleHashNavigation();
            updateNavState();
        }, 150);
    }

    window.addEventListener('themechange', () => {
        initDoodleLayers();
    });

    window.addEventListener('resize', () => {
        clearTimeout(doodleResizeTimer);
        doodleResizeTimer = setTimeout(initDoodleLayers, 200);
    }, { passive: true });
}

// Hash-based navigation system
function initHashNavigation() {
    if (!isHomePage()) return;

    const navLinks = document.querySelectorAll('.navbar-menu a[data-scroll]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isHomePage()) return;

            const targetHash = link.hash;
            if (!targetHash) return;

            const targetSection = targetHash === '#home'
                ? document.querySelector('.hero')
                : document.querySelector(targetHash);

            if (!targetSection) return;

            e.preventDefault();
            suppressScrollSpyUntil = Date.now() + 1200;

            if (window.location.hash !== targetHash) {
                window.location.hash = targetHash;
            } else {
                handleHashNavigation();
                updateNavState();
            }
        }, { passive: false });
    });

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
        updateNavState();
        handleHashNavigation();
    }, { passive: true });
}

function scrollToSection(targetSection) {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    targetSection.scrollIntoView({ behavior });
}

// Handle navigation to hash section
function handleHashNavigation() {
    if (!isHomePage()) return;

    const hash = window.location.hash || '#home';
    const targetSection = hash === '#home'
        ? document.querySelector('.hero')
        : document.querySelector(hash);

    if (targetSection) {
        suppressScrollSpyUntil = Math.max(suppressScrollSpyUntil, Date.now() + 1200);
        scrollToSection(targetSection);
        updateNavState();
    }
}

// Update navigation state (underline position)
function updateNavState() {
    if (!isHomePage()) return;

    const hash = window.location.hash || '#home';
    const navLinks = document.querySelectorAll('.navbar-menu a[data-scroll]');
    const underline = document.querySelector('.nav-underline');

    if (!underline || !navLinks.length) return;

    let activeLink = null;

    navLinks.forEach(link => {
        if (link.hash === hash) {
            activeLink = link;
        }
    });

    if (activeLink) {
        positionUnderline(activeLink, underline);
    }
}

// Position underline under active link
function positionUnderline(link, underline) {
    const menu = document.querySelector('.navbar-menu');
    if (!menu) return;

    const menuRect = menu.getBoundingClientRect();
    if (menuRect.width === 0 || menuRect.height === 0) return;

    const rect = link.getBoundingClientRect();
    const left = rect.left - menuRect.left;
    const width = rect.width;

    underline.style.left = left + 'px';
    underline.style.width = width + 'px';
}

// Setup intersection observer for scroll animations
function initIntersectionObserver() {
    const animatedItems = document.querySelectorAll('[data-animation]');

    if (!animatedItems.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        animatedItems.forEach(el => el.classList.add('animated'));
        return;
    }

    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.getAttribute('data-animation');
                if (animationType) {
                    entry.target.classList.add('animated');
                }
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe all elements with animation attributes
    animatedItems.forEach(el => {
        observer.observe(el);
    });
}

// Setup general event listeners
function setupEventListeners() {
    if (isHomePage()) {
        // Debounced scroll handler for nav updates
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime < SCROLL_DEBOUNCE) return;
            lastScrollTime = now;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateNavFromScroll, SCROLL_DEBOUNCE);
        }, { passive: true });

        // Update underline on resize
        window.addEventListener('resize', updateNavState, { passive: true });
    }
}

// Mobile navigation toggle
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (!toggle || !menu) return;

    const setExpanded = (isOpen) => {
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.classList.toggle('is-open', isOpen);
        menu.classList.toggle('is-open', isOpen);
    };

    const closeMenu = () => setExpanded(false);

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.contains('is-open');
        setExpanded(!isOpen);
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('is-open')) return;
        if (menu.contains(event.target) || toggle.contains(event.target)) return;
        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    }, { passive: true });
}

// Update nav based on scroll position
function updateNavFromScroll() {
    if (!isHomePage()) return;
    if (Date.now() < suppressScrollSpyUntil) return;

    const scrollPos = window.scrollY + 150;
    const sections = [
        { hash: '#home', element: document.querySelector('.hero'), top: 0 },
        { hash: '#demo', element: document.querySelector('#demo'), top: 0 },
        { hash: '#why-matters', element: document.querySelector('#why-matters'), top: 0 },
        { hash: '#how-works', element: document.querySelector('#how-works'), top: 0 },
        { hash: '#download', element: document.querySelector('#download'), top: 0 },
        { hash: '#donate', element: document.querySelector('#donate'), top: 0 },
        { hash: '#login', element: document.querySelector('#login'), top: 0 }
    ];

    let activeHash = '#home';

    for (let section of sections) {
        if (section.element) {
            section.top = section.element.offsetTop;
        }
    }

    for (let i = 0; i < sections.length; i++) {
        const current = sections[i];
        const next = sections[i + 1];

        if (scrollPos >= current.top && (!next || scrollPos < next.top)) {
            activeHash = current.hash;
            break;
        }
    }

    if (window.location.hash !== activeHash) {
        history.replaceState(null, null, activeHash);
        updateNavState();
    }
}

// Utility function to add CSS class with animation
function addAnimationClass(element, animationClass, onComplete) {
    element.classList.add(animationClass);

    if (onComplete) {
        element.addEventListener('animationend', () => {
            onComplete();
        }, { once: true });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export functions for use in other scripts
window.SignFlow = {
    getSystemTheme,
    initIntersectionObserver,
    addAnimationClass
};
