// =============================
// 1) NAV MOBILE (menu)
// =============================
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // close menu when click a link (mobile)
  navMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// =============================
// 2) LOGIN MODAL (UI ONLY)
// =============================
const loginOpenBtn = document.getElementById("loginOpen");
const loginModal = document.getElementById("loginModal");
const loginOverlay = document.getElementById("loginOverlay");
const loginCloseBtn = document.getElementById("loginClose");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");
const loginTitle = document.getElementById("loginTitle");

function openLoginModal() {
  loginModal.classList.add("open");
  loginModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  // default: login
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  loginTitle.textContent = "Connexion";
  if (loginMsg) loginMsg.textContent = "";
  if (registerMsg) registerMsg.textContent = "";
}

function closeLoginModal() {
  loginModal.classList.remove("open");
  loginModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

if (loginOpenBtn) loginOpenBtn.addEventListener("click", openLoginModal);
if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);
if (loginOverlay) loginOverlay.addEventListener("click", closeLoginModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && loginModal && loginModal.classList.contains("open")) {
    closeLoginModal();
  }
});

if (showRegisterBtn) {
  showRegisterBtn.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    loginTitle.textContent = "Créer un compte";
    if (loginMsg) loginMsg.textContent = "";
  });
}

if (showLoginBtn) {
  showLoginBtn.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    loginTitle.textContent = "Connexion";
    if (registerMsg) registerMsg.textContent = "";
  });
}

// Demo submits (UI only)
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (registerMsg) registerMsg.textContent = "✅ Compte créé (démo).";
  });
}
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (loginMsg) loginMsg.textContent = "✅ Connecté (démo).";
  });
}

// =============================
// 3) FOOTER YEAR
// =============================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============================
// 4) QUICK FORM (simple message)
// =============================
const quickForm = document.getElementById("quickForm");
const quickMsg = document.getElementById("quickMsg");
if (quickForm) {
  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (quickMsg) quickMsg.textContent = "✅ Merci ! Nous vous contacterons bientôt.";
    quickForm.reset();
  });
}

// =============================
// 5) EMAILJS (Verification + Admin Send)
// =============================

// Load EmailJS library dynamically
(function loadEmailJS() {
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
  s.onload = initEmailJS;
  document.head.appendChild(s);
})();

function initEmailJS() {
  // Your EmailJS keys
  emailjs.init("cu-Y4DMRjNHwixIkv");

  const contactForm = document.getElementById("contactForm");
  const contactMsg = document.getElementById("contactMsg");
  let generatedCode = "";

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (contactMsg) contactMsg.textContent = "";

    const name = document.querySelector("[name='name']").value.trim();
    const email = document.querySelector("[name='email']").value.trim();
    const phone = document.querySelector("[name='phone']").value.trim();
    const subject = document.querySelector("[name='subject']").value.trim();
    const message = document.querySelector("[name='message']").value.trim();

    generatedCode = String(Math.floor(100000 + Math.random() * 900000));

    try {
      if (contactMsg) contactMsg.textContent = "⏳ Envoi du code de vérification...";

      // Send code to user (OTP template)
      await emailjs.send("service_sb5emko", "template_3u2bkmj", {
        email: email,
        code: generatedCode
      });

      if (contactMsg) contactMsg.textContent = "✅ Code envoyé. Vérifiez votre email.";

      const userCode = prompt("Entrez le code reçu dans votre email :");

      if (userCode && userCode.trim() === generatedCode) {
        // Send to admin template
        await emailjs.send("service_sb5emko", "template_xmjs2zg", {
          name: name,
          email: email,
          phone: phone,
          subject: subject,
          message: message
        });

        alert("✅ Demande envoyée avec succès");
        contactForm.reset();
        if (contactMsg) contactMsg.textContent = "✅ Merci ! Votre demande a été envoyée.";
      } else {
        alert("❌ Code incorrect");
        if (contactMsg) contactMsg.textContent = "❌ Code incorrect. Veuillez réessayer.";
      }
    } catch (err) {
      console.log(err);
      alert("❌ Erreur lors de l'envoi (EmailJS).");
      if (contactMsg) contactMsg.textContent = "❌ Erreur. Vérifiez EmailJS ou votre connexion.";
    }
  });
}