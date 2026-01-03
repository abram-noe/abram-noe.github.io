document.addEventListener('DOMContentLoaded', () => {

    // ---------------- Theme Switching ----------------
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.remove('light-theme', 'dark-theme', 'warm-theme');
            document.body.classList.add(btn.dataset.theme);
        });
    });

    // ------------------------ EMAILJS INITIALIZATION ------------------------
    emailjs.init('VpDGORHwhTdAYFW9k');

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
    let otpExpiry = null;
    let resendBtn = null;

    // ------------------------ SEND OTP ------------------------
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

        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = new Date().getTime() + 5 * 60 * 1000; // 5 min

        emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
            user_email: email,
            otp_code: generatedOTP
        })
        .then(() => {
            verifyStatus.textContent = "✅ OTP sent! Check your email.";
            step1.style.display = "none";
            step2.style.display = "block";

            if (!resendBtn) {
                resendBtn = document.createElement('button');
                resendBtn.textContent = "Resend OTP";
                resendBtn.type = "button";
                resendBtn.style.marginLeft = "10px";
                step2.appendChild(resendBtn);

                resendBtn.addEventListener('click', () => {
                    verifyStatus.textContent = "Resending OTP...";
                    sendOTP();
                });
            }

            if (typeof grecaptcha !== "undefined") grecaptcha.reset();
        })
        .catch(err => {
            verifyStatus.textContent = "❌ Failed to send OTP.";
            console.error(err);
            if (typeof grecaptcha !== "undefined") grecaptcha.reset();
        });
    }

    sendBtn.addEventListener('click', sendOTP);

    // ------------------------ VERIFY OTP ------------------------
    verifyBtn.addEventListener('click', () => {
        const userOTP = otpInput.value.trim();
        const now = new Date().getTime();

        if (!otpExpiry || now > otpExpiry) {
            verifyStatus.textContent = "❌ OTP expired! Resend OTP.";
            otpInput.value = '';
            return;
        }

        if (userOTP === generatedOTP) {
            emailjs.send('service_4n8qvzs', 'template_5ntyqmi', {
                user_name: nameInput.value,
                user_email: emailInput.value,
                message: messageInput.value
            })
            .then(() => {
                emailjs.send('service_4n8qvzs', 'template_swyn88h', {
                    user_name: nameInput.value,
                    user_email: emailInput.value,
                    message: messageInput.value
                });

                verifyStatus.textContent = "✅ Message sent successfully!";
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
                otpInput.value = '';

                step2.style.display = "none";
                step1.style.display = "block";
            })
            .catch(err => {
                verifyStatus.textContent = "❌ Failed to send message.";
                console.error(err);
            });
        } else {
            verifyStatus.textContent = "❌ Wrong OTP, try again!";
        }
    });

});
