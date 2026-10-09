// --- FIREBASE CONFIGURATION (Cliffesto '26 Hackathon) ---
const firebaseConfig = {
    apiKey: "AIzaSyBg0_eG1sKA_4GrpOvrNW8H98-Jt3F0u78",
    authDomain: "cliffesto26hackathon.firebaseapp.com",
    projectId: "cliffesto26hackathon",
    storageBucket: "cliffesto26hackathon.firebasestorage.app",
    messagingSenderId: "556203440129",
    appId: "1:556203440129:web:f341dcdfcb6eab8c1c2800",
    measurementId: "G-5EN1M11ZCN"
};

// Initialize Firebase v8
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let currentProductId = null;

// Change active thumbnail image
function changeImg(element) {
    const mainImg = document.getElementById("mainImg");
    mainImg.src = element.src;

    document.querySelectorAll("#thumbnails img").forEach(img => img.classList.remove("active"));
    element.classList.add("active");
}

// Load dynamic product details from Firestore using URL ?id= parameter
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    currentProductId = urlParams.get("id");

    if (!currentProductId) {
        document.getElementById("pd_title").textContent = "No Product Selected";
        document.getElementById("pd_text").textContent = "Please return to the home page and select a product.";
        return;
    }

    try {
        const doc = await db.collection("products").doc(currentProductId).get();

        if (!doc.exists) {
            document.getElementById("pd_title").textContent = "Product Not Found";
            document.getElementById("pd_text").textContent = "The requested product does not exist in the database.";
            return;
        }

        const product = doc.data();

        // 1. Set Title
        document.getElementById("pd_title").textContent = product.name || "Product Details";

        // 2. Set Pricing & Discount Calculation
        const price = product.price || 0;
        const discount = product.discount || 0;

        document.getElementById("price_val").innerHTML = `&#8377; ${price}`;

        if (discount > 0) {
            const originalPrice = Math.round(price / (1 - discount / 100));
            document.getElementById("orig_price_val").innerHTML = `&#8377; ${originalPrice}`;
            document.getElementById("discount_val").textContent = `${discount}% OFF`;
        } else {
            document.getElementById("orig_price_val").innerHTML = "";
            document.getElementById("discount_val").textContent = "";
        }

        // 3. Set Images & Gallery Thumbnails
        const images = (product.images && product.images.length > 0) 
            ? product.images 
            : ["https://via.placeholder.com/500"];

        // Set Main Display Image
        document.getElementById("mainImg").src = images[0];

        // Populate Thumbnails
        const thumbnailsContainer = document.getElementById("thumbnails");
        thumbnailsContainer.innerHTML = "";

        images.forEach((imgUrl, index) => {
            const thumb = document.createElement("img");
            thumb.src = imgUrl;
            thumb.alt = `Thumbnail ${index + 1}`;
            if (index === 0) thumb.classList.add("active");
            thumb.onclick = function() { changeImg(this); };
            thumbnailsContainer.appendChild(thumb);
        });

        // 4. Set Description
        document.getElementById("pd_text").textContent = product.description || 
            "High quality verified product from top Meesho suppliers. Free delivery across India with easy return policies.";

    } catch (error) {
        console.error("Error fetching product details:", error);
        document.getElementById("pd_title").textContent = "Error Loading Product";
    }
}

// Add product to LocalStorage cart
function addToCartFromPage() {
    if (!currentProductId) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === currentProductId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: currentProductId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart!");
}

// Buy Now function
function buyNow() {
    addToCartFromPage();
    window.location.href = "cart.html";
}

// --- REVIEWS GENERATOR ---
const sampleUsernames = [
  "Priya Singh", "Rahul Verma", "Ananya Gupta", "Vikram Malhotra",
  "Neha Patel", "Amit Kumar", "Sneha Rao", "Rohan Mehta", "Pooja Joshi", "Karan Kapoor"
];

const sampleReviews = [
  "Great product! The quality exceeded my expectations.",
  "Decent quality for the price, fast delivery.",
  "Amazing fabric and perfect fit. Highly recommend it to everyone!",
  "It's okay, gets the job done.",
  "Very comfortable and looks exactly like the product pictures."
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addReviews() {
  const reviewContainer = document.getElementById("rl");
  if (!reviewContainer) return;

  reviewContainer.innerHTML = "";
  const totalReviews = getRandomInt(2, 5);

  for (let i = 0; i < totalReviews; i++) {
    const username = getRandomItem(sampleUsernames);
    const reviewText = getRandomItem(sampleReviews);
    const rating = getRandomInt(4, 5);

    const reviewCard = document.createElement("div");
    reviewCard.className = "review-item";
    reviewCard.style.cssText = "border-bottom: 1px solid #eee; padding: 12px 0; margin-bottom: 8px;";

    reviewCard.innerHTML = `
        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #333;">${username}</h4>
        <div style="color: #f39c12; margin-bottom: 4px; font-size: 13px;">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
        <p style="margin: 0; color: #555; font-size: 13px;">${reviewText}</p>
    `;

    reviewContainer.appendChild(reviewCard);
  }
}

// Initialize page on DOM Load
window.addEventListener("DOMContentLoaded", () => {
    loadProductDetails();
    addReviews();
});
