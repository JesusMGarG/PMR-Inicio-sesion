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

// Función para verificar si un usuario existe en Firestore
async function usuarioAutorizado(uid, email) {
  try {
    const usuariosRef = collection(db, "usuarios");
    // Buscamos tanto por uid como por correo para mayor seguridad
    const q = query(usuariosRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error verificando usuario:", error);
    return false;
  }
}

window.loginConGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verificamos si el usuario está registrado en Firestore
    const autorizado = await usuarioAutorizado(user.uid, user.email);
    
    if (autorizado) {
      window.location.href = "perfil.html";
    } else {
      await signOut(auth);
      alert("⛔ No tienes permiso para acceder. Contacta al administrador.");
    }
  } catch (error) {
    console.error("❌ Error al iniciar sesión con Google:", error);
    const errorMessage = error.code === 'auth/popup-closed-by-user' 
      ? "El popup de inicio de sesión fue cerrado" 
      : error.message;
    alert("❌ Error: " + errorMessage);
  }
};

window.login = async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!email || !pass) {
    alert("⚠️ Por favor, completa todos los campos.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    // Verificamos si el usuario está registrado en Firestore
    const autorizado = await usuarioAutorizado(user.uid, user.email);
    
    if (autorizado) {
      window.location.href = "perfil.html";
    } else {
      await signOut(auth);
      alert("⛔ No tienes permiso para acceder. Contacta al administrador.");
    }
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    let errorMessage = "Error al iniciar sesión";
    
    switch(error.code) {
      case 'auth/invalid-email':
        errorMessage = "El correo electrónico no es válido";
        break;
      case 'auth/user-disabled':
        errorMessage = "Esta cuenta ha sido deshabilitada";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = "Correo electrónico o contraseña incorrectos";
        break;
      default:
        errorMessage = error.message;
    }
    
    alert("❌ " + errorMessage);
  }
};
