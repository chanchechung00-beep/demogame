

  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAZ3ULkzh6Ouq4Qkpa8y5J0ve_ej9GDBZI",
    authDomain: "web-hoc-ta.firebaseapp.com",
    projectId: "web-hoc-ta",
    storageBucket: "web-hoc-ta.firebasestorage.app",
    messagingSenderId: "664009988350",
    appId: "1:664009988350:web:d15ad66b0d3704981e6daf"
    };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);