/**
 * SignFlow Main JavaScript
 * Initialization and utility functions
 */

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

// Initialize application
function initApp() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('signflow-theme');
    const theme = savedTheme || getSystemTheme();
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Initialize intersection observer for animations
    initIntersectionObserver();
    
    // Add event listeners
    setupEventListeners();
    
    // Initialize hash-based navigation
    initHashNavigation();
    
    // Handle initial hash after DOM ready
    setTimeout(() => {
        handleHashNavigation();
    }, 150);
}

// Hash-based navigation system
function initHashNavigation() {
    const navLinks = document.querySelectorAll('.navbar-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href && href !== '#') {
                // Just set hash - hashchange event will handle the rest
                window.location.hash = href;
            }
        }, { passive: false });
    });
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
        updateNavState();
        handleHashNavigation();
    }, { passive: true });
}

// Handle navigation to hash section
function handleHashNavigation() {
    const hash = window.location.hash || '#home';
    let targetSection = null;
    
    if (hash === '#home') {
        targetSection = document.querySelector('.hero');
    } else {
        targetSection = document.querySelector(hash);
    }
    
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update navigation state (underline position)
function updateNavState() {
    const hash = window.location.hash || '#home';
    const navLinks = document.querySelectorAll('.navbar-menu a[href^="#"]');
    const underline = document.querySelector('.nav-underline');
    
    if (!underline) return;
    
    let activeLink = null;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === hash) {
            activeLink = link;
        }
    });
    
    if (activeLink) {
        positionUnderline(activeLink, underline);
    }
}

// Position underline under active link
function positionUnderline(link, underline) {
    const rect = link.getBoundingClientRect();
    const menuRect = document.querySelector('.navbar-menu').getBoundingClientRect();
    
    const left = rect.left - menuRect.left;
    const width = rect.width;
    
    underline.style.left = left + 'px';
    underline.style.width = width + 'px';
}

// Setup intersection observer for scroll animations
function initIntersectionObserver() {
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
    document.querySelectorAll('[data-animation]').forEach(el => {
        observer.observe(el);
    });
}

// Setup general event listeners
function setupEventListeners() {
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

// Update nav based on scroll position
function updateNavFromScroll() {
    const scrollPos = window.scrollY + 150;
    const sections = [
        { hash: '#home', element: document.querySelector('.hero'), top: 0 },
        { hash: '#why-matters', element: document.querySelector('#why-matters'), top: 0 },
        { hash: '#how-works', element: document.querySelector('#how-works'), top: 0 },
        { hash: '#download', element: document.querySelector('#download'), top: 0 }
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
