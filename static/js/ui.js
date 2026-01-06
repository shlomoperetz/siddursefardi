// Siddur Sefardi - Interactive Features  
// BUILD_TOKEN: 2026-01-06-NAVMINI-DYNAMIC

let fontSize = 21;

function adjustFont(delta) {
  fontSize = Math.max(16, Math.min(32, fontSize + delta));
  document.documentElement.style.setProperty('--font', fontSize + 'px');
  localStorage.setItem('siddur_fontSize', fontSize);
}

function toggleUI() {
  document.body.classList.toggle('ui-hidden');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDarkMode() {
  const root = document.documentElement;
  const topbar = document.querySelector('header.topbar');
  const bottombar = document.querySelector('nav.bottombar');
  const navMini = document.querySelector('.nav-mini');
  
  if (root.classList.contains('dark-mode')) {
    root.classList.remove('dark-mode');
    root.classList.add('light-mode');
    if (topbar) topbar.classList.remove('dark-mode');
    if (bottombar) bottombar.classList.remove('dark-mode');
    if (navMini) navMini.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else if (root.classList.contains('light-mode')) {
    root.classList.remove('light-mode');
    if (topbar) topbar.classList.remove('dark-mode');
    if (bottombar) bottombar.classList.remove('dark-mode');
    if (navMini) navMini.classList.remove('dark-mode');
    localStorage.removeItem('theme');
  } else {
    root.classList.add('dark-mode');
    if (topbar) topbar.classList.add('dark-mode');
    if (bottombar) bottombar.classList.add('dark-mode');
    if (navMini) navMini.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
}

window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  const savedFontSize = localStorage.getItem('siddur_fontSize');
  const root = document.documentElement;
  const topbar = document.querySelector('header.topbar');
  const bottombar = document.querySelector('nav.bottombar');
  const navMini = document.querySelector('.nav-mini');
  
  if (savedTheme === 'dark') {
    root.classList.add('dark-mode');
    if (topbar) topbar.classList.add('dark-mode');
    if (bottombar) bottombar.classList.add('dark-mode');
    if (navMini) navMini.classList.add('dark-mode');
  } else if (savedTheme === 'light') {
    root.classList.add('light-mode');
  }
  
  if (savedFontSize) {
    fontSize = parseInt(savedFontSize);
    root.style.setProperty('--font', fontSize + 'px');
  }
  
  initNavigation();
  updateBookmarkButton();
});

let positionMarker = null;

function savePosition() {
  const scrollPos = window.pageYOffset;
  localStorage.setItem('siddur_position', scrollPos);
  localStorage.setItem('siddur_page', window.location.pathname);
}

let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 400;

function toggleBookmark() {
  const currentPage = window.location.pathname;
  const bookmarkPage = localStorage.getItem('siddur_bookmark_page');
  const bookmarkPos = localStorage.getItem('siddur_bookmark_pos');
  const now = Date.now();
  const timeSinceLastClick = now - lastClickTime;
  
  if (bookmarkPage === currentPage && bookmarkPos) {
    if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
      localStorage.removeItem('siddur_bookmark_page');
      localStorage.removeItem('siddur_bookmark_pos');
      updateBookmarkButton();
      
      const btn = document.getElementById('bookmarkBtn');
      if (btn) {
        btn.style.transform = 'rotate(180deg) scale(0.8)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 300);
      }
    } else {
      window.scrollTo({ top: parseInt(bookmarkPos), behavior: 'smooth' });
      showPositionMarker();
      
      const btn = document.getElementById('bookmarkBtn');
      if (btn) {
        btn.style.transform = 'scale(1.15)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 200);
      }
    }
  } else if (bookmarkPage && bookmarkPage !== currentPage) {
    const pageNames = {
      '/weekday/arvit/': 'עַרְבִית',
      '/weekday/shacharit/': 'שַׁחֲרִית',
      '/weekday/mincha/': 'מִנְחָה'
    };
    const oldPageName = pageNames[bookmarkPage] || 'otra página';
    
    if (confirm(`¿Mover marcador desde ${oldPageName} a esta página?`)) {
      const scrollPos = window.pageYOffset;
      localStorage.setItem('siddur_bookmark_page', currentPage);
      localStorage.setItem('siddur_bookmark_pos', scrollPos);
      updateBookmarkButton();
      
      const btn = document.getElementById('bookmarkBtn');
      if (btn) {
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 200);
      }
    }
  } else {
    const scrollPos = window.pageYOffset;
    localStorage.setItem('siddur_bookmark_page', currentPage);
    localStorage.setItem('siddur_bookmark_pos', scrollPos);
    updateBookmarkButton();
    
    const btn = document.getElementById('bookmarkBtn');
    if (btn) {
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
    }
  }
  
  lastClickTime = now;
}

function updateBookmarkButton() {
  const currentPage = window.location.pathname;
  const bookmarkPage = localStorage.getItem('siddur_bookmark_page');
  const btn = document.getElementById('bookmarkBtn');
  const icon = document.getElementById('bookmarkIcon');
  
  if (!btn || !icon) return;
  
  if (bookmarkPage === currentPage) {
    btn.classList.add('bookmarked');
    icon.textContent = '◆';
    btn.title = 'Click: ir al marcador • Doble click: eliminar';
  } else if (bookmarkPage) {
    btn.classList.remove('bookmarked');
    icon.textContent = '◇';
    btn.title = 'Click: mover marcador aquí';
  } else {
    btn.classList.remove('bookmarked');
    icon.textContent = '◇';
    btn.title = 'Click: guardar posición';
  }
}

function restorePosition() {
  const savedPage = localStorage.getItem('siddur_page');
  const savedPos = localStorage.getItem('siddur_position');
  
  if (savedPage === window.location.pathname && savedPos) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedPos));
      showPositionMarker();
    }, 100);
  }
}

function showPositionMarker() {
  const paragraphs = document.querySelectorAll('.page p, .page h2');
  const viewportMiddle = window.pageYOffset + (window.innerHeight / 2);
  
  let closestParagraph = null;
  let closestDistance = Infinity;
  
  paragraphs.forEach(p => {
    const rect = p.getBoundingClientRect();
    const pMiddle = window.pageYOffset + rect.top + (rect.height / 2);
    const distance = Math.abs(pMiddle - viewportMiddle);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestParagraph = p;
    }
  });
  
  if (closestParagraph && !positionMarker) {
    positionMarker = document.createElement('div');
    positionMarker.className = 'position-marker';
    closestParagraph.style.position = 'relative';
    closestParagraph.appendChild(positionMarker);
    
    setTimeout(() => {
      if (positionMarker) {
        positionMarker.remove();
        positionMarker = null;
      }
    }, 3000);
  }
}

let saveTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(savePosition, 2000);
});

window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    progressBar.style.background = 
      `linear-gradient(to top, #d4af37 ${scrolled}%, rgba(128,128,128,.06) ${scrolled}%)`;
  }
});

// ========== LÓGICA PRINCIPAL DE NAVEGACIÓN ==========
let lastScroll = 0;
const TOP_THRESHOLD = 100;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  const navMini = document.querySelector('.nav-mini');
  const topbar = document.querySelector('header.topbar');
  const bottombar = document.querySelector('nav.bottombar');
  
  const isAtTop = currentScroll < TOP_THRESHOLD;
  const scrollingUp = currentScroll < lastScroll;
  const scrollingDown = currentScroll > lastScroll;
  
  // Topbar: ocultar después de 200px
  if (topbar) {
    if (currentScroll > 200) {
      topbar.style.transform = 'translateY(-130%)';
    } else {
      topbar.style.transform = 'translateY(0)';
    }
  }
  
  // Lógica de bottombar y nav-mini
  if (isAtTop) {
    // EN EL INICIO: ambos visibles, nav-mini encima de bottombar
    if (bottombar) bottombar.classList.remove('hidden');
    if (navMini) {
      navMini.classList.remove('hidden');
      navMini.classList.remove('solo');
    }
  } else if (scrollingDown) {
    // SCROLL ABAJO: ambos ocultos
    if (bottombar) bottombar.classList.add('hidden');
    if (navMini) navMini.classList.add('hidden');
  } else if (scrollingUp) {
    // SCROLL ARRIBA (no en inicio): solo nav-mini, pegado al fondo
    if (bottombar) bottombar.classList.add('hidden');
    if (navMini) {
      navMini.classList.remove('hidden');
      navMini.classList.add('solo');
    }
  }
  
  lastScroll = currentScroll;
  updateCurrentSection();
});

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }
}

function toggleSectionMenu() {
  openSidebar();
}

// ========== NAVEGACIÓN ADAPTADA A PRAYER-BLOCKS ==========
function initNavigation() {
  const prayerTitles = document.querySelectorAll('.prayer-title');
  const sidebarNav = document.getElementById('sidebarNav');
  
  if (!prayerTitles.length) return;
  
  prayerTitles.forEach((title, index) => {
    const prayerBlock = title.closest('.prayer-block');
    if (!prayerBlock) return;
    
    const id = `prayer-block-${index}`;
    prayerBlock.id = id;
    
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = title.textContent;
    link.onclick = (e) => {
      e.preventDefault();
      prayerBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeSidebar();
    };
    
    if (sidebarNav) {
      sidebarNav.appendChild(link);
    }
  });
  
  updateCurrentSection();
  restorePosition();
}

function updateCurrentSection() {
  const prayerBlocks = document.querySelectorAll('.prayer-block');
  const currentSectionText = document.getElementById('currentSectionText');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  if (!currentSectionText || !prayerBlocks.length) return;
  
  let currentSection = '';
  let activeIndex = -1;
  
  prayerBlocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight / 3 && rect.bottom > 0) {
      const title = block.querySelector('.prayer-title');
      if (title) {
        currentSection = title.textContent;
        activeIndex = index;
      }
    }
  });
  
  if (currentSection) {
    currentSectionText.textContent = currentSection;
  } else if (prayerBlocks.length > 0) {
    const firstTitle = prayerBlocks[0].querySelector('.prayer-title');
    if (firstTitle) {
      currentSectionText.textContent = firstTitle.textContent;
    }
  }
  
  sidebarLinks.forEach((link, index) => {
    if (index === activeIndex) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
