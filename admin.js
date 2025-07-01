import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGMK2jEi-xYgUA0nssmGtuPb9YssYe3vY",
  authDomain: "prm-contactos.firebaseapp.com",
  databaseURL: "https://prm-contactos-default-rtdb.firebaseio.com",
  projectId: "prm-contactos",
  storageBucket: "prm-contactos.firebasestorage.app",
  messagingSenderId: "644617404812",
  appId: "1:644617404812:web:2580a6c1c5acac4e20d6a9",
  measurementId: "G-TF34X8C3QR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("formAdmin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const uid = document.getElementById("uid").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();
  const estado = document.getElementById("estado");

  if (!uid || !nombre || !email) {
    estado.textContent = "UID, nombre y email son obligatorios.";
    return;
  }

  try {
    await setDoc(doc(db, "usuarios", uid), {
      nombre,
      email,
      mensaje
    }, { merge: true });

    estado.textContent = "✅ Datos actualizados correctamente.";
  } catch (error) {
    console.error(error);
    estado.textContent = "❌ Error al actualizar: " + error.message;
  }
});