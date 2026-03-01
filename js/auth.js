import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ❌ ما تخدمش دابا حتى تلسّق firebaseConfig (غدا)
if (!firebaseConfig) {
  console.warn("Firebase config manquant. Ajoute-le demain dans js/firebase-config.js");
}

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const loginModal = document.getElementById("loginModal");
const loginOverlay = document.getElementById("loginOverlay");
const loginOpenBtn = document.getElementById("loginOpen");
const loginCloseBtn = document.getElementById("loginClose");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");
const loginTitle = document.getElementById("loginTitle");

function openLoginModal(){
  loginModal.classList.add("open");
  document.body.classList.add("no-scroll");
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  loginTitle.textContent = "Connexion";
  if (loginMsg) loginMsg.textContent = "";
  if (registerMsg) registerMsg.textContent = "";
}
function closeLoginModal(){
  loginModal.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

if (loginOpenBtn) loginOpenBtn.addEventListener("click", openLoginModal);
if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);
if (loginOverlay) loginOverlay.addEventListener("click", closeLoginModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && loginModal.classList.contains("open")) closeLoginModal();
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

// ✅ اليوم: غير UI message
// ✅ غدا: منين تحط firebaseConfig، هادشي غادي يخدم بوحدو
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth || !db) {
      if (registerMsg) registerMsg.textContent = "⛔ Firebase غير جاهز. رجع غدا وحط config.";
      return;
    }

    registerMsg.textContent = "⏳ Création du compte...";

    const name = registerForm.querySelector("[name='reg_name']").value.trim();
    const email = registerForm.querySelector("[name='reg_email']").value.trim();
    const pass = registerForm.querySelector("[name='reg_password']").value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, createdAt: serverTimestamp()
      });

      await setDoc(doc(db, "dossiers", cred.user.uid), {
        ownerEmail: email,
        createdAt: serverTimestamp(),
        status: "Nouveau",
        steps: { reception:true, analyse:false, documents:false, soumission:false, finalisation:false },
        note: "Votre dossier est créé. Nous vous contacterons bientôt."
      });

      registerMsg.textContent = "✅ Compte créé. Redirection...";
      closeLoginModal();
      window.location.href = "dashboard.html";
    } catch (err) {
      registerMsg.textContent = "❌ " + (err?.message || "Erreur");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth) {
      if (loginMsg) loginMsg.textContent = "⛔ Firebase غير جاهز. رجع غدا وحط config.";
      return;
    }

    loginMsg.textContent = "⏳ Connexion...";

    const email = loginForm.querySelector("[name='login_email']").value.trim();
    const pass = loginForm.querySelector("[name='login_password']").value;

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      loginMsg.textContent = "✅ Connecté. Redirection...";
      closeLoginModal();
      window.location.href = "dashboard.html";
    } catch (err) {
      loginMsg.textContent = "❌ Email ou mot de passe incorrect.";
    }
  });
}

// optional: change navbar button text if logged in
const loginBtnText = document.querySelector("#loginOpen .login-text");
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (!loginBtnText) return;
    if (user && db) {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : null;
      loginBtnText.textContent = data?.name ? data.name : "Mon espace";
    } else {
      loginBtnText.textContent = "Connexion";
    }
  });
}