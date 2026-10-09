// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBg0_eG1sKA_4GrpOvrNW8H98-Jt3F0u78",
    authDomain: "cliffesto26hackathon.firebaseapp.com",
    projectId: "cliffesto26hackathon",
    storageBucket: "cliffesto26hackathon.firebasestorage.app",
    messagingSenderId: "556203440129",
    appId: "1:556203440129:web:f341dcdfcb6eab8c1c2800",
    measurementId: "G-5EN1M11ZCN"
};

// Initialize Firebase & Firestore
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let currentUser = null;

// --- SCREEN / PAGE NAVIGATION ---
function showScreen(screenId) {
    const screens = document.querySelectorAll(".screen");
    if (screens.length > 0) {
        screens.forEach(screen => screen.classList.remove("active"));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) targetScreen.classList.add("active");
    } else {
        window.location.href = "index.html";
    }
}

// --- USER REGISTRATION ---
async function handleRegister(event) {
    event.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("pass").value;

    if (!phone || !password) {
        alert("Please provide both phone number and password.");
        return;
    }

    try {
        const userRef = db.collection("users").doc(phone);
        const doc = await userRef.get();

        if (doc.exists) {
            alert("An account with this phone number already exists! Please log in.");
            window.location.href = "login.html";
            return;
        }

        // Save document into Firestore 'users' collection
        await userRef.set({
            phone: phone,
            password: password,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Account created successfully! Redirecting to login...");
        window.location.href = "login.html";

    } catch (error) {
        console.error("Error creating account:", error);
        alert("Registration failed: " + error.message);
    }
}

// --- USER LOGIN ---
async function handleLogin(event) {
    event.preventDefault();

    const phoneInput = document.getElementById("phone");
    const passInput = document.getElementById("pass");

    if (!phoneInput || !passInput) {
        console.error("Form input elements not found.");
        return;
    }

    const phone = phoneInput.value.trim();
    const password = passInput.value;

    if (!phone || !password) {
        alert("Please enter both phone number and password.");
        return;
    }

    try {
        const userRef = db.collection("users").doc(phone);
        const doc = await userRef.get();

        if (doc.exists) {
            const userData = doc.data();

            if (userData.password === password) {
                alert(`Login successful! Welcome to Meesho, ${userData.phone}`);

                
                currentUser = userData;
                localStorage.setItem("meeshoUser", JSON.stringify(userData));


                window.location.hred="meesho.html";
            } else {
                alert("Incorrect Password. Please try again.");
            }
        } else {
            alert("No account found with this phone number. Please sign up first.");
            window.location.href = "signup.html";
        }

    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed: " + error.message);
    }
}