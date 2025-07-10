import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGMK2jEi-xYgUA0nssmGtuPb9YssYe3vY",
  authDomain: "prm-contactos.firebaseapp.com",
  projectId: "prm-contactos",
  storageBucket: "prm-contactos.appspot.com",
  messagingSenderId: "644617404812",
  appId: "1:644617404812:web:2580a6c1c5acac4e20d6a9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🧾 Login con Google
window.login = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Usuario autenticado:", result.user);
  } catch (error) {
    console.error("Error detallado:", error);
    showError("Error al iniciar sesión: " + error.message);
    
    // Errores específicos
    if (error.code === 'auth/popup-blocked') {
      showError("El navegador bloqueó la ventana emergente. Permite popups para este sitio.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      showError("Cerraste la ventana de inicio de sesión demasiado pronto.");
    }
  }
};

// 🔐 Verificación del administrador
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    if (email === "lcortez@pmrcorp.com.mx") {
      document.getElementById("adminPanel").classList.remove("hidden");
      document.getElementById("loginDiv").classList.add("hidden");
      await cargarUsuarios();
    } else {
      showError("⛔ No tienes permisos de administrador.");
      await signOut(auth);
    }
  }
});

// 🚪 Cerrar sesión
window.logout = async () => {
  await signOut(auth);
  window.location.reload();
};

// 🔄 Mostrar usuarios en tabla
async function cargarUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "<tr><td colspan='6' class='text-center'>Cargando usuarios...</td></tr>";

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    
    if (querySnapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='6' class='text-center'>No hay usuarios registrados</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.className = "animate-fade";

      // Escapar comillas simples para el onclick
      const nombreEscapado = (data.nombre || "").replace(/'/g, "\\'");
      const correoEscapado = (data.correo || "").replace(/'/g, "\\'");
      const telefonoEscapado = (data.telefono || "").replace(/'/g, "\\'");
      const mensajeEscapado = (data.mensaje || "").replace(/'/g, "\\'");
      const archivoEscapado = (data.archivo || "").replace(/'/g, "\\'");

      tr.innerHTML = `
        <td>${docSnap.id}</td>
        <td>${data.nombre || "N/A"}</td>
        <td>${data.correo || "N/A"}</td>
        <td>${data.telefono || "N/A"}</td>
        <td>${data.mensaje || "N/A"}</td>
        <td>${data.archivo || "N/A"}</td>
        <td>
          <button onclick="editarUsuario('${docSnap.id}', '${nombreEscapado}', '${correoEscapado}', '${telefonoEscapado}', '${mensajeEscapado}', '${archivoEscapado}')" class="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
            Editar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    tbody.innerHTML = `<tr><td colspan='6' class='text-center'>Error al cargar: ${error.message}</td></tr>`;
  }
}

// ✏️ Cargar datos al formulario
window.editarUsuario = (uid, nombre, correo, telefono, mensaje, archivo) => {
  document.getElementById("uidInput").value = uid;
  document.getElementById("nombreInput").value = nombre;
  document.getElementById("correoInput").value = correo;
  document.getElementById("telefonoInput").value = telefono;
  document.getElementById("mensajeInput").value = mensaje;
  document.getElementById("archivoInput").value = archivo;
  
  // Scroll suave al formulario
  document.getElementById("uidInput").scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
};

// 💾 Guardar cambios
window.actualizarUsuario = async () => {
  const uid = document.getElementById("uidInput").value.trim();
  const nombre = document.getElementById("nombreInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const telefono = document.getElementById("telefonoInput").value.trim();
  const mensaje = document.getElementById("mensajeInput").value.trim();
  const archivo = document.getElementById("archivoInput").value.trim();

  // Validaciones
  if (!uid || !nombre) {
    showError("⚠️ UID y nombre son campos obligatorios.");
    return;
  }
  
  if (!correo && !telefono) {
    showError("⚠️ Debes ingresar al menos un correo o un teléfono.");
    return;
  }

  try {
    await setDoc(doc(db, "usuarios", uid), { 
      nombre, 
      correo: correo || null, 
      telefono: telefono || null, 
      mensaje: mensaje || null 
    }, { merge: true });
    
    showSuccess("✅ Usuario actualizado correctamente.");
    await cargarUsuarios();
    
    // Limpiar formulario
    document.getElementById("uidInput").value = "";
    document.getElementById("nombreInput").value = "";
    document.getElementById("correoInput").value = "";
    document.getElementById("telefonoInput").value = "";
    document.getElementById("mensajeInput").value = "";
    document.getElementById("archivoInput").value = "";
  } catch (error) {
    showError(`❌ Error al guardar: ${error.message}`);
  }
};


// Mostrar mensaje de éxito
function showSuccess(message) {
  const statusDiv = document.querySelector(".success-message");
  statusDiv.textContent = message;
  statusDiv.style.display = "flex";
  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 5000);
}

// Mostrar mensaje de error
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message status-message";
  errorDiv.innerHTML = message;
  
  const container = document.querySelector(".container");
  container.prepend(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
