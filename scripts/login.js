// Firebase configuration
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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');

  // Simple validation to enable button
  const checkInputs = () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    const isPassValid = passInput.value.length >= 6;
    submitBtn.disabled = !(isEmailValid && isPassValid);
  };

  emailInput.addEventListener('input', checkInputs);
  passInput.addEventListener('input', checkInputs);

  // Toggle Password
  document.getElementById('toggle-password').addEventListener('click', function() {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    this.textContent = isPass ? 'Hide' : 'Show';
  });

  // Handle Login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      await auth.signInWithEmailAndPassword(emailInput.value, passInput.value);
      
      // Success: Redirect to dashboard
      window.location.href = './dashboard.html'; 
    } catch (error) {
      // Error handling
      let message = "An error occurred during login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      }
      
      alert(message);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});