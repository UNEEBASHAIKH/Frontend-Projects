// Collect gallery items
    const cards = Array.from(document.querySelectorAll('.card'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const counter = document.getElementById('counter');
    const closeBtn = document.getElementById('closeBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Build a dataset of current visible images
    let sequence = cards.map((card, i) => ({
      index: i,
      src: card.querySelector('img').src,
      alt: card.querySelector('img').alt,
      category: card.dataset.category
    }));

    let current = 0;

    // Open lightbox
    function openLightbox(i) {
      current = i;
      const item = sequence[current];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      counter.textContent = (current + 1) + ' / ' + sequence.length;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Close lightbox
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Navigation
    function nextImage() {
      current = (current + 1) % sequence.length;
      openLightbox(current);
    }
    function prevImage() {
      current = (current - 1 + sequence.length) % sequence.length;
      openLightbox(current);
    }

    // Card click and keyboard
    cards.forEach((card) => {
      card.addEventListener('click', () => openLightbox(Number(card.dataset.index)));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(Number(card.dataset.index));
        }
      });
    });

    // Lightbox controls
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });

    // Filters
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const gallery = document.querySelector('.gallery');

    function applyFilter(category) {
      // Update active state
      filterButtons.forEach(btn => {
        const active = btn.dataset.filter === category;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      // Show/hide cards
      const visibleCards = [];
      cards.forEach((card) => {
        const isVisible = category === 'all' || card.dataset.category === category;
        card.classList.toggle('hidden', !isVisible);
        if (isVisible) visibleCards.push(card);
      });

      // Recompute sequence to include only visible images
      sequence = visibleCards.map((card) => ({
        index: Number(card.dataset.index),
        src: card.querySelector('img').src,
        alt: card.querySelector('img').alt,
        category: card.dataset.category
      }));

      // If lightbox open and current item filtered out, snap to first visible
      if (lightbox.classList.contains('active')) {
        if (!sequence.some(item => item.index === current)) {
          current = sequence.length ? sequence[0].index : 0;
          if (sequence.length) openLightbox(sequence.findIndex(item => item.index === current));
          else closeLightbox();
        } else {
          // Update counter to reflect new sequence length
          const pos = sequence.findIndex(item => item.index === current);
          counter.textContent = (pos + 1) + ' / ' + sequence.length;
        }
      }
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    // Optional: simple touch support for lightbox (swipe)
    let touchStartX = null;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? nextImage() : prevImage();
      }
      touchStartX = null;
    });
  