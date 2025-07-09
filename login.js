import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGMK2jEi-xYgUA0nssmGtuPb9YssYe3vY",
  authDomain: "prm-contactos.firebaseapp.com",
  databaseURL: "https://prm-contactos-default-rtdb.firebaseio.com",
  projectId: "prm-contactos",
  storageBucket: "prm-contactos.appspot.com",
  messagingSenderId: "644617404812",
  appId: "1:644617404812:web:2580a6c1c5acac4e20d6a9",
  measurementId: "G-TF34X8C3QR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.loginConGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid; // Usamos uid en lugar de vid

    // Verificamos si el usuario está registrado en Firestore
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("uid", "==", uid)); // Buscamos por uid
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Usuario autorizado
      window.location.href = "perfil.html";
    } else {
      // No está autorizado → cerrar sesión
      await signOut(auth);
      alert("⛔ Esta cuenta no está registrada en la base de datos.");
    }
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    alert("❌ Error: " + error.message);
  }
};
// 🔑 Inicio de sesión con correo y contraseña
window.login = async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!email || !pass) {
    alert("⚠️ Por favor, completa todos los campos.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
      // Usuario normal
      window.location.href = "perfil.html";
  } catch (e) {
    alert("❌ Error: " + e.message);
  }
};

