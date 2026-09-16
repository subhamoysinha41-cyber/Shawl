import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import heroImage from "../../assets/images/hero-banner-1.jpg";
import courseImage from "../../assets/images/course-1.jpg";
import courseImageTwo from "../../assets/images/course-2.jpg";
import courseImageThree from "../../assets/images/course-3.jpg";
import "./styles.css";

const courses = [
  {
    title: "Design systems that scale",
    type: "UI / UX",
    image: courseImage,
    duration: "8 weeks",
  },
  {
    title: "Modern web development",
    type: "Engineering",
    image: courseImageTwo,
    duration: "10 weeks",
  },
  {
    title: "Data and intelligent products",
    type: "Data science",
    image: courseImageThree,
    duration: "6 weeks",
  },
];

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Something went wrong");
  return body;
}

function Brand() {
  return (
    <a className="font-bold text-[25px] tracking-[-1.8px]" href="#top">
      <span className="text-coral">sh</span>awl
      <span className="text-coral">.</span>
    </a>
  );
}

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("shawl-user") || "null"),
  );
  const [notice, setNotice] = useState(""),
    [tasks, setTasks] = useState([]),
    [taskTitle, setTaskTitle] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const token = localStorage.getItem("shawl-token");

  useEffect(() => {
    if (token)
      request("/tasks", { headers: { Authorization: `Bearer ${token}` } })
        .then(setTasks)
        .catch(handleLogout);
  }, [token]);
  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }
  function handleLogout() {
    localStorage.removeItem("shawl-token");
    localStorage.removeItem("shawl-user");
    setUser(null);
    setTasks([]);
  }
  async function handleAuth(event) {
    event.preventDefault();
    try {
      const result = await request(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      if (authMode === "register") {
        showNotice("Account created. You can sign in now.");
        setAuthMode("login");
      } else {
        localStorage.setItem("shawl-token", result.token);
        localStorage.setItem(
          "shawl-user",
          JSON.stringify({ username: result.username }),
        );
        setUser({ username: result.username });
        setAuthOpen(false);
      }
    } catch (error) {
      showNotice(error.message);
    }
  }
  async function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim() || !token) return;
    try {
      const task = await request("/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: taskTitle }),
      });
      setTasks((current) => [task, ...current]);
      setTaskTitle("");
    } catch (error) {
      showNotice(error.message);
    }
  }
  async function toggleTask(task) {
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: !task.completed }),
      });
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? updated : item)),
      );
    } catch (error) {
      showNotice(error.message);
    }
  }
  async function submitContact(event) {
    event.preventDefault();
    try {
      await request("/messages", {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      event.currentTarget.reset();
      setContactSent(true);
    } catch (error) {
      showNotice(error.message);
    }
  }

  return (
    <>
      <header className="mx-auto flex h-[82px] w-[min(1250px,calc(100%-2rem))] items-center justify-between md:w-[min(1250px,calc(100%-4rem))]">
        <Brand />
        <nav className="hidden gap-9 text-sm text-muted md:flex">
          <a className="hover:text-coral" href="#programs">
            Programs
          </a>
          <a className="hover:text-coral" href="#method">
            Our method
          </a>
          <a className="hover:text-coral" href="#contact">
            Contact
          </a>
        </nav>
        {user ? (
          <button
            className="text-sm font-semibold text-ink hover:text-coral"
            onClick={handleLogout}
          >
            Sign out, {user.username}
          </button>
        ) : (
          <button
            className="button px-4 py-2.5"
            onClick={() => setAuthOpen(true)}
          >
            Join Shawl
          </button>
        )}
      </header>
      <main id="top">
        <section className="page-width grid items-center gap-16 py-16 md:min-h-[610px] md:grid-cols-[1fr_.9fr] md:py-20">
          <div>
            <p className="eyebrow">A better way to learn</p>
            <h1 className="max-w-[620px] text-[clamp(3.5rem,7vw,5.7rem)] font-bold leading-[.96] tracking-[-.07em]">
              Make room for{" "}
              <em className="font-display font-medium tracking-[-.04em]">
                curiosity.
              </em>
            </h1>
            <p className="mt-7 max-w-[430px] text-lg text-muted">
              Practical programs for people building what comes next. Learn with
              patient mentors, ambitious peers, and work that matters.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-7">
              <a className="button" href="#programs">
                Explore programs <span>↗</span>
              </a>
              <a
                className="font-semibold text-ink hover:text-coral"
                href="#method"
              >
                How Shawl works <span className="ml-2 text-xl">→</span>
              </a>
            </div>
          </div>
          <div className="relative bg-cream p-4 pb-0 before:absolute before:-left-12 before:-top-8 before:-z-10 before:h-28 before:w-28 before:bg-lime">
            <img
              className="h-[330px] w-full object-cover saturate-[.75] md:h-[430px]"
              src={heroImage}
              alt="Student working on a project"
            />
            <div className="absolute -bottom-6 -left-7 bg-lime px-6 py-4 text-[13px] leading-tight">
              Learn by making
              <br />
              <strong className="text-base">not memorising.</strong>
            </div>
          </div>
        </section>
        <section className="page-width flex flex-wrap justify-between gap-4 border-y border-ink/15 py-5 text-[11px] uppercase tracking-[.15em] text-muted">
          <span>Trusted by 2,400+ curious minds</span>
          <span>Live mentorship</span>
          <span className="hidden sm:inline">Project-led learning</span>
          <span className="hidden sm:inline">Community for life</span>
        </section>
        <section className="page-width py-24" id="programs">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow">Pick your next chapter</p>
              <h2 className="text-4xl font-bold leading-none tracking-[-.06em] md:text-5xl">
                Programs with a point of view.
              </h2>
            </div>
            <span className="text-xs text-muted">03 / programs</span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {courses.map((course, index) => (
              <article
                className={`bg-white ${index === 1 ? "md:mt-12" : index === 2 ? "md:mt-24" : ""}`}
                key={course.title}
              >
                <img
                  className="h-52 w-full object-cover"
                  src={course.image}
                  alt=""
                />
                <div className="p-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-coral">
                    {course.type}
                  </span>
                  <h3 className="my-4 text-2xl font-bold leading-tight tracking-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {course.duration} <i className="px-1 text-coral">•</i>{" "}
                    Certificate included
                  </p>
                  <a
                    className="mt-4 inline-block text-sm font-bold hover:text-coral"
                    href="#contact"
                  >
                    Learn more ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="page-width mb-24 grid gap-10 bg-ink px-8 py-14 text-white md:grid-cols-[1.2fr_.8fr] md:px-20"
          id="method"
        >
          <div className="font-display text-4xl italic leading-tight md:text-[42px]">
            “The best learning leaves you with better questions.”
          </div>
          <div className="max-w-xs text-[#bcc6bf]">
            <p className="eyebrow !text-lime">The Shawl method</p>
            <p>
              We keep the classroom close to the work. You will build, test,
              share, and revise with guidance from people who do this every day.
            </p>
            <a
              className="font-semibold text-lime hover:text-white"
              href="#contact"
            >
              Meet the community <span className="ml-2 text-xl">→</span>
            </a>
          </div>
        </section>
        <section className="page-width border-t border-ink/15 py-16">
          {user ? (
            <>
              <p className="eyebrow">Your learning desk</p>
              <h2 className="text-4xl font-bold tracking-[-.06em]">
                Keep your next step close.
              </h2>
              <form onSubmit={addTask} className="mt-8 flex max-w-xl gap-3">
                <input
                  className="field"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Add a learning goal"
                  aria-label="Add a learning goal"
                />
                <button className="button shrink-0" type="submit">
                  Add goal
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {tasks.map((task) => (
                  <button
                    className={`border border-ink/15 bg-white px-4 py-3 text-left text-sm ${task.completed ? "text-muted line-through" : ""}`}
                    key={task._id}
                    onClick={() => toggleTask(task)}
                  >
                    <span className="mr-2 text-coral">
                      {task.completed ? "✓" : "○"}
                    </span>
                    {task.title}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <p className="eyebrow">Make it personal</p>
                <h2 className="text-4xl font-bold tracking-[-.06em]">
                  Save your learning goals.
                </h2>
              </div>
              <button
                className="button self-start"
                onClick={() => setAuthOpen(true)}
              >
                Create your account
              </button>
            </div>
          )}
        </section>
        <section
          className="page-width grid gap-14 border-t border-ink/15 py-24 md:grid-cols-2 md:gap-24"
          id="contact"
        >
          <div>
            <p className="eyebrow">Start a conversation</p>
            <h2 className="text-5xl font-bold leading-none tracking-[-.07em] md:text-6xl">
              Still thinking?
              <br />
              <em className="font-display font-medium">Let’s talk.</em>
            </h2>
            <p className="mt-7 max-w-xs text-muted">
              Tell us what you are hoping to learn. We will help you find the
              right place to begin.
            </p>
          </div>
          {contactSent ? (
            <div className="self-center bg-lime p-7">
              <strong className="text-2xl">Message received.</strong>
              <p>We will be in touch soon.</p>
            </div>
          ) : (
            <form className="grid content-start gap-3" onSubmit={submitContact}>
              <input
                className="field"
                name="name"
                required
                placeholder="Your name"
              />
              <input
                className="field"
                name="email"
                type="email"
                required
                placeholder="Email address"
              />
              <input
                className="field"
                name="subject"
                required
                placeholder="What can we help with?"
              />
              <textarea
                className="field resize-y"
                name="message"
                required
                rows="4"
                placeholder="A little more detail"
              ></textarea>
              <button className="button mt-4 justify-self-start" type="submit">
                Send message <span>↗</span>
              </button>
            </form>
          )}
        </section>
      </main>
      <footer className="page-width flex flex-col gap-3 border-t border-ink/15 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <Brand />
        <p>Learning for the wonderfully unfinished.</p>
        <span>© 2026 Shawl Academy</span>
      </footer>
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink px-5 py-3 text-sm text-white shadow-xl">
          {notice}
        </div>
      )}
      {authOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-ink/60 p-5"
          onClick={() => setAuthOpen(false)}
        >
          <section
            className="relative w-full max-w-md bg-paper p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-5 top-3 text-2xl"
              onClick={() => setAuthOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p className="eyebrow">
              {authMode === "login" ? "Welcome back" : "Begin here"}
            </p>
            <h2 className="mb-7 text-4xl font-bold tracking-[-.06em]">
              {authMode === "login"
                ? "Sign in to Shawl."
                : "Create your account."}
            </h2>
            <form className="grid gap-4" onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  className="field"
                  name="username"
                  required
                  placeholder="Username"
                />
              )}
              <input
                className="field"
                name="email"
                type="email"
                required
                placeholder="Email address"
              />
              <input
                className="field"
                name="password"
                type="password"
                required
                minLength="6"
                placeholder="Password"
              />
              <button className="button mt-3 justify-center" type="submit">
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
            <button
              className="mt-6 text-sm text-coral hover:underline"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
