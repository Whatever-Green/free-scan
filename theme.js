document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Apply saved theme on page load
  if (localStorage.getItem('theme') === 'dark') {
    root.classList.add('dark');
  }

  // Dark mode toggle logic
  const toggle = document.getElementById('darkToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  // Background image logic
  const images = [
        'https://images.pexels.com/photos/268917/pexels-photo-268917.jpeg',
        'https://images.pexels.com/photos/2193239/pexels-photo-2193239.jpeg',
        'https://images.pexels.com/photos/2232917/pexels-photo-2232917.jpeg',
        'https://images.pexels.com/photos/268917/pexels-photo-268917.jpeg'
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const preload = new Image();
  preload.src = randomImage;

  preload.onload = () => {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-0 dark:opacity-0 transition-opacity duration-700';
    bgDiv.style.backgroundImage = `url('${randomImage}')`;

    // Make sure body is available
    if (document.body) {
      document.body.insertBefore(bgDiv, document.body.firstChild);

      requestAnimationFrame(() => {
        bgDiv.classList.remove('opacity-0', 'dark:opacity-0');
        bgDiv.classList.add('opacity-[0.15]', 'dark:opacity-[0.15]');
      });
    }
  };
});


//https://images.pexels.com/photos/268917/pexels-photo-268917.jpeg

