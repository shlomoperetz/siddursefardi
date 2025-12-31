// Siddur Sefardi - Interactive Features  
// BUILD_TOKEN: 2025-12-31-WORKING-VERSION

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

let lastScroll = 0;
let navMiniVisible = false;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  const navMini = document.querySelector('.nav-mini');
  
  if (!navMini) return;
  
  if (currentScroll < lastScroll && currentScroll > 100) {
    if (!navMiniVisible) {
      navMini.classList.add('visible');
      navMiniVisible = true;
    }
  }
  else if (currentScroll > lastScroll && currentScroll > 100) {
    if (navMiniVisible) {
      navMini.classList.remove('visible');
      navMiniVisible = false;
    }
  }
  
  if (currentScroll > lastScroll && currentScroll > 200) {
    document.body.classList.add('ui-hidden');
  } else if (currentScroll < lastScroll - 10) {
    document.body.classList.remove('ui-hidden');
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

function initNavigation() {
  const h2Elements = document.querySelectorAll('.page h2');
  const sidebarNav = document.getElementById('sidebarNav');
  
  if (!h2Elements.length) return;
  
  h2Elements.forEach((h2, index) => {
    const id = `section-${index}`;
    h2.id = id;
    
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = h2.textContent;
    link.onclick = (e) => {
      e.preventDefault();
      h2.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const h2Elements = document.querySelectorAll('.page h2');
  const currentSectionText = document.getElementById('currentSectionText');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  if (!currentSectionText || !h2Elements.length) return;
  
  let currentSection = '';
  let activeIndex = -1;
  
  h2Elements.forEach((h2, index) => {
    const rect = h2.getBoundingClientRect();
    if (rect.top < window.innerHeight / 3 && rect.top > -200) {
      currentSection = h2.textContent;
      activeIndex = index;
    }
  });
  
  if (currentSection) {
    currentSectionText.textContent = currentSection;
  } else if (h2Elements.length > 0) {
    currentSectionText.textContent = h2Elements[0].textContent;
  }
  
  sidebarLinks.forEach((link, index) => {
    if (index === activeIndex) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
