
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
  // expose for other scripts
  window.auth = firebase.auth();
  window.db = firebase.firestore();

