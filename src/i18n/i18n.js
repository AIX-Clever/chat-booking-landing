import translations from './translations.js';

class I18n {
    constructor() {
        this.translations = translations;
        this.currentLang = this.detectLanguage();
        this.init();
    }

    detectLanguage() {
        // 1. Check localStorage
        const saved = localStorage.getItem('lucia-language');
        if (saved && ['es', 'en', 'pt'].includes(saved)) {
            return saved;
        }

        // 2. Check browser language
        const browserLang = navigator.language.toLowerCase();

        // Check for exact matches first
        if (['es', 'en', 'pt'].includes(browserLang)) {
            return browserLang;
        }

        // Check for language prefix (e.g., 'en-US' -> 'en')
        const langPrefix = browserLang.split('-')[0];
        if (['es', 'en', 'pt'].includes(langPrefix)) {
            return langPrefix;
        }

        // 3. Default to Spanish
        return 'es';
    }

    init() {
        // Set initial language
        document.documentElement.lang = this.currentLang;
        this.updatePage();

        // Mark active language button
        this.updateActiveButton();
    }

    setLanguage(lang) {
        if (!['es', 'en', 'pt'].includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('lucia-language', lang);
        document.documentElement.lang = lang;

        // Update page title
        document.title = this.t('meta.title');

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.t('meta.description');
        }

        this.updatePage();
        this.updateActiveButton();
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            value = value?.[k];
        }

        if (value === undefined) {
            console.warn(`Translation missing for key: ${key} in language: ${this.currentLang}`);
            return key;
        }

        return value;
    }

    updatePage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // Check if translation contains HTML
            if (translation.includes('<')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Update all elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });

        // Update all elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update all elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }

    updateActiveButton() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Create global instance
const i18n = new I18n();

// Setup language switcher buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            i18n.setLanguage(lang);
        });
    });
});

export default i18n;
