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
const statusMessage = document.querySelector("#statusMessage");

const siteKey = "6LceET8sAAAAAOmQyz7fsShLj8FxF0DGVb5obuub";

// Create reCAPTCHA ONLY if missing
let recaptchaDiv = form.querySelector('.g-recaptcha');
let recaptchaDynamic = false;

if (!recaptchaDiv) {
    recaptchaDiv = document.createElement("div");
    recaptchaDiv.className = "g-recaptcha";
    recaptchaDiv.setAttribute("data-sitekey", siteKey);
    form.insertBefore(recaptchaDiv, form.querySelector("button"));
    recaptchaDynamic = true;
}

// Render only if dynamically created
window.onload = function () {
    if (recaptchaDynamic && typeof grecaptcha !== "undefined") {
        grecaptcha.render(recaptchaDiv);
    }
};

function showMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `${type} show`;
    statusMessage.classList.remove('hidden');

    setTimeout(() => {
        statusMessage.classList.add('hidden');
        statusMessage.classList.remove('show');
    }, 5000);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (typeof grecaptcha === "undefined") {
        showMessage("?? reCAPTCHA unavailable. Please refresh the page.", "warning");
        return;
    }

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        showMessage("?? Please verify that you are not a robot.", "warning");
        return;
    }

    const formData = new FormData(form);
    formData.append('g-recaptcha-response', recaptchaResponse);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
        });

        if (response.ok) {
            showMessage("? Message sent successfully!", "success");
            form.reset();
            grecaptcha.reset();
        } else {
            showMessage("? Submission failed. Please email me directly.", "error");
        }
    } catch {
        showMessage("? Network error. Please try again later.", "error");
    }
});
