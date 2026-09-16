"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggle = document.querySelector("#theme-toggle");
  const savedTheme = localStorage.getItem("shawl-portfolio-theme");

  if (savedTheme === "light") body.classList.add("light-theme");
  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    const theme = body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem("shawl-portfolio-theme", theme);
    themeToggle.textContent = theme === "light" ? "Dark mode" : "Light mode";
  });

  const contactForm = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm));
    const apiBase = (window.SHAWL_API_URL || "").replace(/\/$/, "");
    status.textContent = "Sending...";
    try {
      const response = await fetch(`${apiBase}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.message || "Message could not be sent.");
      contactForm.reset();
      status.textContent = "Message sent. Thank you.";
    } catch (error) {
      status.textContent = `${error.message} You can email me directly instead.`;
    }
  });
});
