"use strict";

/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
};

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
};

addEventOnElem(navLinks, "click", closeNavbar);

/**
 * header active when scroll down to 100px
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElem = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
};

addEventOnElem(window, "scroll", activeElem);

/**
 * backend integration
 */

const apiBase = (window.SHAWL_API_URL || "").replace(/\/$/, "");
const storedToken = () => localStorage.getItem("shawl-token");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Something went wrong");
  return body;
}

function showMessage(message) {
  const notice = document.createElement("div");
  notice.className = "backend-notice";
  notice.textContent = message;
  document.body.append(notice);
  window.setTimeout(() => notice.remove(), 3500);
}

function closeAuthModal() {
  document.querySelector(".auth-modal")?.remove();
}

function openAuthModal(mode = "login") {
  closeAuthModal();
  const modal = document.createElement("div");
  modal.className = "auth-modal";
  modal.innerHTML = `
    <section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button class="auth-close" type="button" aria-label="Close">&times;</button>
      <p class="section-subtitle">Shawl account</p>
      <h2 class="h2" id="auth-title">${mode === "login" ? "Welcome back" : "Create your account"}</h2>
      <form class="auth-form">
        ${mode === "register" ? '<input class="input-field" name="username" placeholder="Username" required />' : ""}
        <input class="input-field" name="email" type="email" placeholder="Email address" required />
        <input class="input-field" name="password" type="password" minlength="6" placeholder="Password" required />
        <button class="btn has-before" type="submit"><span class="span">${mode === "login" ? "Sign in" : "Create account"}</span></button>
      </form>
      <button class="auth-switch" type="button">${mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}</button>
    </section>`;
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest(".auth-close"))
      closeAuthModal();
  });
  modal
    .querySelector(".auth-switch")
    .addEventListener("click", () =>
      openAuthModal(mode === "login" ? "register" : "login"),
    );
  modal
    .querySelector(".auth-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        const result = await apiRequest(`/auth/${mode}`, {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (mode === "register") {
          showMessage(
            result.message || "Account created. Sign in to continue.",
          );
          openAuthModal("login");
          return;
        }
        localStorage.setItem("shawl-token", result.token);
        localStorage.setItem(
          "shawl-user",
          JSON.stringify({ username: result.username }),
        );
        closeAuthModal();
        renderAccountPanel();
        showMessage(`Welcome, ${result.username}.`);
      } catch (error) {
        showMessage(error.message);
      }
    });
  document.body.append(modal);
  modal.querySelector("input").focus();
}

function renderAccountPanel() {
  const token = storedToken();
  const panel = document.querySelector("[data-account-panel]");
  if (!panel) return;
  if (!token) {
    panel.hidden = true;
    return;
  }
  const user = JSON.parse(localStorage.getItem("shawl-user") || "{}");
  panel.hidden = false;
  panel.querySelector("[data-account-name]").textContent =
    `Learning desk for ${user.username || "you"}`;
  loadTasks(panel);
}

async function loadTasks(panel) {
  try {
    const tasks = await apiRequest("/tasks", {
      headers: { Authorization: `Bearer ${storedToken()}` },
    });
    const list = panel.querySelector("[data-task-list]");
    list.innerHTML = tasks.length
      ? tasks
          .map(
            (task) => `
      <button class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task._id}" type="button">
        ${task.completed ? "✓" : "○"} ${task.title}
      </button>`,
          )
          .join("")
      : "No learning goals yet.";
    list.querySelectorAll("[data-task-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const task = tasks.find((item) => item._id === button.dataset.taskId);
        await apiRequest(`/tasks/${task._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${storedToken()}` },
          body: JSON.stringify({ completed: !task.completed }),
        });
        loadTasks(panel);
      });
    });
  } catch (error) {
    showMessage(error.message);
  }
}

document
  .querySelectorAll(".header-actions .btn, .footer-link")
  .forEach((link) => {
    if (
      link.textContent.includes("Try for free") ||
      link.textContent.includes("Sign In/Registration")
    ) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openAuthModal();
      });
    }
  });

const newsletterForm = document.querySelector(".newsletter-form");
newsletterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = new FormData(newsletterForm).get("email_address");
  try {
    await apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify({
        name: "Newsletter subscriber",
        email,
        subject: "Newsletter subscription",
        message: "Please subscribe this address to the Shawl newsletter.",
      }),
    });
    newsletterForm.reset();
    showMessage("You are subscribed.");
  } catch (error) {
    showMessage(error.message);
  }
});

const accountPanel = document.createElement("section");
accountPanel.className = "section account-panel";
accountPanel.dataset.accountPanel = "";
accountPanel.hidden = true;
accountPanel.innerHTML = `
  <div class="container">
    <p class="section-subtitle">Your account</p>
    <h2 class="h2" data-account-name>Learning desk</h2>
    <form class="task-form" data-task-form>
      <input class="input-field" name="title" placeholder="Add a learning goal" required />
      <button class="btn has-before" type="submit"><span class="span">Add goal</span></button>
    </form>
    <div class="task-list" data-task-list></div>
    <button class="auth-switch" data-sign-out type="button">Sign out</button>
  </div>`;
document.querySelector("footer")?.before(accountPanel);
accountPanel
  .querySelector("[data-task-form]")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await apiRequest("/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken()}` },
        body: JSON.stringify({ title: new FormData(form).get("title") }),
      });
      form.reset();
      loadTasks(accountPanel);
    } catch (error) {
      showMessage(error.message);
    }
  });
accountPanel.querySelector("[data-sign-out]").addEventListener("click", () => {
  localStorage.removeItem("shawl-token");
  localStorage.removeItem("shawl-user");
  renderAccountPanel();
  showMessage("You have signed out.");
});
renderAccountPanel();
