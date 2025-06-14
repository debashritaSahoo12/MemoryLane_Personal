// Mobile menu functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileMenu = document.querySelector('.mobile-menu');
const body = document.body;

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'mobile-menu-overlay';
document.body.appendChild(overlay);

// Toggle mobile menu
function toggleMobileMenu() {
    hamburgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

// Event listeners
hamburgerMenu.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on a link
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        toggleMobileMenu();
    });
});

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');
const html = document.documentElement;

function updateTheme(newTheme) {
    html.setAttribute('data-theme', newTheme);
    
    // Update desktop theme icon
    const desktopIcon = themeToggle.querySelector('i');
    desktopIcon.className = newTheme === 'dark' ? 'fa fa-moon-o' : 'fa fa-sun-o';
    
    // Update mobile theme icon
    const mobileIcon = mobileThemeToggle.querySelector('i');
    mobileIcon.className = newTheme === 'dark' ? 'fa fa-moon-o' : 'fa fa-sun-o';
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    updateTheme(savedTheme);
}

// Desktop theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
});

// Mobile theme toggle
mobileThemeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
});
