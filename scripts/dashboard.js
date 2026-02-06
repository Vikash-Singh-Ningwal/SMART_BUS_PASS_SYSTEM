const firebaseConfig = {
  apiKey: "AIzaSyBNuza4ltSYYZf5eml5jdrjh_FuI8Rappk",
  authDomain: "smart-bus-pass-system-b3950.firebaseapp.com",
  projectId: "smart-bus-pass-system-b3950",
  storageBucket: "smart-bus-pass-system-b3950.firebasestorage.app",
  messagingSenderId: "422432816761",
  appId: "1:422432816761:web:eb86fe0ee38153833ddea8",
  measurementId: "G-H2M8MTJE4Q"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global Elements
const balanceEl = document.getElementById("balance");
const walletIdEl = document.getElementById("walletId");
const txListEl = document.getElementById("txList");
const hiUser = document.getElementById("hiUser");
const userInfo = document.getElementById("userInfo");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const docRef = db.collection("users").doc(user.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      alert("Profile not found!");
      return;
    }

    const data = docSnap.data();

    // 1. Update Profile & Wallet
    hiUser.textContent = data.username || "User";
    balanceEl.textContent = `₹${Math.abs(data.balance ).toFixed(2)}`;
    walletIdEl.textContent = `ID: ${data.walletID || '---'}`;

    userInfo.innerHTML = `
      <div class="info-row"><span>User ID</span> <b>${data.userID || 'N/A'}</b></div>
      <div class="info-row"><span>Email</span> <b>${data.email || user.email}</b></div>
      <div class="info-row"><span>Phone</span> <b>${data.phone || 'N/A'}</b></div>
      <div class="info-row"><span>Blood Group</span> <b>${data.bloodGroup || 'N/A'}</b></div>
    `;

    // 2. Load Recent Transactions
    const txSnap = await docRef.collection("transactions").orderBy("time", "desc").limit(5).get();
    txListEl.innerHTML = txSnap.empty ? '<p>No recent activity</p>' : '';
    
    txSnap.forEach(doc => {
      const tx = doc.data();
      const isCredit = tx.amount >= 0;
      const el = document.createElement('div');
      el.className = `transaction ${isCredit ? 'status-in' : 'status-out'}`;
      el.innerHTML = `
        <div>
          <strong style="display:block">${tx.type || 'Payment'}</strong>
          <small style="opacity:0.6">${tx.time?.toDate().toLocaleDateString()}</small>
        </div>
        <strong style="color: ${isCredit ? '#22b573' : '#ff4d4d'}">
          ${isCredit ? '+' : ''}₹${Math.abs(tx.amount).toFixed(2)}
        </strong>
      `;
      txListEl.appendChild(el);
    });

    // 3. Load Active Pass
    const passesSnap = await docRef.collection("passes").orderBy("createdAt", "desc").limit(1).get();
    if (!passesSnap.empty) {
      const p = passesSnap.docs[0].data();
      const endDate = p.endDate?.toDate();
      
      if (endDate && endDate > new Date()) {
        document.getElementById("currentPlanName").textContent = p.plan || "Bus Pass";
        document.getElementById("expiryText").textContent = endDate.toDateString();
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(p.qrData || '')}`;
        document.getElementById("qrContainer").innerHTML = `<img src="${qrUrl}" alt="QR">`;
      }
    }

  } catch (err) {
    console.error("Error:", err);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());