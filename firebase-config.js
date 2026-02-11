// Importando as ferramentas oficiais do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Suas credenciais oficiais que estavam no fim do arquivo original
const firebaseConfig = {
    apiKey: "AIzaSyBeo2od4MzecpXkYVKxqvsYTDUr9y1IZX4",
    authDomain: "imperiodesaber-ea59d.firebaseapp.com",
    projectId: "imperiodesaber-ea59d",
    storageBucket: "imperiodesaber-ea59d.firebasestorage.app",
    messagingSenderId: "924409738516",
    appId: "1:924409738516:web:aec0d1caab929e0f87fe01",
    measurementId: "G-RGRHM552H9"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Torna o banco de dados acessível para o outro arquivo (script.js)
window.db = db;

console.log("Conexão com Banco de Dados Nuvem (Firebase) estabelecida!");
