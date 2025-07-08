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
  deleteDoc, 
  addDoc 
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧾 Login con Google
window.login = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    showError("Error al iniciar sesión: " + error.message);
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
  tbody.innerHTML = "<tr><td colspan='7' class='text-center'>Cargando usuarios...</td></tr>";

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    
    if (querySnapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='7' class='text-center'>No hay usuarios registrados</td></tr>";
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

      tr.innerHTML = `
        <td>${docSnap.id}</td>
        <td>${data.nombre || "N/A"}</td>
        <td>${data.correo || "N/A"}</td>
        <td>${data.telefono || "N/A"}</td>
        <td>${data.mensaje || "N/A"}</td>
        <td>
          <button onclick="editarUsuario('${docSnap.id}', '${nombreEscapado}', '${correoEscapado}', '${telefonoEscapado}', '${mensajeEscapado}')" class="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
            Editar
          </button>
        </td>
        <td>
          <button onclick="eliminarUsuario('${docSnap.id}')" class="danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/>
            </svg>
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    tbody.innerHTML = `<tr><td colspan='7' class='text-center'>Error al cargar: ${error.message}</td></tr>`;
  }
}

// ✏️ Cargar datos al formulario
window.editarUsuario = (uid, nombre, correo, telefono, mensaje) => {
  document.getElementById("uidInput").value = uid;
  document.getElementById("nombreInput").value = nombre;
  document.getElementById("correoInput").value = correo;
  document.getElementById("telefonoInput").value = telefono;
  document.getElementById("mensajeInput").value = mensaje;
  
  // Cambiar texto del botón a "Actualizar"
  document.getElementById("btnGuardar").textContent = "Actualizar";
  
  // Scroll suave al formulario
  document.getElementById("uidInput").scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
};

// 🆕 Agregar nuevo usuario
window.nuevoUsuario = () => {
  // Limpiar formulario
  document.getElementById("uidInput").value = "";
  document.getElementById("nombreInput").value = "";
  document.getElementById("correoInput").value = "";
  document.getElementById("telefonoInput").value = "";
  document.getElementById("mensajeInput").value = "";
  
  // Cambiar texto del botón a "Guardar"
  document.getElementById("btnGuardar").textContent = "Guardar";
  
  // Enfocar el primer campo
  document.getElementById("nombreInput").focus();
};

// 💾 Guardar cambios (con creación de usuario en Auth)
window.actualizarUsuario = async () => {
  const uid = document.getElementById("uidInput").value.trim();
  const nombre = document.getElementById("nombreInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const telefono = document.getElementById("telefonoInput").value.trim();
  const mensaje = document.getElementById("mensajeInput").value.trim();

  // Validaciones
  if (!nombre) {
    showError("⚠️ El nombre es obligatorio.");
    return;
  }
  
  if (!correo) {
    showError("⚠️ El correo es obligatorio para crear el usuario.");
    return;
  }

  try {
    const userData = { 
      nombre, 
      correo, 
      telefono: telefono || null, 
      mensaje: mensaje || null 
    };
    
    if (uid) {
      // Actualizar usuario existente
      await setDoc(doc(db, "usuarios", uid), userData, { merge: true });
      showSuccess("✅ Usuario actualizado correctamente.");
    } else {
      // Crear nuevo usuario en Authentication
      const tempPassword = generateTempPassword();
      
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, correo, tempPassword);
      const newUID = userCredential.user.uid;
      
      // Crear documento en Firestore
      await setDoc(doc(db, "usuarios", newUID), userData);
      showSuccess("✅ Usuario creado y registrado correctamente.");
      
      // Mostrar credenciales (solo para desarrollo)
      alert(`✅ Usuario creado\n\nCorreo: ${correo}\nContraseña temporal: ${tempPassword}\n\nPor seguridad, cambie esta contraseña en el primer inicio.`);
    }
    
    await cargarUsuarios();
    
    // Limpiar formulario
    document.getElementById("uidInput").value = "";
    document.getElementById("nombreInput").value = "";
    document.getElementById("correoInput").value = "";
    document.getElementById("telefonoInput").value = "";
    document.getElementById("mensajeInput").value = "";
    
    // Restaurar texto del botón
    document.getElementById("btnGuardar").textContent = "Guardar";
  } catch (error) {
    showError(`❌ Error al guardar: ${error.message}`);
  }
};

// Generar contraseña temporal
function generateTempPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 🗑️ Eliminar usuario
window.eliminarUsuario = async (uid) => {
  if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "usuarios", uid));
    showSuccess("✅ Usuario eliminado correctamente.");
    await cargarUsuarios();
  } catch (error) {
    showError(`❌ Error al eliminar: ${error.message}`);
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
