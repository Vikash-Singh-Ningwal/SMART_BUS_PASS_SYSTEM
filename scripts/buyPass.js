// busPass.js

// Firebase config (moved to firebase.js for consistency)
const db = firebase.firestore();
const auth = firebase.auth();

let selectedPlan = null;
let selectedPrice = null;

// Select plan handler
document.querySelectorAll(".plan-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".plan-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedPlan = card.getAttribute("data-plan");
    selectedPrice = parseInt(card.getAttribute("data-price"), 10);
    document.getElementById("plan").innerText = selectedPlan;
    document.getElementById("price").innerText = "₹" + selectedPrice;
  });
});

// Purchase button
document.getElementById("purchaseBtn").addEventListener("click", async () => {
  if (!selectedPlan) {
    alert("Please select a plan before purchasing.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please login first!");
    window.location.href = "./login.html";
    return;
  }

  // Show loading state
  document.getElementById("purchaseBtn").disabled = true;
  document.getElementById("result").innerHTML = `<p>Loading...</p>`;

  try {
    // Razorpay checkout
    var options = {
      key: "rzp_test_RB5XRC7Y9RI6oU", // Replace with live key in production
      amount: selectedPrice * 100,
      currency: "INR",
      name: "Smart Bus Pass",
      description: selectedPlan,
      handler: async function (response) {
        // Validity
        let start = new Date();
        let end = new Date(start);
        if (selectedPlan === "Daily Pass") end.setDate(start.getDate() + 1);
        if (selectedPlan === "Weekly Pass") end.setDate(start.getDate() + 7);
        if (selectedPlan === "Monthly Pass") end.setMonth(start.getMonth() + 1);

        // Save to Firestore
        const passRef = db.collection("users").doc(user.uid).collection("passes").doc();
        const passId = passRef.id;
        const qrData = `${user.uid}_${passId}`;

        await passRef.set({
          plan: selectedPlan,
          price: selectedPrice,
          startDate: firebase.firestore.Timestamp.fromDate(start),
          endDate: firebase.firestore.Timestamp.fromDate(end),
          paymentId: response.razorpay_payment_id,
          qrData: qrData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Deduct from balance (optional)
        await db.collection("users").doc(user.uid).update({
          balance: firebase.firestore.FieldValue.increment(-selectedPrice),
        });

        // Log transaction (optional)
        await db.collection("users").doc(user.uid).collection("transactions").add({
          type: `Purchased ${selectedPlan}`,
          amount: -selectedPrice,
          time: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Show success
        document.getElementById("result").innerHTML = `
          <p class="success">✅ Pass Purchased Successfully!</p>
          <p><b>${selectedPlan}</b> valid till <b>${end.toDateString()}</b></p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" />
        `;
      },
      prefill: {
        email: user.email || '',
        contact: "" // Optionally fetch from user data if available
      },
      theme: { color: "#1a73e8" },
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
  } catch (err) {
    console.error("Error processing purchase:", err);
    document.getElementById("result").innerHTML = `<p class="error">Error: ${err.message}</p>`;
  } finally {
    document.getElementById("purchaseBtn").disabled = false;
  }
});