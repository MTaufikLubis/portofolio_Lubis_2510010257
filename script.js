/**
 * ==============================================================================
 * IT SOLUTION (ITS) - LANDING PAGE KATALOG DIGITAL UNIT USAHA HMP-TI
 * Senior Vanilla JavaScript Architecture (ES6+)
 * No external frameworks, zero console errors, smooth & accessible interactions
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. SELECTORS & STATE INITIALIZATION
  // ==========================================================================
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const backToTopBtn = document.getElementById('back-to-top');

  // Navigation links
  const desktopNavLinks = document.querySelectorAll('.nav-desktop .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Catalog selectors
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const catalogSearchInput = document.getElementById('catalog-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const noProductsMsg = document.getElementById('no-products-found');
  const resetFilterBtn = document.getElementById('btn-reset-filter');

  // Modal selectors
  const btnViewPricePhoto = document.getElementById('btn-view-price-photo');
  const pricePhotoModal = document.getElementById('price-photo-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Realtime WITA elements
  const currentWitaTimeEl = document.getElementById('current-wita-time');
  const currentWitaDateEl = document.getElementById('current-wita-date');
  const liveStatusDot = document.getElementById('live-status-dot');
  const liveStatusName = document.getElementById('live-status-name');
  const liveStatusDesc = document.getElementById('live-status-desc');
  const statusIndicatorDot = document.getElementById('status-indicator-dot');
  const statusIndicatorText = document.getElementById('status-indicator-text');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  // ==========================================================================
  // 2. STICKY NAVBAR & SCROLL BEHAVIOR
  // ==========================================================================
  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Toggle navbar style on scroll
    if (scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // Toggle back to top button visibility
    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    // Update active nav link (ScrollSpy)
    updateActiveNavLink(scrollY);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Back to top button action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 3. MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const toggleMobileMenu = (open) => {
    const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.add('open');
      if (mobileBackdrop) {
        mobileBackdrop.classList.add('open');
        mobileBackdrop.setAttribute('aria-hidden', 'false');
      }
      if (mobileToggle) {
        mobileToggle.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      mobileMenu.classList.remove('open');
      if (mobileBackdrop) {
        mobileBackdrop.classList.remove('open');
        mobileBackdrop.setAttribute('aria-hidden', 'true');
      }
      if (mobileToggle) {
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close via X button in mobile header
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  }

  // Close via backdrop click
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  }

  // Close mobile drawer when clicking any nav link
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  });

  // Close drawer on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      toggleMobileMenu(false);
    }
  });

  // ==========================================================================
  // 4. SCROLLSPY (ACTIVE NAVIGATION LINK HIGHLIGHTING)
  // ==========================================================================
  const unitSectionIds = ['unit-usaha', 'percetakan', 'konsinyasi', 'jasa-kreatif'];

  const updateActiveNavLink = (scrollY) => {
    const headerHeight = header.offsetHeight + 30;
    let currentSectionId = '';

    sections.forEach((sec) => {
      const top = sec.offsetTop - headerHeight;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = id;
      }
    });

    if (!currentSectionId && scrollY < 200) {
      currentSectionId = 'beranda';
    }

    if (currentSectionId) {
      // Desktop nav links
      desktopNavLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        const isUnitParent = (href === 'unit-usaha' && unitSectionIds.includes(currentSectionId));

        if (href === currentSectionId || isUnitParent) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Mobile nav links
      mobileNavLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        const isUnitParent = (href === 'unit-usaha' && currentSectionId === 'unit-usaha');

        if (href === currentSectionId || isUnitParent) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // ==========================================================================
  // 5. CATALOG FILTERING & REAL-TIME SEARCH
  // ==========================================================================
  const applyProductFilters = () => {
    let visibleCount = 0;

    productCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const name = card.getAttribute('data-name').toLowerCase();
      const title = card.querySelector('.product-name')?.textContent.toLowerCase() || '';

      const matchCategory = (currentCategory === 'all' || category === currentCategory);
      const matchSearch = (!currentSearchQuery || name.includes(currentSearchQuery) || title.includes(currentSearchQuery));

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle Empty State message
    if (noProductsMsg) {
      noProductsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  // Filter Buttons Click Event
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentCategory = btn.getAttribute('data-filter');
      applyProductFilters();
    });
  });

  // Search Input Event
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();

      // Show or hide clear button
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
      }

      applyProductFilters();
    });
  }

  // Clear Search Button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      catalogSearchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      catalogSearchInput.focus();
      applyProductFilters();
    });
  }

  // Reset Filter Button from No Results state
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      if (catalogSearchInput) {
        catalogSearchInput.value = '';
        currentSearchQuery = '';
      }
      if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
      }
      currentCategory = 'all';
      filterBtns.forEach((b) => {
        if (b.getAttribute('data-filter') === 'all') {
          b.classList.add('active');
          b.setAttribute('aria-selected', 'true');
        } else {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        }
      });
      applyProductFilters();
    });
  }

  // ==========================================================================
  // 6. LIGHTBOX MODAL: LIHAT FOTO DAFTAR HARGA ASLI
  // ==========================================================================
  const openModal = () => {
    if (pricePhotoModal) {
      pricePhotoModal.classList.add('open');
      pricePhotoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (pricePhotoModal) {
      pricePhotoModal.classList.remove('open');
      pricePhotoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (btnViewPricePhoto) {
    btnViewPricePhoto.addEventListener('click', openModal);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (pricePhotoModal) {
    pricePhotoModal.addEventListener('click', (e) => {
      if (e.target === pricePhotoModal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pricePhotoModal && pricePhotoModal.classList.contains('open')) {
      closeModal();
    }
  });

  // ==========================================================================
  // 7. REAL-TIME WITA (UTC+8) CLOCK & OPERATIONAL STATUS CHECKER
  // ==========================================================================
  const updateWitaStatus = () => {
    // Current UTC Date & calculate WITA (UTC + 8 hours)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaOffset = 8 * 60 * 60 * 1000;
    const witaDate = new Date(utcTime + witaOffset);

    const hours = witaDate.getHours();
    const minutes = witaDate.getMinutes();
    const seconds = witaDate.getSeconds();
    const day = witaDate.getDay(); // 0: Minggu, 1: Senin, ..., 5: Jumat, 6: Sabtu

    // Format Digital Clock HH:MM:SS
    const pad = (num) => String(num).padStart(2, '0');
    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    if (currentWitaTimeEl) {
      currentWitaTimeEl.textContent = timeString;
    }

    // Format Date string in Indonesian
    const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsName = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dateString = `${daysName[day]}, ${witaDate.getDate()} ${monthsName[witaDate.getMonth()]} ${witaDate.getFullYear()}`;
    if (currentWitaDateEl) {
      currentWitaDateEl.textContent = dateString;
    }

    // Check Open / Closed logic
    // Jadwal Operasional:
    // Senin - Jumat: 07.30 - 21.30 WITA
    // Sabtu: 07.30 - 21.30 WITA (jadwal ekstensi)
    // Minggu: Tutup
    const currentTimeInMinutes = (hours * 60) + minutes;
    const openTimeInMinutes = (7 * 60) + 30;   // 07:30 = 450 min
    const closeTimeInMinutes = (21 * 60) + 30; // 21:30 = 1290 min

    let isOpen = false;
    let statusNote = '';

    if (day >= 1 && day <= 5) {
      // Senin - Jumat
      if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
        isOpen = true;
        statusNote = 'Stand Buka Hari Ini (07.30 – 21.30 WITA)';
      } else {
        isOpen = false;
        statusNote = currentTimeInMinutes < openTimeInMinutes
          ? 'Buka pukul 07.30 WITA'
          : 'Tutup hari ini. Buka kembali besok pukul 07.30 WITA';
      }
    } else if (day === 6) {
      // Sabtu (Jadwal Ekstensi)
      if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
        isOpen = true;
        statusNote = 'Stand Buka (Jadwal Ekstensi Sabtu)';
      } else {
        isOpen = false;
        statusNote = 'Tutup. Stand Sabtu hanya melayani saat jadwal ekstensi';
      }
    } else {
      // Minggu
      isOpen = false;
      statusNote = 'Tutup Hari Minggu. Buka kembali hari Senin pukul 07.30 WITA';
    }

    // Update Hero Status Pill
    if (statusIndicatorDot && statusIndicatorText) {
      if (isOpen) {
        statusIndicatorDot.className = 'status-indicator open';
        statusIndicatorText.textContent = 'Stand Buka Sekarang (WITA)';
      } else {
        statusIndicatorDot.className = 'status-indicator closed';
        statusIndicatorText.textContent = 'Stand Sedang Tutup (WITA)';
      }
    }

    // Update Operasional Section Live Status
    if (liveStatusDot && liveStatusName && liveStatusDesc) {
      if (isOpen) {
        liveStatusDot.className = 'status-dot open';
        liveStatusName.textContent = 'STAND SEDANG BUKA';
        liveStatusDesc.textContent = `${statusNote}. Anda dapat berkunjung langsung ke stand ITS.`;
      } else {
        liveStatusDot.className = 'status-dot closed';
        liveStatusName.textContent = 'STAND SEDANG TUTUP';
        liveStatusDesc.textContent = `${statusNote}. Anda tetap dapat mengirimkan pesan via WhatsApp.`;
      }
    }
  };

  // Run immediately and set interval for realtime clock
  updateWitaStatus();
  setInterval(updateWitaStatus, 1000);

  // ==========================================================================
  // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealElements.forEach((el) => {
      el.classList.add('revealed');
    });
  }

  // ==========================================================================
  // 9. SMOOTH SCROLLING FOR ALL INTERNAL ANCHOR LINKS
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        let offsetPosition = 0;
        if (targetId !== '#beranda') {
          const headerOffset = header.offsetHeight + 10;
          const elementPosition = targetElement.getBoundingClientRect().top;
          offsetPosition = Math.max(0, elementPosition + window.pageYOffset - headerOffset);
        }

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Set URL hash without jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // Re-run Lucide icons creation if available
  if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Ensure top of page on #beranda or root load
  if (window.location.hash === '#beranda' || window.location.hash === '') {
    window.scrollTo(0, 0);
  }
});

