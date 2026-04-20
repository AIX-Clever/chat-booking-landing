
export function initCookieBanner() {
    const cookieAccepted = localStorage.getItem('cookieConsentAccepted');

    if (cookieAccepted) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <h3 data-i18n="cookies.title">Configuración de Cookies</h3>
            <p data-i18n="cookies.message">Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico.</p>
            <div class="cookie-actions">
                <a href="/privacy.html" data-i18n="cookies.learnMore" class="cookie-link">Más información</a>
                <button id="accept-cookies" data-i18n="cookies.accept" class="cookie-btn">Aceptar Cookies</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Apply translations initially
    if (window.applyTranslations) {
        window.applyTranslations();
    }

    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsentAccepted', 'true');
        banner.classList.add('hidden');
        setTimeout(() => banner.remove(), 500);
    });
}
