// theme.js
(function () {
    const root = document.documentElement;
  
    // Apply saved mode on page load
    if (localStorage.getItem('theme') === 'dark') {
      root.classList.add('dark');
    }
  
    // Toggle handler (if button exists)
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        root.classList.toggle('dark');
        localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
      });
    }
  })();
  