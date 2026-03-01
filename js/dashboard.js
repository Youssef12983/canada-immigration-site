import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const welcomeText = document.getElementById("welcomeText");
const stepsBox = document.getElementById("stepsBox");
const statusText = document.getElementById("statusText");
const noteText = document.getElementById("noteText");
const logoutBtn = document.getElementById("logoutBtn");

const stepLabels = {
  reception: "Réception de la demande",
  analyse: "Analyse du dossier",
  documents: "Collecte des documents",
  soumission: "Soumission",
  finalisation: "Finalisation"
};

function renderSteps(steps) {
  stepsBox.innerHTML = "";
  Object.keys(stepLabels).forEach((k) => {
    const ok = !!steps?.[k];
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.padding = ".65rem .8rem";
    row.style.border = "1px solid rgba(0,0,0,.08)";
    row.style.borderRadius = "14px";
    row.style.background = "rgba(245,245,245,.6)";
    row.innerHTML = `
      <strong style="color:var(--blue)">${stepLabels[k]}</strong>
      <span style="font-weight:900; color:${ok ? "var(--red)" : "rgba(51,51,51,.55)"}">
        ${ok ? "✅" : "⏳"}
      </span>
    `;
    stepsBox.appendChild(row);
  });
}

if (!firebaseConfig) {
  welcomeText.textContent = "⛔ Firebase غير جاهز. غدا لصّق config ف js/firebase-config.js";
  statusText.textContent = "—";
  noteText.textContent = "—";
  renderSteps({});
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    welcomeText.textContent = `Connecté: ${user.email}`;

    const dossierSnap = await getDoc(doc(db, "dossiers", user.uid));
    if (!dossierSnap.exists()) {
      statusText.textContent = "Aucun dossier trouvé.";
      noteText.textContent = "—";
      renderSteps({});
      return;
    }

    const dossier = dossierSnap.data();
    statusText.textContent = dossier.status || "—";
    noteText.textContent = dossier.note || "—";
    renderSteps(dossier.steps || {});
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
}