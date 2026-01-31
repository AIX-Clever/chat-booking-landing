import './style.css'
import './i18n/i18n.js';
import { initCookieBanner } from './components/CookieBanner.js';

initCookieBanner();

console.log('Lucia Landing Page Loaded 🚀');

// Chat Carousel Logic
const chatScenarios = [
  // Scenario 1: Services
  `
    <div class="msg bot">Hola, soy Lucia 👩‍💼</div>
    <div class="msg user">Hola, quiero una cita</div>
    <div class="msg bot">¡Claro! ¿Para qué servicio?</div>
  `,
  // Scenario 2: Provider Selection
  `
    <div class="msg bot">¿Con quién te gustaría atenderte?</div>
    <div class="msg user">Con la Dra. Lucia, por favor</div>
    <div class="msg bot">Perfecto. Buscando disponibilidad...</div>
  `,
  // Scenario 3: Data Collection
  `
    <div class="msg bot">¿A qué nombre reservo?</div>
    <div class="msg user">Lucia</div>
    <div class="msg bot">¡Listo Lucia! Tu cita está confirmada ✅</div>
  `
];

let currentScenarioIndex = 0;
const chatBody = document.getElementById('chat-carousel-body');

if (chatBody) {
  setInterval(() => {
    // 1. Fade out
    chatBody.classList.add('fade-out');

    // 2. Wait for transition, swap content, fade in
    setTimeout(() => {
      currentScenarioIndex = (currentScenarioIndex + 1) % chatScenarios.length;
      chatBody.innerHTML = chatScenarios[currentScenarioIndex];
      chatBody.classList.remove('fade-out');
    }, 500); // Matches CSS transition duration

  }, 4000); // Change every 4 seconds
}
