(() => {
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  // MEOW SOUND
  let audioCtx = null;
  let soundOn = true;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playMeow() {
    if (!soundOn) return;
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
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
    } catch (e) {}
  }

  function showMeowBubble(el) {
    const existing = el.querySelector('.meow-bubble');
    if (existing) existing.remove();
    const bubble = document.createElement('div');
    bubble.className = 'meow-bubble';
    bubble.textContent = 'meow';
    el.style.position = el.style.position || 'relative';
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // CHARACTER PANEL
  const charPanel = $('#characterPanel');
  const charPanelImg = $('#charPanelImg');
  const charPanelName = $('#charPanelName');
  const charPanelRole = $('#charPanelRole');
  const charPanelDesc = $('#charPanelDesc');
  const characters = {
    meep:   { name:'Meep',   img:'assets/characters/meep.svg' },
    fish:   { name:'Fish',   img:'assets/characters/fish.svg' },
    '404':  { name:'404',    img:'assets/characters/404.svg' },
    lady:   { name:'Lady',   img:'assets/characters/lady.svg' },
    ralph:  { name:'Ralph',  img:'assets/characters/ralph.svg' },
    gigi:   { name:'Gigi',   img:'assets/characters/gigi.svg' },
    leslie: { name:'Leslie', img:'assets/characters/leslie.svg' },
    steev:  { name:'Steev',  img:'assets/characters/steev.svg' },
    daisy:  { name:'Daisy',  img:'assets/characters/daisy.svg' },
  };

  function openCharacter(key) {
    const c = characters[key];
    if (!c) return;
    charPanelImg.innerHTML = '<img src="' + c.img + '" alt="' + c.name + '">';
    charPanelName.textContent = c.name;
    charPanelRole.textContent = 'Character';
    charPanelDesc.textContent = 'meow';
    openPanel(charPanel);
  }
  $('#charPanelClose').addEventListener('click', closePanel);

  // BOOKS (individually clickable)
  $$('.book[data-character]').forEach(book => {
    const handler = (e) => {
      e.stopPropagation();
      openCharacter(book.dataset.character);
    };
    book.addEventListener('click', handler);
    book.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
    });
  });

  // COMPUTER
  const computer = $("[data-object='computer']");
  const monitorScreen = $('#monitorScreen');
  const monitorContent = $('#monitorContent');
  const desktopWindow = $('#desktopWindow');
  const windowTitle = $('#windowTitle');
  const windowBody = $('#windowBody');
  const windowCloseBtn = $('#windowClose');
  let computerOn = false;

  function toggleComputer() {
    computerOn = !computerOn;
    monitorScreen.classList.toggle('on', computerOn);
    monitorContent.hidden = !computerOn;
    if (!computerOn) {
      desktopWindow.hidden = true;
    }
  }

  computer.addEventListener('click', e => {
    if (e.target.closest('.window-close')) {
      e.stopPropagation();
      desktopWindow.hidden = true;
      return;
    }
    if (e.target.closest('.desktop-icon')) return;
    if (e.target.closest('.desktop-window')) return;
    toggleComputer();
  });

  const fileContents = {
    meow:   { title: 'meow.txt',   body: '<p>meow</p>' },
    hi:     { title: 'hi.txt',     body: '<p>meow</p>' },
    secret: { title: 'supersecret.txt', body: '<p>meep is secretly evil</p>' },
  };

  $$('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();
      const key = icon.dataset.open;
      const content = fileContents[key];
      if (!content) return;
      windowTitle.textContent = content.title;
      windowBody.innerHTML = content.body;
      desktopWindow.hidden = false;
    });
  });

  windowCloseBtn.addEventListener('click', e => {
    e.stopPropagation();
    desktopWindow.hidden = true;
  });

  // CORKBOARD
  const corkboard = $("[data-object='corkboard']");
  const corkPanel = $('#corkboardPanel');
  corkboard.addEventListener('click', () => openPanel(corkPanel));
  corkboard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(corkPanel); }});
  $('#corkPanelClose').addEventListener('click', closePanel);

  // DOOR - goes to main website
  const door = $("[data-object='door']");
  door.addEventListener('click', () => { window.location.href = '../'; });
  door.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = '../'; }});

  // LAMP
  const lamp = $("[data-object='lamp']");
  let lampOn = false;
  lamp.addEventListener('click', e => {
    e.stopPropagation();
    lampOn = !lampOn;
    lamp.classList.toggle('on', lampOn);
  });
  lamp.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      lampOn = !lampOn;
      lamp.classList.toggle('on', lampOn);
    }
  });

  // MEOW OBJECTS
  $$('.chair, .rug, .window').forEach(el => {
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
    soundOn = !soundOn;
    soundBtn.style.opacity = soundOn ? '1' : '.5';
  });
})();
