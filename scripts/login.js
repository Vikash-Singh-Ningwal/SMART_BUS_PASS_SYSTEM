// Firebase config
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

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const loginBtn = loginForm.querySelector('.login-btn');
  const togglePassword = document.getElementById('toggle-password');

  // Validation functions
  const validateEmail = () => {
    const value = email.value.trim();
    const error = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      error.textContent = 'Enter a valid email address';
      error.style.display = 'block';
      return false;
    }
    error.style.display = 'none';
    return true;
  };

  const validatePassword = () => {
    const value = password.value;
    const error = document.getElementById('password-error');
    if (value.length < 6) {
      error.textContent = 'Password must be at least 6 characters long';
      error.style.display = 'block';
      return false;
    }
    error.style.display = 'none';
    return true;
  };

  // Enable/disable login button
  const validateForm = () => {
    const isValid = validateEmail() && validatePassword();
    loginBtn.disabled = !isValid;
  };

  // Real-time validation
  email.addEventListener('input', validateForm);
  password.addEventListener('input', validateForm);

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const type = password.type === 'password' ? 'text' : 'password';
    password.type = type;
    togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  // Form submission with Firebase authentication
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginBtn.disabled) return;

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    try {
      await auth.signInWithEmailAndPassword(emailValue, passwordValue);
      alert('Login Successful!');
      window.location.href = './dashboard.html';
    } catch (error) {
      console.error('Error logging in: ', error);
      alert(`Login failed: ${error.message}`);
    }
  });
});