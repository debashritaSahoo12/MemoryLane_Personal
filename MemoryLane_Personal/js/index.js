// Theme Toggle Functionality
const themeToggle = document.querySelector(".theme-toggle");
const body = document.body;
const icon = themeToggle.querySelector("i");

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  icon.className = savedTheme === "dark" ? "fa fa-moon-o" : "fa fa-sun-o";
}

themeToggle.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  if (currentTheme === "dark") {
    body.setAttribute("data-theme", "light");
    icon.className = "fa fa-sun-o";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    icon.className = "fa fa-moon-o";
    localStorage.setItem("theme", "dark");
  }
});
