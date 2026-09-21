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

  // MEOW SOUND - realistic cat meow synthesis
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

      // Main meow oscillator - pitch sweep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.linearRampToValueAtTime(1200, now + 0.05);
      osc1.frequency.linearRampToValueAtTime(600, now + 0.15);
      osc1.frequency.linearRampToValueAtTime(900, now + 0.25);
      osc1.frequency.linearRampToValueAtTime(400, now + 0.4);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.25);
      gain1.gain.linearRampToValueAtTime(0.01, now + 0.45);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Second harmonic for body
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.linearRampToValueAtTime(900, now + 0.05);
      osc2.frequency.linearRampToValueAtTime(450, now + 0.15);
      osc2.frequency.linearRampToValueAtTime(700, now + 0.25);
      osc2.frequency.linearRampToValueAtTime(300, now + 0.4);
      gain2.gain.setValueAtTime(0.1, now);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.25);
      gain2.gain.linearRampToValueAtTime(0.01, now + 0.45);
      osc2.start(now);
      osc2.stop(now + 0.45);

      // Noise for breathiness
      const bufferSize = ctx.sampleRate * 0.45;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.03;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.05, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      noise.start(now);
      noise.stop(now + 0.45);
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

  // CHARACTER PANEL
  const charPanel = $('#characterPanel');
  const charPanelImg = $('#charPanelImg');
  const charPanelName = $('#charPanelName');
  const charPanelRole = $('#charPanelRole');
  const charPanelDesc = $('#charPanelDesc');
  const characters = {
    meep:   { name:'Meep',   img:'assets/characters/meep.svg',   role:'Character' },
    fish:   { name:'Fish',   img:'assets/characters/fish.svg',   role:'Character' },
    '404':  { name:'404',    img:'assets/characters/404.svg',    role:'Character' },
    lady:   { name:'Lady',   img:'assets/characters/lady.svg',   role:'Character' },
    ralph:  { name:'Ralph',  img:'assets/characters/ralph.svg',  role:'Character' },
    gigi:   { name:'Gigi',   img:'assets/characters/gigi.svg',   role:'Character' },
    leslie: { name:'Leslie', img:'assets/characters/leslie.svg', role:'Character' },
    steev:  { name:'Steev',  img:'assets/characters/steev.svg',  role:'Character' },
    daisy:  { name:'Daisy',  img:'assets/characters/daisy.svg',  role:'Character' },
  };

  function openCharacter(key) {
    const c = characters[key];
    if (!c) return;
    charPanelImg.innerHTML = '<img src="' + c.img + '" alt="' + c.name + '">';
    charPanelName.textContent = c.name;
    charPanelRole.textContent = c.role;
    charPanelDesc.textContent = 'meow';
    openPanel(charPanel);
  }
  $('#charPanelClose').addEventListener('click', closePanel);

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

  windowClose.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    desktopWindow.hidden = true;
  });

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

  // BOOKS (individually clickable)
  $$('.book[data-character]').forEach(book => {
    book.addEventListener('click', e => {
      e.stopPropagation();
      openCharacter(book.dataset.character);
    });
    book.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCharacter(book.dataset.character);
      }
    });
  });

  // MEOW OBJECTS
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
