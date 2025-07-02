import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  const loadingDiv = document.getElementById("datosUsuario");
  const contactInfoDiv = document.getElementById("contactInfo");
  const additionalInfoDiv = document.getElementById("additionalInfo");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");

  if (user) {
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Ocultar loader y mostrar datos
        loadingDiv.style.display = "none";
        
        // Actualizar cabecera del perfil
        if (userData.nombre) {
          userName.textContent = userData.nombre;
          // Mostrar iniciales si no hay avatar
          document.getElementById("avatarInitials").textContent = 
            userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        
        if (userData.correo) {
          userEmail.textContent = userData.correo;
        }

        // Información de contacto
        contactInfoDiv.innerHTML = `
          <div class="info-item">
            <span class="info-label">Nombre completo</span>
            <div class="info-value">${userData.nombre || "No especificado"}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Correo electrónico</span>
            <div class="info-value">${userData.correo || "No especificado"}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Teléfono</span>
            <div class="info-value">${userData.telefono || "No especificado"}</div>
          </div>
        `;

        // Información adicional
        additionalInfoDiv.innerHTML = `
          <div class="info-item">
            <span class="info-label">Mensaje</span>
            <div class="info-value">${userData.mensaje || "No hay mensaje"}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha de registro</span>
            <div class="info-value">${new Date(user.metadata.creationTime).toLocaleDateString()}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Último acceso</span>
            <div class="info-value">${new Date(user.metadata.lastSignInTime).toLocaleString()}</div>
          </div>
        `;
      } else {
        loadingDiv.innerHTML = '<div class="error-message">No hay datos disponibles para este usuario.</div>';
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      loadingDiv.innerHTML = `<div class="error-message">Error al cargar los datos: ${error.message}</div>`;
    }
  } else {
    loadingDiv.innerHTML = '<div class="error-message">No has iniciado sesión. Redirigiendo...</div>';
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
});
