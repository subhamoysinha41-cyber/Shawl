/* ==========================================================================
   TERMINAL INITIALIZATION & INTERACTIVITY SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. TERMINAL TYPEWRITER EFFECT
    // Finds your main heading and types it out like a hacker console
    const mainTitle = document.querySelector("h1");
    if (mainTitle) {
        const originalText = mainTitle.innerText;
        mainTitle.innerText = ""; // Clear the text immediately on load
        
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < originalText.length) {
                mainTitle.innerText += originalText.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
                // Add a blinking cursor at the end of the sentence
                mainTitle.innerHTML += '<span style="animation: blink 1s step-end infinite;">_</span>';
            }
        }, 60); // Speed of typing (60ms per character)
    }

    // 2. SYSTEM BOOT-UP SEQUENCE
    // Makes each section fade in sequentially from the bottom
    const sections = document.querySelectorAll("section, header, footer");
    sections.forEach((sec, index) => {
        sec.style.opacity = "0";
        sec.style.transform = "translateY(15px)";
        sec.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        
        // Wait 500ms before starting, then load each section 200ms apart
        setTimeout(() => {
            sec.style.opacity = "1";
            sec.style.transform = "translateY(0)";
        }, 500 + (index * 200)); 
    });

    // 3. SECURE DATA TRANSMISSION (FORM EFFECT)
    // Runs a fake encryption sequence when the contact form is submitted
    const contactForm = document.querySelector("form");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Pause the actual submission
            
            const submitBtn = contactForm.querySelector("button[type='submit']");
            const userName = document.getElementById("name").value || "USER";
            
            // Lock the button so they can't click it twice
            submitBtn.style.cursor = "not-allowed";
            submitBtn.disabled = true;

            // The hacking stages the button will cycle through
            const loadingSteps = [
                "[>_] INITIATING SECURE HANDSHAKE...",
                "[>_] ENCRYPTING PAYLOAD (AES-256)...",
                `[✓] TRANSMISSION DELIVERED, ${userName.toUpperCase()}`
            ];

            let step = 0;
            submitBtn.innerHTML = loadingSteps[0];
            submitBtn.style.backgroundColor = "var(--neon-alert)";
            submitBtn.style.color = "white";
            
            const transmission = setInterval(() => {
                step++;
                if (step < loadingSteps.length) {
                    submitBtn.innerHTML = loadingSteps[step];
                    // Turn green on the final success step
                    if (step === loadingSteps.length - 1) {
                        submitBtn.style.backgroundColor = "var(--neon-matrix)";
                        submitBtn.style.color = "var(--sys-bg)";
                    }
                } else {
                    clearInterval(transmission);
                    // Actually submit the form to your httpbin link after the effect
                    setTimeout(() => {
                        contactForm.submit(); 
                    }, 1000);
                }
            }, 1200); // 1.2 seconds per terminal step
        });
    }

    // 4. INJECT BLINKING CURSOR ANIMATION
    // Adds the CSS keyframes required for the typewriter cursor to blink
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});