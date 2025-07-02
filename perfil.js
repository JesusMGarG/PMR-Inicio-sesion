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
  const loadingState = document.getElementById("loadingState");
  const userContent = document.getElementById("userContent");
  const userAvatar = document.getElementById("userAvatar");
  const avatarInitials = document.getElementById("avatarInitials");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const contactInfo = document.getElementById("contactInfo");
  const additionalInfo = document.getElementById("additionalInfo");

  if (user) {
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Actualizar cabecera del perfil
        if (userData.nombre) {
          userName.textContent = userData.nombre;
          // Crear iniciales si no hay imagen
          const names = userData.nombre.split(' ');
          const initials = names.length > 1 
            ? `${names[0][0]}${names[names.length-1][0]}`.toUpperCase()
            : names[0][0].toUpperCase();
          avatarInitials.textContent = initials;
        }
        
        if (userData.correo) {
          userEmail.textContent = userData.correo;
        }

        // Información de contacto
        contactInfo.innerHTML = `
          <h3>Información de contacto</h3>
          <div class="info-grid">
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
          </div>
        `;

        // Información adicional
        additionalInfo.innerHTML = `
          <h3>Detalles adicionales</h3>
          <div class="info-grid">
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
          </div>
        `;

        // Ocultar loader y mostrar contenido
        loadingState.classList.add("hidden");
        userContent.classList.remove("hidden");
        
      } else {
        loadingState.innerHTML = '<div class="error-message">No hay datos disponibles para este usuario.</div>';
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      loadingState.innerHTML = `<div class="error-message">Error al cargar los datos: ${error.message}</div>`;
    }
  } else {
    loadingState.innerHTML = '<div class="error-message">No has iniciado sesión. Redirigiendo...</div>';
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
});
