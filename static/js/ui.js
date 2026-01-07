// test

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
  const prayerTitles = document.querySelectorAll('.prayer-title');
  const sidebarNav = document.getElementById('sidebarNav');
  
  prayerTitles.forEach((title, index) => {
    const prayerBlock = title.closest('.prayer-block');
    const id = 'prayer-block-' + index;
    prayerBlock.id = id;
    const link = document.createElement('a');
    link.href = '#' + id;
    link.textContent = title.textContent;
    link.onclick = (e) => {
      e.preventDefault();
      prayerBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeSidebar();
    };
    if (sidebarNav) sidebarNav.appendChild(link);
  });
  
  updateCurrentSection();
}

let fontSize = 21;

function adjustFont(delta) {
  fontSize = Math.max(16, Math.min(55, fontSize + delta));
  document.documentElement.style.setProperty('--font', fontSize + 'px');
  localStorage.setItem('siddur_fontSize', fontSize);
}

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

function goToBirkat() {
  window.location.href = '/extra/birkat-hamazon/';
}

function goToUrgency() {
  window.location.href = '/urgencia/';
}

function setMinyanMode(mode) {
  const yachidBtn = document.getElementById('yachidBtn');
  const minyanBtn = document.getElementById('minyanBtn');
  document.body.classList.remove('mode-yachid', 'mode-minyan');
  document.body.classList.add('mode-' + mode);
  if (yachidBtn) yachidBtn.classList.toggle('active', mode === 'yachid');
  if (minyanBtn) minyanBtn.classList.toggle('active', mode === 'minyan');
  localStorage.setItem('siddur_minyanMode', mode);
}

function updateCurrentSection() {
  const blocks = document.querySelectorAll('.prayer-block');
  const text = document.getElementById('currentSectionText');
  if (!text || blocks.length === 0) return;
  
  let current = '';
  blocks.forEach(function(block) {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight / 3 && rect.bottom > 0) {
      const t = block.querySelector('.prayer-title');
      if (t) current = t.textContent;
    }
  });
  
  if (current) text.textContent = current;
}

window.addEventListener('scroll', function() {
  updateCurrentSection();
  const scroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const pct = height > 0 ? (scroll / height) * 100 : 0;
  const bar = document.querySelector('.reading-progress');
  if (bar) bar.style.background = 'linear-gradient(to top, #d4af37 ' + pct + '%, rgba(128,128,128,.06) ' + pct + '%)';
  const topbar = document.querySelector('header.topbar');
  if (topbar) topbar.style.transform = scroll > 200 ? 'translateY(-130%)' : 'translateY(0)';
});

window.addEventListener('load', function() {
  const theme = localStorage.getItem('theme');
  const size = localStorage.getItem('siddur_fontSize');
  const mode = localStorage.getItem('siddur_minyanMode') || 'minyan';
  if (theme === 'dark') document.documentElement.classList.add('dark-mode');
  if (theme === 'light') document.documentElement.classList.add('light-mode');
  if (size) {
    fontSize = parseInt(size);
    document.documentElement.style.setProperty('--font', fontSize + 'px');
  }
  setMinyanMode(mode);
  initNavigation();
});
