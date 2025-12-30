// Siddur Sefardi - Interactive Features
// BUILD_TOKEN: 2025-12-30-FINAL

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
});

let positionMarker = null;

function savePosition() {
  const scrollPos = window.pageYOffset;
  localStorage.setItem('siddur_position', scrollPos);
  localStorage.setItem('siddur_page', window.location.pathname);
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

window.addEventListener('load', restorePosition);

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
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > lastScroll && currentScroll > 200) {
    document.body.classList.add('ui-hidden');
  } else if (currentScroll < lastScroll - 50) {
    document.body.classList.remove('ui-hidden');
  }
  lastScroll = currentScroll;
  
  updateCurrentSection();
});

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.add('open');
  overlay.classList.add('visible');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
}

function toggleSectionMenu() {
  openSidebar();
}

function initNavigation() {
  const h2Elements = document.querySelectorAll('.page h2');
  const sidebarNav = document.getElementById('sidebarNav');
  const navMini = document.getElementById('navMini');
  
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
  
  if (navMini && h2Elements.length > 0) {
    navMini.classList.add('visible');
  }
  
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
