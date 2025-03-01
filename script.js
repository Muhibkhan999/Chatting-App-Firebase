



import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
    getAuth, 
    setPersistence, 
    browserSessionPersistence, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// 🔥 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbcT2Dbv_gGvejEraqEmTRpjWfP_INZo0",
    authDomain: "first-project-ed208.firebaseapp.com",
    projectId: "first-project-ed208",
    storageBucket: "first-project-ed208.firebasestorage.app",
    messagingSenderId: "724413631751",
    appId: "1:724413631751:web:4bac7ed9cd9c80212a89a2",
    measurementId: "G-6HJ83XTGP7"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 📌 Save user data to Firestore
const addUserData = async (user, phone, age, name) => {
    await setDoc(doc(db, "students", user.uid), {
        email: user.email,
        phoneNumber: phone,
        age: age,
        displayName: name,
        uid: user.uid
    });
};

// 📌 Sign-Up Function
const signUpUser = async () => {
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const age = document.querySelector("#age").value.trim();

    if (!email || !password || !name || !phone || !age) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addUserData(user, phone, age, name);

        alert("Account created successfully! Please login.");
        window.location.href = "../index.html";
    } catch (error) {
        alert(error.message);
    }
};

// 📌 Login Function
const loginUser = async () => {
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem("userUID", userCredential.user.uid);
        window.location.replace("/pages/dashboard.html");
    } catch (error) {
        alert(error.message);
    }
};

// 📌 Google Login
const googleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        localStorage.setItem("userUID", result.user.uid);
        window.location.replace ("/pages/dashboard.html");
    } catch (error) {
        alert(error.message);
    }
};


const forgotPassword = async () => {
    const email = prompt("Enter your email to reset your password:");
    if (!email) return;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
    } catch (error) {
        alert(error.message);
    }
};
// 📌 Check if user is logged in (using localStorage)
document.addEventListener("DOMContentLoaded", () => {
    const storedUID = localStorage.getItem("userUID");

    if (window.location.pathname.includes("dashboard.html") && !storedUID) {
        window.location.replace ("index.html");
    }

    const signUpBtn = document.querySelector("#signUp-btn");
    const loginBtn = document.querySelector("#login-btn");
    const googleLoginBtn = document.querySelector("#google-login-btn");
    const logoutBtn = document.querySelector("#logout-btn");
    const forgotPasswordBtn = document.querySelector("#forgot-password-btn");
    
    if (signUpBtn) signUpBtn.addEventListener("click", signUpUser);
    if (loginBtn) loginBtn.addEventListener("click", loginUser);
    if (googleLoginBtn) googleLoginBtn.addEventListener("click", googleLogin);
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener("click", forgotPassword);
});








function logout() {
    signOut(auth).then(() => {
        // ✅ Clear everything from local storage
        localStorage.clear(); 

        // ✅ Do NOT delete chat history from Firestore
        
        // ✅ Redirect to login page
        window.location.href = "../index.html";
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

// Attach logout function to the button
document.getElementById("logoutBtn").addEventListener("click", logout);