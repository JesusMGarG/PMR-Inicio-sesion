import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    alert("Error al iniciar sesión: " + error.message);
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
      alert("⛔ No tienes permisos de administrador.");
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
  tbody.innerHTML = "<tr><td colspan='5'>Cargando usuarios...</td></tr>";

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    
    if (querySnapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay usuarios registrados</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");

      // Escapar comillas simples para el onclick
      const nombreEscapado = (data.nombre || "").replace(/'/g, "\\'");
      const correoEscapado = (data.correo || "").replace(/'/g, "\\'");
      const telefonoEscapado = (data.telefono || "").replace(/'/g, "\\'");

      tr.innerHTML = `
        <td>${docSnap.id}</td>
        <td>${data.nombre || "N/A"}</td>
        <td>${data.correo || "N/A"}</td>
        <td>${data.telefono || "N/A"}</td>
        <td><button onclick="editarUsuario('${docSnap.id}', '${nombreEscapado}', '${correoEscapado}', '${telefonoEscapado}')">✏️</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    tbody.innerHTML = `<tr><td colspan='5'>Error al cargar: ${error.message}</td></tr>`;
  }
}

// ✏️ Cargar datos al formulario
window.editarUsuario = (uid, nombre, correo, telefono) => {
  document.getElementById("uidInput").value = uid;
  document.getElementById("nombreInput").value = nombre;
  document.getElementById("correoInput").value = correo;
  document.getElementById("telefonoInput").value = telefono;
};

// 💾 Guardar cambios
window.actualizarUsuario = async () => {
  const uid = document.getElementById("uidInput").value.trim();
  const nombre = document.getElementById("nombreInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const mensaje = document.getElementById("telefonoInput").value.trim();

  if (!uid || !nombre) {
    alert("⚠️ UID y nombre son obligatorios.");
    return;
  }else if(!correo && !telefono){
    alert("⚠️ Se tiene que ingresar correo o telefono");
    return;
  }

  try {
    await setDoc(doc(db, "usuarios", uid), { nombre, correo, telefono }, { merge: true });
    alert("✅ Usuario actualizado correctamente.");
    await cargarUsuarios(); // Refrescar tabla
  } catch (error) {
    alert("❌ Error al guardar: " + error.message);
  }
};
