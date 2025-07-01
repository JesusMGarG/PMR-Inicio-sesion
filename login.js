import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);

window.login = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if (email == "lcortez@pmrcorp.com.mx" && pass == "Mkt2025Liz"){
    signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      // Guardamos sesión (opcional)
      window.location.href = "admin.html"; // Redirige a la página de perfil
    })
    .catch(e => alert("Error: " + e.message));

  }else{

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      // Guardamos sesión (opcional)
      window.location.href = "perfil.html"; // Redirige a la página de perfil
    })
    .catch(e => alert("Error: " + e.message));}
};