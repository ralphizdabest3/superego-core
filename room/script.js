(() => {
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    openedComputer: false,
    openedCorkboard: false,
    openedDoor: false,
    lampOn: false,
    soundOn: true,
    foundSecret: false,
  };

  // MEOW SOUND
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playMeow() {
    if (!state.soundOn) return;
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  function showMeowBubble(el) {
    const existing = el.querySelector('.meow-bubble');
    if (existing) existing.remove();
    const bubble = document.createElement('div');
    bubble.className = 'meow-bubble';
    bubble.textContent = 'meow';
    el.appendChild(bubble);
    setTimeout(() => bubble.remove(), 700);
  }

  function meowAt(el) {
    playMeow();
    showMeowBubble(el);
  }

  // PANEL SYSTEM
  const overlay = $('#panelOverlay');
  let activePanel = null;

  function openPanel(panel) {
    if (activePanel) closePanel();
    activePanel = panel;
    panel.classList.add('active');
    overlay.classList.add('active');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = panel.querySelector('.panel-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel() {
    if (!activePanel) return;
    activePanel.classList.remove('active');
    overlay.classList.remove('active');
    overlay.hidden = true;
    document.body.style.overflow = '';
    activePanel = null;
  }

  overlay.addEventListener('click', closePanel);
  $$('.panel-close').forEach(btn => btn.addEventListener('click', closePanel));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });

  // COMPUTER
  const computer = $('.computer');
  const monitorScreen = $('#monitorScreen');
  const monitorContent = $('#monitorContent');
  const desktopWindow = $('#desktopWindow');
  const windowTitle = $('#windowTitle');
  const windowBody = $('#windowBody');
  const windowClose = $('#windowClose');
  let computerOn = false;

  function toggleComputer() {
    computerOn = !computerOn;
    monitorScreen.classList.toggle('on', computerOn);
    monitorContent.hidden = !computerOn;
    if (computerOn) state.openedComputer = true;
    if (!computerOn) { desktopWindow.hidden = true; closePanel(); }
  }

  computer.addEventListener('click', e => {
    if (e.target.closest('.desktop-icon') || e.target.closest('.window-close') || e.target.closest('.desktop-window')) return;
    toggleComputer();
  });
  computer.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleComputer(); }
  });

  const windowContents = {
    creator: { title:'readme.txt', body:'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>' },
    contact: { title:'email.txt', body:'<p>info@superego.cafe</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' },
    secret:  { title:'????.txt', body:'<p>You found something strange.</p><p>Lorem ipsum dolor sit amet... but something is different here.</p><p style="color:#f44">The file appears to be corrupted.</p>' },
  };

  $$('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();
      const key = icon.dataset.open;
      const content = windowContents[key];
      if (!content) return;
      windowTitle.textContent = content.title;
      windowBody.innerHTML = content.body;
      desktopWindow.hidden = false;
      if (key === 'secret') state.foundSecret = true;
    });
  });

  windowClose.addEventListener('click', e => { e.stopPropagation(); desktopWindow.hidden = true; });

  // CORKBOARD
  const corkboard = $('[data-object="corkboard"]');
  const corkPanel = $('#corkboardPanel');
  corkboard.addEventListener('click', () => { state.openedCorkboard = true; openPanel(corkPanel); });
  corkboard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.openedCorkboard = true; openPanel(corkPanel); }});
  $('#corkPanelClose').addEventListener('click', closePanel);

  // DOOR
  const door = $('[data-object="door"]');
  const doorPanel = $('#doorPanel');
  door.addEventListener('click', () => { state.openedDoor = true; openPanel(doorPanel); });
  door.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.openedDoor = true; openPanel(doorPanel); }});
  $('#doorPanelClose').addEventListener('click', closePanel);

  // LAMP
  const lamp = $('[data-object="lamp"]');
  lamp.addEventListener('click', e => {
    e.stopPropagation();
    state.lampOn = !state.lampOn;
    lamp.classList.toggle('on', state.lampOn);
  });
  lamp.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      state.lampOn = !state.lampOn;
      lamp.classList.toggle('on', state.lampOn);
    }
  });

  // SHELF (books)
  const shelfPanel = $('#shelfPanel');
  const shelfBooks = $('[data-object="shelf-books"]');
  if (shelfBooks) {
    shelfBooks.addEventListener('click', e => { e.stopPropagation(); openPanel(shelfPanel); });
    shelfBooks.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(shelfPanel); }});
  }
  $('#shelfPanelClose').addEventListener('click', closePanel);

  // MEOW OBJECTS (things without on-click effects)
  const meowObjects = [
    '[data-object="window"]',
    '[data-object="chair"]',
    '[data-object="rug"]',
  ];
  meowObjects.forEach(sel => {
    const el = $(sel);
    if (!el) return;
    el.addEventListener('click', () => meowAt(el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); meowAt(el); }});
  });

  // HELP
  const helpOverlay = $('#helpOverlay');
  $('#helpToggle').addEventListener('click', () => { helpOverlay.hidden = false; $('#helpClose').focus(); });
  $('#helpClose').addEventListener('click', () => { helpOverlay.hidden = true; });

  // SOUND TOGGLE
  const soundBtn = $('#soundToggle');
  soundBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    soundBtn.style.opacity = state.soundOn ? '1' : '.5';
  });

  // KEYBOARD NAV
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !e.shiftKey) {
      const objects = $$('.obj');
      const focused = document.activeElement;
      const idx = objects.indexOf(focused);
      if (idx === -1 && !focused.closest('.panel') && focused !== document.body) {
        e.preventDefault();
        objects[0]?.focus();
      }
    }
  });

  if (reducedMotion) {
    $$('.dust-particle').forEach(p => p.style.animation = 'none');
  }
})();
