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

// 🔐 Inicio de sesión con Google
window.loginConGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    // 1. Iniciar sesión con Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Verificar que el user y su UID existan
    if (!user || !user.uid) {
      throw new Error("No se pudo obtener el UID del usuario.");
    }

    // 3. Obtener referencia a Firestore
    const usuariosRef = collection(db, "usuarios");
    
    // 4. Buscar en Firestore (Ajusta "uid" por el campo correcto que usas en tu DB)
    const q = query(usuariosRef, where("uid", "==", user.uid));  // 👈 Cambia "uid" por "vid" si es necesario
    const querySnapshot = await getDocs(q);

    // 5. Redirigir o denegar acceso
    if (!querySnapshot.empty) {
      window.location.href = "perfil.html"; // ✅ Usuario autorizado
    } else {
      await signOut(auth); // ⛔ Cerrar sesión si no está registrado
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

