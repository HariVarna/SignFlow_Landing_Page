/**
 * SignFlow Theme Toggle
 * Manages light/dark theme switching
 */

class ThemeToggle {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.htmlElement = document.documentElement;
        
        if (this.themeToggleBtn) {
            this.init();
        }
    }

    init() {
        // Get saved theme or system preference
        const savedTheme = localStorage.getItem('signflow-theme');
        const systemTheme = this.getSystemTheme();
        const currentTheme = savedTheme || systemTheme;

        // Apply the theme on page load
        this.setTheme(currentTheme, false);

        // Add click listener to toggle button
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const newTheme = e.matches ? 'dark' : 'light';
                this.setTheme(newTheme, false);
            });
        }
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    getCurrentTheme() {
        return this.htmlElement.getAttribute('data-theme') || 'light';
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
    }

    setTheme(theme, savePreference = true) {
        // Apply theme to document
        this.htmlElement.setAttribute('data-theme', theme);

        // Save preference if user manually changed it
        if (savePreference) {
            localStorage.setItem('signflow-theme', theme);
        } else {
            localStorage.removeItem('signflow-theme');
        }

        // Trigger theme change event for other scripts
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        if (theme === 'dark') {
            metaThemeColor.setAttribute('content', '#0a0e27');
        } else {
            metaThemeColor.setAttribute('content', '#ffffff');
        }
    }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeToggle();
    });
} else {
    new ThemeToggle();
}

// Export for use in other scripts
window.ThemeToggle = ThemeToggle;
