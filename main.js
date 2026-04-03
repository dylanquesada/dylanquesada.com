// Reading shelf toggle
document.querySelectorAll('.toggle-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const shelf = btn.dataset.shelf;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.reading-shelf').forEach(s => s.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(`shelf-${shelf}`).classList.remove('hidden');
  });
});

// Fade-in on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.section, .project-card, .exp-item').forEach((el) => {
  el.classList.add('fade-in');
  observer.observe(el);
});
