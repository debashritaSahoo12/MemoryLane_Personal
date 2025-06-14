  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyA5Y6PLWU4bKmcZex_RMJ3_lnYwaYULPrA",
    authDomain: "memorylane-personal-9750d.firebaseapp.com",
    projectId: "memorylane-personal-9750d",
    storageBucket: "memorylane-personal-9750d.firebasestorage.app",
    messagingSenderId: "866389584889",
    appId: "1:866389584889:web:0c2a24fd2441720a54ab28",
    measurementId: "G-8CLJXXE7TS"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth=getAuth(app)
  export const db = getFirestore(app);