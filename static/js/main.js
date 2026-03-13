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

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isHomePage() {
    return Boolean(document.querySelector('.hero'));
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
        { hash: '#why-matters', element: document.querySelector('#why-matters'), top: 0 },
        { hash: '#how-works', element: document.querySelector('#how-works'), top: 0 },
        { hash: '#download', element: document.querySelector('#download'), top: 0 },
        { hash: '#donate', element: document.querySelector('#donate'), top: 0 }
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
