import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGMK2jEi-xYgUA0nssmGtuPb9YssYe3vY",
  authDomain: "prm-contactos.firebaseapp.com",
  projectId: "prm-contactos",
  storageBucket: "prm-contactos.appspot.com",
  messagingSenderId: "644617404812",
  appId: "1:644617404812:web:2580a6c1c5acac4e20d6a9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para debuguear
function debugLog(message, data = null) {
  console.log(`[DEBUG] ${message}`, data);
}

// Generar contraseña temporal segura
function generateTempPassword() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  let password = "";
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  const allChars = lower + upper + numbers + symbols;
  for (let i = 0; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Login con Google
window.login = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    debugLog("Login exitoso", result.user);
  } catch (error) {
    debugLog("Error en login", error);
    showError(`Error al iniciar sesión: ${error.message}`);
  }
};

// Verificar administrador
onAuthStateChanged(auth, async (user) => {
  debugLog("Estado de autenticación cambiado", user);
  if (user) {
    if (user.email === "lcortez@pmrcorp.com.mx") {
      document.getElementById("adminPanel").classList.remove("hidden");
      document.getElementById("loginDiv").classList.add("hidden");
      await cargarUsuarios();
    } else {
      showError("⛔ No tienes permisos de administrador.");
      await signOut(auth);
    }
  }
});

// Cerrar sesión
window.logout = async () => {
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    showError(`Error al cerrar sesión: ${error.message}`);
  }
};

// Cargar usuarios
async function cargarUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    debugLog("Usuarios obtenidos", querySnapshot.docs.map(doc => doc.data()));
    
    tbody.innerHTML = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return `
        <tr>
          <td>${doc.id}</td>
          <td>${data.nombre || "N/A"}</td>
          <td>${data.correo || "N/A"}</td>
          <td>${data.telefono || "N/A"}</td>
          <td>${data.mensaje || "N/A"}</td>
          <td>
            <button onclick="editarUsuario('${doc.id}', '${(data.nombre || "").replace(/'/g, "\\'")}', '${(data.correo || "").replace(/'/g, "\\'")}', '${(data.telefono || "").replace(/'/g, "\\'")}', '${(data.mensaje || "").replace(/'/g, "\\'")}')" class="secondary">
              Editar
            </button>
          </td>
          <td>
            <button onclick="eliminarUsuario('${doc.id}')" class="danger">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    }).join('') || "<tr><td colspan='7'>No hay usuarios</td></tr>";
  } catch (error) {
    debugLog("Error al cargar usuarios", error);
    showError(`Error al cargar usuarios: ${error.message}`);
    tbody.innerHTML = `<tr><td colspan='7'>Error: ${error.message}</td></tr>`;
  }
}

// Funciones del formulario
window.editarUsuario = (uid, nombre, correo, telefono, mensaje) => {
  document.getElementById("uidInput").value = uid;
  document.getElementById("nombreInput").value = nombre;
  document.getElementById("correoInput").value = correo;
  document.getElementById("telefonoInput").value = telefono;
  document.getElementById("mensajeInput").value = mensaje;
  document.getElementById("btnGuardar").textContent = "Actualizar";
};

window.nuevoUsuario = () => {
  document.getElementById("uidInput").value = "";
  document.getElementById("nombreInput").value = "";
  document.getElementById("correoInput").value = "";
  document.getElementById("telefonoInput").value = "";
  document.getElementById("mensajeInput").value = "";
  document.getElementById("btnGuardar").textContent = "Guardar";
};

// Función clave: Crear/Actualizar usuario
window.actualizarUsuario = async () => {
  const uid = document.getElementById("uidInput").value;
  const nombre = document.getElementById("nombreInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const telefono = document.getElementById("telefonoInput").value.trim();
  const mensaje = document.getElementById("mensajeInput").value.trim();

  if (!nombre || !correo) {
    showError("Nombre y correo son obligatorios");
    return;
  }

  try {
    const userData = { 
      nombre, 
      correo, 
      telefono: telefono || null, 
      mensaje: mensaje || null,
      ultimaActualizacion: new Date().toISOString()
    };

    if (uid) {
      // Actualizar existente
      await setDoc(doc(db, "usuarios", uid), userData, { merge: true });
      showSuccess("Usuario actualizado");
    } else {
      // Crear nuevo
      const tempPassword = generateTempPassword();
      debugLog("Intentando crear usuario en Auth", { correo, tempPassword });
      
      const userCredential = await createUserWithEmailAndPassword(auth, correo, tempPassword);
      const newUid = userCredential.user.uid;
      debugLog("Usuario creado en Auth", userCredential.user);
      
      userData.fechaCreacion = new Date().toISOString();
      await setDoc(doc(db, "usuarios", newUid), userData);
      debugLog("Documento creado en Firestore", userData);
      
      alert(`Usuario creado\nCorreo: ${correo}\nContraseña: ${tempPassword}`);
      showSuccess("Usuario creado exitosamente");
    }

    await cargarUsuarios();
    window.nuevoUsuario();
  } catch (error) {
    debugLog("Error completo", error);
    let errorMsg = `Error: ${error.code || error.message}`;
    
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "El correo ya está registrado";
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = "Correo inválido";
    }
    
    showError(errorMsg);
  }
};

// Eliminar usuario
window.eliminarUsuario = async (uid) => {
  if (!confirm("¿Eliminar este usuario?")) return;
  
  try {
    await deleteDoc(doc(db, "usuarios", uid));
    showSuccess("Usuario eliminado");
    await cargarUsuarios();
  } catch (error) {
    showError(`Error al eliminar: ${error.message}`);
  }
};

// Mostrar mensajes
function showSuccess(message) {
  const div = document.createElement("div");
  div.className = "success-message";
  div.textContent = message;
  document.querySelector(".container").prepend(div);
  setTimeout(() => div.remove(), 5000);
}

function showError(message) {
  const div = document.createElement("div");
  div.className = "error-message";
  div.textContent = message;
  document.querySelector(".container").prepend(div);
  setTimeout(() => div.remove(), 5000);
}

// Debug inicial
debugLog("Aplicación iniciada", { auth, db });
