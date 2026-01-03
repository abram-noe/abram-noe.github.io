// ---------------- Theme Switching ----------------
const buttons = document.querySelectorAll('.theme-btn');
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.body.classList.remove('light-theme', 'dark-theme', 'warm-theme');
        document.body.classList.add(btn.dataset.theme);
    });
});

// ---------------- Contact Form + reCAPTCHA ----------------
const form = document.querySelector("#contactForm");
const message = document.querySelector("#statusMessage");

// reCAPTCHA site key (used if dynamic rendering is needed)
const siteKey = "6LceET8sAAAAAOmQyz7fsShLj8FxF0DGVb5obuub";

// Optional: dynamically create reCAPTCHA if not present
let recaptchaDiv = form.querySelector('.g-recaptcha');
if (!recaptchaDiv) {
    recaptchaDiv = document.createElement("div");
    recaptchaDiv.className = "g-recaptcha";
    recaptchaDiv.setAttribute("data-sitekey", siteKey);
    form.insertBefore(recaptchaDiv, form.querySelector("button"));
}

// Render reCAPTCHA safely after window load
window.onload = function() {
    if (typeof grecaptcha !== "undefined") {
        grecaptcha.render(recaptchaDiv);
    } else {
        console.warn("reCAPTCHA not loaded. Fallback will be used.");
    }
};

// Form submit handler with fallback
form.addEventListener("submit", function(e) {
    e.preventDefault();

    // If reCAPTCHA exists, check response
    if (typeof grecaptcha !== "undefined") {
        const response = grecaptcha.getResponse();
        if (response.length === 0) {
            message.style.color = "red";
            message.innerText = "Please verify that you are not a robot.";
            return; // stop submission
        }
    } else {
        // Fallback mode (reCAPTCHA not loaded)
        console.warn("reCAPTCHA not available, using fallback.");
    }

    // Everything okay — submit form
    message.style.color = "green";
    message.innerText = "Thank you! We will contact you within 2 working days.";

    // Reset form fields
    form.reset();

    // Reset reCAPTCHA if loaded
    if (typeof grecaptcha !== "undefined") {
        grecaptcha.reset();
    }
});
