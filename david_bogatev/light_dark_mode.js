function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme') || 'dark';
    let next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ff-theme', next);
    
    updateThemeButton(next);
}

function updateThemeButton(theme) {
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    
    if (!icon || !label) return;
    
    if (theme === 'dark') {
        icon.textContent = '☀️';
        label.textContent = 'Светла';
    } else {
        icon.textContent = '🌙';
        label.textContent = 'Тъмна';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('ff-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
});