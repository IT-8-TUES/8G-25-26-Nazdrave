function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    let next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ff-theme', next);
    
    updateThemeButton(next);
}
