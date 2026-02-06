const firebaseConfig = {
  apiKey: "AIzaSyBNuza4ltSYYZf5eml5jdrjh_FuI8Rappk",
  authDomain: "smart-bus-pass-system-b3950.firebaseapp.com",
  projectId: "smart-bus-pass-system-b3950",
  storageBucket: "smart-bus-pass-system-b3950.firebasestorage.app",
  messagingSenderId: "422432816761",
  appId: "1:422432816761:web:eb86fe0ee38153833ddea8",
  measurementId: "G-H2M8MTJE4Q"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let selectedPlan = null;
let selectedPrice = null;

// Plan Selection UI Logic
document.querySelectorAll(".plan-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".plan-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedPlan = card.getAttribute("data-plan");
    selectedPrice = parseInt(card.getAttribute("data-price"), 10);
    
    document.getElementById("planSummary").innerText = `${selectedPlan} — ₹${selectedPrice}`;
    document.getElementById("purchaseBtn").disabled = false;
  });
});

document.getElementById("purchaseBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to continue");
    return;
  }

  const options = {
    key: "rzp_test_RcJkKW0f4CKH0V", 
    amount: selectedPrice * 100, 
    currency: "INR",
    name: "SmartBus Transit",
    description: `Purchase of ${selectedPlan}`,
    theme: { color: "#1f2a56" },
    handler: async function (response) {
      try {
        const batch = db.batch();
        const userRef = db.collection("users").doc(user.uid);
        
        let start = new Date();
        let end = new Date(start);
        
        if (selectedPlan === "Daily Pass") end.setDate(start.getDate() + 1);
        else if (selectedPlan === "Weekly Pass") end.setDate(start.getDate() + 7);
        else if (selectedPlan === "Monthly Pass") end.setMonth(start.getMonth() + 1);

        const passRef = userRef.collection("passes").doc();
        const qrData = `PASS_${user.uid}_${passRef.id}`;

        // 1. Save Pass Details
        batch.set(passRef, {
          plan: selectedPlan,
          price: selectedPrice,
          startDate: firebase.firestore.Timestamp.fromDate(start),
          endDate: firebase.firestore.Timestamp.fromDate(end),
          qrData: qrData,
          paymentId: response.razorpay_payment_id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Add to Transactions Sub-collection
        const txRef = userRef.collection("transactions").doc();
        batch.set(txRef, {
            type: `${selectedPlan} Purchase`,
            amount: -selectedPrice,
            time: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. CRITICAL: Update the User Document Balance
        batch.update(userRef, {
            balance: firebase.firestore.FieldValue.increment(-selectedPrice)
        });

        await batch.commit();

        document.getElementById("result").innerHTML = `
          <div class="success-msg">
            <i class='bx bxs-check-circle' style="font-size: 2rem;"></i>
            <h3>Payment Successful!</h3>
            <p>${selectedPlan} is now active until ${end.toDateString()}.</p>
            <button class="btn btn-primary" onclick="location.href='dashboard.html'" style="margin-top:15px">Go to Dashboard</button>
          </div>
        `;
      } catch (err) {
        console.error(err);
        alert("Payment received, but failed to sync with database.");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});