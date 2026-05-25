// Theme Toggle
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Load saved theme
if (localStorage.getItem("theme")) {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme"),
  );
}

// Simple SPA Routing
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // Hide all pages
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.add("hidden"));
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.remove("active"));

    // Show target page
    const target = e.target.getAttribute("data-target");
    const targetPage = document.getElementById(target);
    targetPage.classList.remove("hidden");
    targetPage.classList.add("active");
  });
});
