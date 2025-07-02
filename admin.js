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
  tbody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "usuarios"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${data.nombre || ""}</td>
      <td>${data.correo || ""}</td>
      <td>${data.mensaje || ""}</td>
      <td><button onclick="editarUsuario('${docSnap.id}', '${data.nombre || ""}', '${data.correo || ""}', '${data.mensaje || ""}')">✏️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ✏️ Cargar datos al formulario
window.editarUsuario = (uid, nombre, correo, mensaje) => {
  document.getElementById("uidInput").value = uid;
  document.getElementById("nombreInput").value = nombre;
  document.getElementById("correoInput").value = correo;
  document.getElementById("mensajeInput").value = mensaje;
};

// 💾 Guardar cambios
window.actualizarUsuario = async () => {
  const uid = document.getElementById("uidInput").value.trim();
  const nombre = document.getElementById("nombreInput").value.trim();
  const correo = document.getElementById("correoInput").value.trim();
  const mensaje = document.getElementById("mensajeInput").value.trim();

  if (!uid || !nombre || !correo) {
    alert("⚠️ UID, nombre y correo son obligatorios.");
    return;
  }

  try {
    await setDoc(doc(db, "usuarios", uid), { nombre, correo, mensaje }, { merge: true });
    alert("✅ Usuario actualizado correctamente.");
    await cargarUsuarios(); // Refrescar tabla
  } catch (error) {
    alert("❌ Error al guardar: " + error.message);
  }
};
