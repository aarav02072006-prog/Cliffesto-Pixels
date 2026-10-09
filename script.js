// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBg0_eG1sKA_4GrpOvrNW8H98-Jt3F0u78",
    authDomain: "cliffesto26hackathon.firebaseapp.com",
    projectId: "cliffesto26hackathon",
    storageBucket: "cliffesto26hackathon.firebasestorage.app",
    messagingSenderId: "556203440129",
    appId: "1:556203440129:web:f341dcdfcb6eab8c1c2800",
    measurementId: "G-5EN1M11ZCN"
};

// Initialize Firebase & Firestore (v8 Compat)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Global App State
let currentUser = null;
let allProducts = [];

// ==========================================
// 2. NAVIGATION & SCREEN HELPERS
// ==========================================
function showScreen(screenId) {
    const screens = document.querySelectorAll(".screen");
    if (screens.length > 0) {
        screens.forEach(screen => screen.classList.remove("active"));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add("active");
            return;
        }
    }
    window.location.href = "meesho.html";
}

// ==========================================
// 3. USER AUTHENTICATION (REGISTER & LOGIN)
// ==========================================
async function handleRegister(event) {
    event.preventDefault();

    const phoneInput = document.getElementById("phone");
    const passInput = document.getElementById("pass");

    if (!phoneInput || !passInput) return;

    const phone = phoneInput.value.trim();
    const password = passInput.value;

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

async function handleLogin(event) {
    event.preventDefault();

    const phoneInput = document.getElementById("phone");
    const passInput = document.getElementById("pass");

    if (!phoneInput || !passInput) return;

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
                alert(`Login successful! Welcome back, ${userData.phone}`);
                currentUser = userData;
                localStorage.setItem("meeshoUser", JSON.stringify(userData));
                window.location.href = "meesho.html";
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

// ==========================================
// 4. PRODUCT MANAGEMENT (ADD PRODUCT)
// ==========================================
async function handleAddProduct(event) {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const discountInput = document.getElementById("discount");

    const imgInputs = [
        document.getElementById("img1"),
        document.getElementById("img2"),
        document.getElementById("img3"),
        document.getElementById("img4")
    ];

    if (!nameInput || !priceInput || !discountInput || imgInputs.some(input => !input)) return;

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const discount = parseFloat(discountInput.value);
    const imageUrls = imgInputs.map(input => input.value.trim());

    if (!name || isNaN(price) || isNaN(discount) || imageUrls.some(url => !url)) {
        alert("Please fill in all fields with valid details.");
        return;
    }

    const submitBtn = document.getElementById("submitproduct");
    if (submitBtn) submitBtn.disabled = true;

    try {
        await db.collection("products").add({
            name: name,
            price: price,
            discount: discount,
            images: imageUrls,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Product added successfully!");
        document.getElementById("addItem").reset();

    } catch (error) {
        console.error("Error adding product:", error);
        alert("Failed to add product: " + error.message);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ==========================================
// 5. REALTIME PRODUCT DISPLAY & RENDERING
// ==========================================
function listenToProducts() {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    db.collection("products").onSnapshot((snapshot) => {
        allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        applyFilterAndSort();
    }, (error) => {
        console.error("Error loading products:", error);
        productGrid.innerHTML = `<p style="color:red; text-align:center; grid-column: 1/-1;">Failed to load products: ${error.message}</p>`;
    });
}

function renderProducts(products) {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>No products found matching your search.</h3>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const imageUrl = (product.images && product.images.length > 0) 
            ? product.images[0] 
            : "https://via.placeholder.com/200";

        const discountPercent = Number(product.discount) || 0;
        const originalPrice = Number(product.price) || 0;
        const finalPrice = discountPercent > 0
            ? Math.round(originalPrice - (originalPrice * (discountPercent / 100)))
            : originalPrice;

        const card = document.createElement("div");
        card.className = "item";
        card.style.cursor = "pointer";

        card.onclick = (e) => {
            if (e.target.classList.contains('addtocart') || e.target.closest('.addtocart')) {
                return;
            }
            window.location.href = `product_page.html?id=${product.id}`;
        };

        card.innerHTML = `
            <div>
                <img class="product-img" src="${imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <h5 class="product-title">${product.name}</h5>
                </div>
                <div class="price-details">
                    <span class="price">₹${finalPrice}</span>
                    ${discountPercent > 0 ? `<span class="discount">${discountPercent}% OFF</span>` : ""}
                </div>
            </div>
            <div class="product-bottom">
                <span style="font-size: 0.75rem; color: #258f51; background: #eaf6ed; padding: 2px 6px; border-radius: 4px; font-weight: bold;">Free Delivery</span>
                <button class="addtocart" onclick="addToCart(event, '${product.id}')" title="Add to Cart" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">🛒</button>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// ==========================================
// 6. FLEXIBLE SEARCH & DROPDOWN SORTING LOGIC
// ==========================================
function applyFilterAndSort() {
    const searchInput = document.getElementById("searchInput") || document.querySelector('#search input[type="text"]');
    const sortSelect = document.getElementById("sortSelect") || document.querySelector("select");

    let result = [...allProducts];

    // 1. Search Query Filter
    if (searchInput) {
        const query = searchInput.value.trim().toLowerCase();
        if (query !== "") {
            result = result.filter(product => {
                const productName = product.name ? String(product.name).toLowerCase() : "";
                return productName.includes(query);
            });
        }
    }

    // 2. Dropdown Sort Filter
    if (sortSelect) {
        const sortValue = sortSelect.value.toLowerCase().trim();

        if (sortValue.includes("price")) {
            // Low to High Final Price
            result.sort((a, b) => {
                const pA = Number(a.price) || 0;
                const dA = Number(a.discount) || 0;
                const finalA = dA > 0 ? Math.round(pA - (pA * (dA / 100))) : pA;

                const pB = Number(b.price) || 0;
                const dB = Number(b.discount) || 0;
                const finalB = dB > 0 ? Math.round(pB - (pB * (dB / 100))) : pB;

                return finalA - finalB;
            });
        } else if (sortValue.includes("discount")) {
            // High to Low Discount
            result.sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
        }
    }

    renderProducts(result);
}

// ==========================================
// 7. CART MANAGEMENT
// ==========================================
function addToCart(event, productId) {
    if (event) event.stopPropagation();

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart!");
}

// ==========================================
// 8. EVENT LISTENERS SETUP ON LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    listenToProducts();

    const searchForm = document.getElementById("search");
    const searchInput = document.getElementById("searchInput") || document.querySelector('#search input[type="text"]');
    const sortSelect = document.getElementById("sortSelect") || document.querySelector("select");

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyFilterAndSort();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilterAndSort);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", applyFilterAndSort);
    }
});
