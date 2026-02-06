// Firebase configuration (Source:)
const firebaseConfig = {
  apiKey: "AIzaSyBNuza4ltSYYZf5eml5jdrjh_FuI8Rappk",
  authDomain: "smart-bus-pass-system-b3950.firebaseapp.com",
  projectId: "smart-bus-pass-system-b3950",
  storageBucket: "smart-bus-pass-system-b3950.firebasestorage.app",
  messagingSenderId: "422432816761",
  appId: "1:422432816761:web:eb86fe0ee38153833ddea8",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Helpers
const generateID = (l, n) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let res = '';
  for(let i=0; i<l; i++) res += chars[Math.floor(Math.random()*chars.length)];
  for(let i=0; i<n; i++) res += nums[Math.floor(Math.random()*nums.length)];
  return res;
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const submitBtn = document.getElementById('submit-btn');
  const inputs = form.querySelectorAll('input, select');

  // Unified Validation
  const validateField = (id, regex, msg) => {
    const field = document.getElementById(id);
    const error = document.getElementById(`${id}-error`);
    const isValid = regex.test(field.value.trim());
    
    if (!isValid && field.value !== "") {
      error.textContent = msg;
      error.style.display = 'block';
      field.style.borderColor = '#ff4d4d';
    } else {
      error.style.display = 'none';
      field.style.borderColor = field.value !== "" ? '#22c55e' : 'transparent';
    }
    return isValid;
  };

  const checkForm = () => {
    const isUser = validateField('username', /^[a-zA-Z ]{3,30}$/, "Enter a valid name (3+ chars)");
    const isEmail = validateField('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address");
    const isPass = validateField('password', /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "8+ chars, with Uppercase & Number");
    const isMatch = document.getElementById('password').value === document.getElementById('confirm-password').value;
    
    submitBtn.disabled = !(isUser && isEmail && isPass && isMatch);
  };

  inputs.forEach(input => input.addEventListener('input', checkForm));

  // Password Toggles
  ['toggle-password', 'toggle-confirm-password'].forEach(id => {
    document.getElementById(id).addEventListener('click', function() {
      const target = this.previousElementSibling;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      this.textContent = isPass ? 'Hide' : 'Show';
    });
  });

  // Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uID = generateID(5, 5);
      const wID = generateID(3, 6);

      await db.collection('users').doc(cred.user.uid).set({
        userID: uID,
        walletID: wID,
        username: document.getElementById('username').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        balance: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert(`Success! ID: ${uID} | Wallet: ${wID}`);
      window.location.href = './login.html';
    } catch (err) {
      alert(err.message);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});