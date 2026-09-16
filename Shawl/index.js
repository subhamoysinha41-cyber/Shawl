"use strict";

const { createApp } = Vue;

createApp({
  data() {
    return {
      lightMode: localStorage.getItem("shawl-portfolio-theme") === "light",
      sending: false,
      status: "",
      form: { name: "", email: "", subject: "", message: "" },
      skills: [
        {
          number: "01",
          title: "Web development",
          text: "HTML, CSS, JavaScript, responsive interfaces, and GitHub Pages.",
        },
        {
          number: "02",
          title: "Security foundations",
          text: "Cybersecurity fundamentals, safe design, and practical analysis.",
        },
        {
          number: "03",
          title: "Working style",
          text: "Problem solving, communication, teamwork, and continuous learning.",
        },
      ],
      projects: [
        {
          number: "01",
          title: "Personal portfolio",
          text: "A focused portfolio for sharing my work, education, and goals.",
          action: "Explore",
          href: "hello.html",
        },
        {
          number: "02",
          title: "Shawl Academy",
          text: "An education platform with authentication, learning goals, and backend services.",
          action: "Visit",
          href: "edu.html",
        },
        {
          number: "03",
          title: "Cybersecurity projects",
          text: "Experiments and tools built while learning how systems can be made safer.",
          action: "Discuss",
          href: "#contact",
        },
      ],
    };
  },
  computed: {
    themeClasses() {
      return this.lightMode
        ? "bg-stone-100 text-slate-900 theme-light"
        : "bg-slate-950 text-slate-100 theme-dark";
    },
  },
  methods: {
    toggleTheme() {
      this.lightMode = !this.lightMode;
      localStorage.setItem(
        "shawl-portfolio-theme",
        this.lightMode ? "light" : "dark",
      );
    },
    async submitContact() {
      this.sending = true;
      this.status = "";
      const apiBase = (window.SHAWL_API_URL || "").replace(/\/$/, "");
      try {
        const response = await fetch(`${apiBase}/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(result.message || "Message could not be sent.");
        this.form = { name: "", email: "", subject: "", message: "" };
        this.status = "Message sent. Thank you.";
      } catch (error) {
        this.status = `${error.message} You can email me directly instead.`;
      } finally {
        this.sending = false;
      }
    },
  },
}).mount("#app");
