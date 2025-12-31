// Theme switching
const buttons = document.querySelectorAll('.theme-btn');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove only theme classes
        document.body.classList.remove('light-theme', 'dark-theme', 'warm-theme');

        // Add the selected theme
        document.body.classList.add(btn.dataset.theme);
    });
});
