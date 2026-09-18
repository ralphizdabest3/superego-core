const sections = document.querySelectorAll('.section');

function checkVisibility() {
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      section.classList.add('visible');
    }
  });
}

window.addEventListener('load', checkVisibility);
window.addEventListener('scroll', checkVisibility);