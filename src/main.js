import './style.css'
import './i18n/i18n.js';
import { initCookieBanner } from './components/CookieBanner.js';

initCookieBanner();

console.log('Lucia Landing Page Loaded 🚀');

// Chat Carousel Logic - Showcasing different capabilities
const chatScenarios = [
  // Scenario 1: Initial greeting + service selection
  `
    <div class="msg bot">Hola, soy Lucia 👩‍💼</div>
    <div class="msg user">Hola, quiero una cita</div>
    <div class="msg bot">¡Claro! ¿Para qué servicio?</div>
  `,
  // Scenario 2: Provider selection
  `
    <div class="msg bot">¿Con quién te gustaría atenderte?</div>
    <div class="msg user">Con la Dra. Lucia, por favor</div>
    <div class="msg bot">Perfecto. Buscando disponibilidad...</div>
  `,
  // Scenario 3: Date/time selection
  `
    <div class="msg bot">📅 Fechas disponibles:</div>
    <div class="msg bot" style="font-size:0.85rem">Lunes 10:00 • Martes 15:30 • Miércoles 11:00</div>
    <div class="msg user">Martes 15:30</div>
  `,
  // Scenario 4: Confirmation
  `
    <div class="msg bot">¿A qué nombre reservo?</div>
    <div class="msg user">Lucia</div>
    <div class="msg bot">✅ ¡Listo Lucia! Tu cita está confirmada</div>
  `,
  // Scenario 5: Reschedule flow
  `
    <div class="msg user">Necesito cambiar mi cita</div>
    <div class="msg bot">Sin problema Lucia. ¿Qué día te queda mejor?</div>
    <div class="msg bot">📅 Jueves 10:00 • Viernes 14:00</div>
  `,
  // Scenario 6: 24/7 availability
  `
    <div class="msg bot" style="opacity:0.7;font-size:0.8rem">🌙 23:45</div>
    <div class="msg user">Hola, ¿puedo agendar ahora?</div>
    <div class="msg bot">¡Claro! Atiendo 24/7 🕐</div>
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
