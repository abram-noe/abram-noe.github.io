document.addEventListener('DOMContentLoaded', () => {

    // ---------------- Theme Switching ----------------
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.remove('light-theme', 'dark-theme', 'warm-theme');
            document.body.classList.add(btn.dataset.theme);
        });
    });

    // ---------------- EMAILJS INITIALIZATION ----------------
    emailjs.init('VpDGORHwhTdAYFW9k');

    // ---------------- SELECT ELEMENTS ----------------
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
    let otpExpiry = null;
    let resendBtn = null;

    // ---------------- UTILITY: Update status ----------------
    function updateStatus(message, type='') {
        verifyStatus.textContent = message;
        verifyStatus.className = ''; // reset
        verifyStatus.classList.add(type ? type : '');
        verifyStatus.classList.remove('hidden');
    }

    // ---------------- SEND OTP ----------------
    function sendOTP() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            alert("Please fill all fields!");
            return;
        }

        // reCAPTCHA check
        if (typeof grecaptcha !== "undefined") {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                alert("Please complete the reCAPTCHA.");
                return;
            }
        }

        // Generate 6-digit OTP & set expiry
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = new Date().getTime() + 5 * 60 * 1000; // 5 minutes

        // Send OTP via EmailJS
        emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
            user_email: email,
            otp_code: generatedOTP
        })
        .then(() => {
            updateStatus("? OTP sent! Check your email.", 'success');
            step1.style.display = "none";
            step2.style.display = "flex";

            // Reset reCAPTCHA
            if (typeof grecaptcha !== "undefined") grecaptcha.reset();

            // Add resend button if not exist
            if (!resendBtn) {
                resendBtn = document.createElement('button');
                resendBtn.textContent = "Resend OTP";
                resendBtn.type = "button";
                step2.appendChild(resendBtn);

                resendBtn.addEventListener('click', () => {
                    updateStatus("Resending OTP...");
                    sendOTP();
                });
            }

        })
        .catch(err => {
            updateStatus("? Failed to send OTP. Try again.", 'error');
            console.error(err);
            if (typeof grecaptcha !== "undefined") grecaptcha.reset();
        });
    }

    sendBtn.addEventListener('click', sendOTP);

    // ---------------- VERIFY OTP & SEND MESSAGE ----------------
    verifyBtn.addEventListener('click', () => {
        const userOTP = otpInput.value.trim();
        const now = new Date().getTime();

        // Check expiry
        if (!otpExpiry || now > otpExpiry) {
            updateStatus("? OTP expired! Please resend OTP.", 'error');
            otpInput.value = '';
            return;
        }

        if (userOTP === generatedOTP) {
            // Send main message
            emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
                user_name: nameInput.value,
                user_email: emailInput.value,
                message: messageInput.value
            })
            .then(() => {
                // Optional: send auto-reply
                emailjs.send('service_4n8qvzs', 'template_swyn88h', {
                    user_name: nameInput.value,
                    user_email: emailInput.value,
                    message: messageInput.value
                });

                updateStatus("? Message sent successfully!", 'success');

                // Reset form
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
                otpInput.value = '';

                step2.style.display = "none";
                step1.style.display = "block";

            })
            .catch(err => {
                updateStatus("? Failed to send message.", 'error');
                console.error(err);
            });
        } else {
            updateStatus("? Wrong OTP, try again!", 'error');
        }
    });

});
