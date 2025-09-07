document.addEventListener("DOMContentLoaded", () => {
    // Form fields
    const username = document.getElementById("username");
    const nickname = document.getElementById("nickname");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    // Error fields
    const usernameError = document.getElementById("usernameError");
    const nicknameError = document.getElementById("nicknameError");
    const phoneError = document.getElementById("phoneError");
    const emailError = document.createElement("small");
    emailError.id = "emailError";
    emailError.style.color = "red";
    email.parentNode.appendChild(emailError);
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    // Regex patterns
    const usernamePattern = /^[a-zA-Z0-9_]{3,15}$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    function setValidationStyle(input, isValid) {
        input.style.borderColor = isValid ? "green" : "red";
    }

    username.addEventListener("input", () => {
        const valid = usernamePattern.test(username.value);
        usernameError.textContent = valid ? "" : "3-15 chars; letters, numbers, underscores";
        setValidationStyle(username, valid);
    });

    nickname.addEventListener("input", () => {
        const valid = nickname.value.length >= 3;
        nicknameError.textContent = valid ? "" : "Nickname must be at least 3 characters";
        setValidationStyle(nickname, valid);
    });

    phone.addEventListener("input", () => {
        const valid = phonePattern.test(phone.value);
        phoneError.textContent = valid ? "" : "Enter a valid 10-digit phone number";
        setValidationStyle(phone, valid);
    });

    email.addEventListener("input", () => {
        const valid = emailPattern.test(email.value);
        emailError.textContent = valid ? "" : "Enter a valid email address";
        setValidationStyle(email, valid);
    });

    password.addEventListener("input", () => {
        const valid = passwordPattern.test(password.value);
        passwordError.textContent = valid ? "" : "Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char";
        setValidationStyle(password, valid);
        // Also re-check confirmPassword on password change
        const confirmValid = confirmPassword.value === password.value && password.value !== "";
        confirmPasswordError.textContent = confirmValid ? "" : "Passwords do not match";
        setValidationStyle(confirmPassword, confirmValid);
    });

    confirmPassword.addEventListener("input", () => {
        const valid = confirmPassword.value === password.value && password.value !== "";
        confirmPasswordError.textContent = valid ? "" : "Passwords do not match";
        setValidationStyle(confirmPassword, valid);
    });

    document.getElementById("signup-form").addEventListener("submit", (e) => {
        if (
            usernameError.textContent ||
            nicknameError.textContent ||
            phoneError.textContent ||
            emailError.textContent ||
            passwordError.textContent ||
            confirmPasswordError.textContent ||
            !username.value || !nickname.value || !phone.value || !email.value || !password.value || !confirmPassword.value
        ) {
            e.preventDefault();
            alert("Please fix errors before submitting!");
        }
    });
});
