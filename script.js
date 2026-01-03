// ---------------- Theme Switching ----------------
const buttons = document.querySelectorAll('.theme-btn');
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.body.classList.remove('light-theme', 'dark-theme', 'warm-theme');
        document.body.classList.add(btn.dataset.theme);
    });
});

// ------------------------ EMAILJS INITIALIZATION ------------------------
emailjs.init('VpDGORHwhTdAYFW9k'); // Replace with your EmailJS public key

// ------------------------ SELECT ELEMENTS ------------------------
const sendBtn = document.getElementById('sendOTP');
const verifyBtn = document.getElementById('verifyOTP');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const otpInput = document.getElementById('otpInput');

const verifyStatus = document.getElementById('verifyStatus');

let generatedOTP = '';
let otpExpiry = null; // <--- OTP expiration timestamp
let resendBtn = null;

// ------------------------ FUNCTION: SEND OTP ------------------------
function sendOTP() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
        alert("Please fill all fields!");
        return;
    }

    // Check reCAPTCHA
    if (typeof grecaptcha !== "undefined") {
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert("Please complete the reCAPTCHA.");
            return;
        }
    } else {
        console.warn("reCAPTCHA not loaded.");
    }

    // Generate a 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration: 5 minutes
    otpExpiry = new Date().getTime() + 5 * 60 * 1000;

    // Send OTP via EmailJS
    emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
        user_email: email,
        otp_code: generatedOTP
    })
    .then(() => {
        verifyStatus.textContent = "? OTP sent! Check your email.";
        step1.style.display = "none";
        step2.style.display = "block";

        // Reset reCAPTCHA after successful send
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.reset();
        }

        // Add Resend OTP button if not exist
        if (!resendBtn) {
            resendBtn = document.createElement('button');
            resendBtn.textContent = "Resend OTP";
            resendBtn.type = "button";
            resendBtn.style.marginLeft = "10px";
            step2.appendChild(resendBtn);

            resendBtn.addEventListener('click', () => {
                verifyStatus.textContent = "Resending OTP...";
                sendOTP(); // Call same function to resend
            });
        }
    })
    .catch((error) => {
        verifyStatus.textContent = "? Failed to send OTP. Try again.";
        console.error(error);

        // Refresh reCAPTCHA on failure
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.reset();
            console.log("reCAPTCHA refreshed.");
        }
    });
}

// ------------------------ BUTTON CLICK: SEND OTP ------------------------
sendBtn.addEventListener('click', sendOTP);

// ------------------------ VERIFY OTP & SEND MESSAGE ------------------------
verifyBtn.addEventListener('click', () => {
    const userOTP = otpInput.value.trim();
    const now = new Date().getTime();

    // Check if OTP has expired
    if (!otpExpiry || now > otpExpiry) {
        verifyStatus.textContent = "? OTP has expired! Please resend OTP.";
        otpInput.value = '';
        return;
    }

    if (userOTP === generatedOTP) {
        // Send the message to your email
        emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
            user_name: nameInput.value,
            user_email: emailInput.value,
            message: messageInput.value
        })
        .then(() => {
            // Optional: Send auto-reply to visitor
            emailjs.send('service_4n8qvzs', 'template_swyn88h', {
                user_name: nameInput.value,
                user_email: emailInput.value,
                message: messageInput.value
            });

            verifyStatus.textContent = "? Message sent successfully!";

            // Reset form
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
            otpInput.value = '';

            step2.style.display = "none";
            step1.style.display = "block";
        })
        .catch((error) => {
            verifyStatus.textContent = "? Failed to send message.";
            console.error(error);
        });
    } else {
        verifyStatus.textContent = "? Wrong OTP, try again!";
    }
});
