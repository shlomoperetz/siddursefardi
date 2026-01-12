// Siddur Sefardi UI v3 - Split View

let fontSize = 21;
let sidebarFontSize = 18;
let lastScroll = 0;
const SCROLL_THRESHOLD = 100;

// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const body = document.body;
  sidebar.classList.toggle('open');
  body.classList.toggle('sidebar-open');
  if (sidebar.classList.contains('open')) {
    updateActiveSidebarLink();
    scrollToActiveLink();
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.body.classList.add('sidebar-open');
  updateActiveSidebarLink();
  scrollToActiveLink();
}

// Navegación
function initNavigation() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;
  
  const titles = document.querySelectorAll('.prayer-block .prayer-title');
  
  titles.forEach((title, index) => {
    const block = title.closest('.prayer-block');
    if (!block.id) block.id = 'prayer-block-' + index;
    
    const link = document.createElement('a');
    link.href = '#' + block.id;
    link.textContent = title.textContent;
    link.dataset.target = block.id;
    
    link.onclick = (e) => {
      e.preventDefault();
      block.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // No cerrar sidebar, solo marcar activo después del scroll
      setTimeout(updateActiveSidebarLink, 300);
    };
    
    sidebarNav.appendChild(link);
  });
  
  setInitialSection();
}

// Marcar sección activa
function updateActiveSidebarLink() {
  const links = document.querySelectorAll('.sidebar-nav a');
  const currentText = document.getElementById('currentSectionText')?.textContent;
  
  links.forEach(link => {
    link.classList.toggle('active', link.textContent === currentText);
  });
}

function scrollToActiveLink() {
  setTimeout(() => {
    const active = document.querySelector('.sidebar-nav a.active');
    if (active) {
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, 100);
}

// Actualizar sección actual basado en scroll
function updateCurrentSection() {
  const blocks = document.querySelectorAll('.prayer-block');
  const text = document.getElementById('currentSectionText');
  const mainContent = document.getElementById('mainContent');
  if (!text || blocks.length === 0) return;
  
  let current = '';
  const scrollContainer = mainContent || window;
  const scrollTop = mainContent ? mainContent.scrollTop : window.scrollY;
  
  blocks.forEach(block => {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight / 3 && rect.bottom > 0) {
      const t = block.querySelector('.prayer-title');
      if (t) current = t.textContent;
    }
  });
  
  if (current && current !== text.textContent) {
    text.textContent = current;
    if (document.getElementById('sidebar').classList.contains('open')) {
      updateActiveSidebarLink();
    }
  }
}

// Controles de fuente
function adjustFont(delta) {
  fontSize = Math.max(16, Math.min(55, fontSize + delta));
  document.documentElement.style.setProperty('--font', fontSize + 'px');
  localStorage.setItem('siddur_fontSize', fontSize);
}

function adjustSidebarFont(delta) {
  sidebarFontSize = Math.max(14, Math.min(28, sidebarFontSize + delta));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.style.fontSize = sidebarFontSize + 'px';
  });
  localStorage.setItem('siddur_sidebarFontSize', sidebarFontSize);
}

// Dark mode
function toggleDarkMode() {
  const root = document.documentElement;
  if (root.classList.contains('dark-mode')) {
    root.classList.remove('dark-mode');
    root.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else if (root.classList.contains('light-mode')) {
    root.classList.remove('light-mode');
    localStorage.removeItem('theme');
  } else {
    root.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
}

// Navegación rápida
function goToBirkat() {
  window.location.href = '/extra/birkat-hamazon/';
}

function goToUrgency() {
  window.location.href = '/urgencia/';
}

// Modo minyan
function setMinyanMode(mode) {
  const yachidBtn = document.getElementById('yachidBtn');
  const minyanBtn = document.getElementById('minyanBtn');
  document.body.classList.remove('mode-yachid', 'mode-minyan');
  document.body.classList.add('mode-' + mode);
  if (yachidBtn) yachidBtn.classList.toggle('active', mode === 'yachid');
  if (minyanBtn) minyanBtn.classList.toggle('active', mode === 'minyan');
  localStorage.setItem('siddur_minyanMode', mode);
}

// Primera sección
function setInitialSection() {
  const firstTitle = document.querySelector('.prayer-title');
  const currentSectionText = document.getElementById('currentSectionText');
  if (firstTitle && currentSectionText) {
    currentSectionText.textContent = firstTitle.textContent;
  }
}

// Progress bar
function updateProgressBar() {
  const mainContent = document.getElementById('mainContent');
  const scroll = mainContent ? mainContent.scrollTop : document.documentElement.scrollTop;
  const height = mainContent 
    ? mainContent.scrollHeight - mainContent.clientHeight
    : document.documentElement.scrollHeight - window.innerHeight;
  const pct = height > 0 ? (scroll / height) * 100 : 0;
  const bar = document.querySelector('.reading-progress');
  if (bar) bar.style.background = 'linear-gradient(to top, #d4af37 ' + pct + '%, rgba(128,128,128,.06) ' + pct + '%)';
}

// Scroll handlers
function handleScroll() {
  const mainContent = document.getElementById('mainContent');
  const currentScroll = mainContent ? mainContent.scrollTop : window.pageYOffset;
  const navMini = document.querySelector('.nav-mini');
  const bottombar = document.querySelector('.bottombar');
  const topbar = document.querySelector('.topbar');
  const leftBtn = document.getElementById('leftBtn');
  const leftBtnIcon = document.getElementById('leftBtnIcon');
  
  // Actualizar sección y progress
  updateCurrentSection();
  updateProgressBar();
  
  // Botón izquierdo
  if (currentScroll > SCROLL_THRESHOLD) {
    if (leftBtnIcon) leftBtnIcon.textContent = '↑';
    if (leftBtn) {
      leftBtn.onclick = () => {
        if (mainContent) mainContent.scrollTo({top: 0, behavior: 'smooth'});
        else window.scrollTo({top: 0, behavior: 'smooth'});
      };
    }
  } else {
    if (leftBtnIcon) leftBtnIcon.textContent = 'בהמ״ז';
    if (leftBtn) leftBtn.onclick = goToBirkat;
  }
  
  // Ocultar/mostrar barras
  if (currentScroll > lastScroll && currentScroll > 200) {
    if (navMini) navMini.classList.add('hidden');
    if (bottombar) bottombar.classList.add('hidden');
    if (topbar) topbar.style.transform = 'translateY(-130%)';
  } else {
    if (navMini) navMini.classList.remove('hidden');
    if (currentScroll < SCROLL_THRESHOLD && bottombar) bottombar.classList.remove('hidden');
    if (topbar) topbar.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
}

// Init
window.addEventListener('load', function() {
  const theme = localStorage.getItem('theme');
  const size = localStorage.getItem('siddur_fontSize');
  const sidebarSize = localStorage.getItem('siddur_sidebarFontSize');
  const mode = localStorage.getItem('siddur_minyanMode') || 'minyan';
  
  if (theme === 'dark') document.documentElement.classList.add('dark-mode');
  if (theme === 'light') document.documentElement.classList.add('light-mode');
  if (size) {
    fontSize = parseInt(size);
    document.documentElement.style.setProperty('--font', fontSize + 'px');
  }
  if (sidebarSize) {
    sidebarFontSize = parseInt(sidebarSize);
  }
  
  setMinyanMode(mode);
  initNavigation();
  
  // Scroll listener en main-content
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.addEventListener('scroll', handleScroll);
  } else {
    window.addEventListener('scroll', handleScroll);
  }
});
