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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 📌 Save user data to Firestore
const addUserData = async (user, phone, age, name) => {
    try {
        await setDoc(doc(db, "students", user.uid), {
            email: user.email,
            phoneNumber: phone,
            age: age,
            displayName: name,
            uid: user.uid
        });
        console.log("User data saved successfully!");
    } catch (error) {
        console.error("Error saving user data:", error);
        throw error; // Re-throw the error for handling in the calling function
    }
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
        alert(`Error during sign-up: ${error.message}`);
    }
};

// 📌 Login Function
const loginUser = async () => {
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value.trim();

    if (!email || !password) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem("userUID", userCredential.user.uid);
        window.location.replace("/pages/dashboard.html");
    } catch (error) {
        alert(`Error during login: ${error.message}`);
    }
};

// 📌 Google Login
const googleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        localStorage.setItem("userUID", result.user.uid);
        window.location.replace("/pages/dashboard.html");
    } catch (error) {
        alert(`Error during Google login: ${error.message}`);
    }
};

// 📌 Forgot Password
const forgotPassword = async () => {
    const email = prompt("Enter your email to reset your password:");
    if (!email) return;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
    } catch (error) {
        alert(`Error sending password reset email: ${error.message}`);
    }
};

// 📌 Logout Function
const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.clear(); // Clear everything from local storage
        window.location.href = "../index.html"; // Redirect to login page
    } catch (error) {
        console.error("Error logging out:", error);
        alert(`Error logging out: ${error.message}`);
    }
};

// 📌 Check if user is logged in (using localStorage)
document.addEventListener("DOMContentLoaded", () => {
    const storedUID = localStorage.getItem("userUID");

    // Redirect to login page if user is not logged in and trying to access dashboard
    if (window.location.pathname.includes("dashboard.html") && !storedUID) {
        window.location.replace("index.html");
    }

    // Add event listeners to buttons
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