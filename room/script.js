(() => {
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══════ STATE ═══════
  const state = {
    visitedTV: false,
    openedComputer: false,
    openedCorkboard: false,
    openedDoor: false,
    lampOn: false,
    soundOn: false,
    foundSecret: false,
    characterViewed: {},
  };

  // ═══════ CHARACTER DATA ═══════
  const characters = {
    meep:   { name:'Meep',   img:'assets/characters/meep.svg',   role:'Character', desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    fish:   { name:'Fish',   img:'assets/characters/fish.svg',   role:'Character', desc:'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.' },
    '404':  { name:'404',    img:'assets/characters/404.svg',    role:'Character', desc:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.' },
    lady:   { name:'Lady',   img:'assets/characters/lady.svg',   role:'Character', desc:'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit. Sed quia non numquam eius modi tempora.' },
    ralph:  { name:'Ralph',  img:'assets/characters/ralph.svg',  role:'Character', desc:'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.' },
    gigi:   { name:'Gigi',   img:'assets/characters/gigi.svg',   role:'Character', desc:'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.' },
    leslie: { name:'Leslie', img:'assets/characters/leslie.svg', role:'Character', desc:'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.' },
    steev:  { name:'Steev',  img:'assets/characters/steev.svg',  role:'Character', desc:'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.' },
    daisy:  { name:'Daisy',  img:'assets/characters/daisy.svg',  role:'Character', desc:'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.' },
  };

  // ═══════ PANEL SYSTEM ═══════
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

  // ═══════ CHARACTER PANEL ═══════
  const charPanel = $('#characterPanel');
  const charPanelImg = $('#charPanelImg');
  const charPanelName = $('#charPanelName');
  const charPanelRole = $('#charPanelRole');
  const charPanelDesc = $('#charPanelDesc');

  function openCharacter(key) {
    const c = characters[key];
    if (!c) return;
    charPanelImg.innerHTML = `<img src="${c.img}" alt="${c.name}">`;
    charPanelName.textContent = c.name;
    charPanelRole.textContent = c.role;
    charPanelDesc.textContent = c.desc;
    state.characterViewed[key] = true;
    openPanel(charPanel);
  }

  // ═══════ TV ═══════
  const tv = $('#objTV');
  const tvScreen = $('#tvScreen');
  const tvPanel = $('#tvPanel');
  let tvOn = false;

  function toggleTV() {
    tvOn = !tvOn;
    tv.classList.toggle('on', tvOn);
    if (tvOn) {
      state.visitedTV = true;
      setTimeout(() => openPanel(tvPanel), 600);
    } else {
      closePanel();
    }
  }

  tv.addEventListener('click', toggleTV);
  tv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTV(); }});
  $('#tvPanelClose').addEventListener('click', () => { tvOn = false; tv.classList.remove('on'); closePanel(); });

  // ═══════ COMPUTER ═══════
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

  // Desktop icons
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

  // ═══════ CORKBOARD ═══════
  const corkboard = $('[data-object="corkboard"]');
  const corkPanel = $('#corkboardPanel');

  corkboard.addEventListener('click', () => { state.openedCorkboard = true; openPanel(corkPanel); });
  corkboard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.openedCorkboard = true; openPanel(corkPanel); }});
  $('#corkPanelClose').addEventListener('click', closePanel);

  // ═══════ DOOR ═══════
  const door = $('[data-object="door"]');
  const doorPanel = $('#doorPanel');

  door.addEventListener('click', () => { state.openedDoor = true; openPanel(doorPanel); });
  door.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.openedDoor = true; openPanel(doorPanel); }});
  $('#doorPanelClose').addEventListener('click', closePanel);

  // ═══════ POSTERS + POLAROIDS (Characters) ═══════
  $$('[data-character]').forEach(el => {
    el.addEventListener('click', () => openCharacter(el.dataset.character));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCharacter(el.dataset.character); }});
  });
  $('#charPanelClose').addEventListener('click', closePanel);

  // ═══════ SHELF ITEMS ═══════
  const shelfData = {
    'shelf-cd':   { title:'CD',    body:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    'shelf-book': { title:'Book',  body:'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    'shelf-toy':  { title:'Toy',   body:'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  };
  const shelfPanel = $('#shelfPanel');
  const shelfPanelTitle = $('#shelfPanelTitle');
  const shelfPanelDesc = $('#shelfPanelDesc');

  $$('.shelf-item').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const data = shelfData[el.dataset.object];
      if (!data) return;
      shelfPanelTitle.textContent = data.title;
      shelfPanelDesc.textContent = data.body;
      openPanel(shelfPanel);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const data = shelfData[el.dataset.object];
        if (!data) return;
        shelfPanelTitle.textContent = data.title;
        shelfPanelDesc.textContent = data.body;
        openPanel(shelfPanel);
      }
    });
  });
  $('#shelfPanelClose').addEventListener('click', closePanel);

  // ═══════ LAMP ═══════
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

  // ═══════ WINDOW (ambient, no panel) ═══════
  const windowObj = $('[data-object="window"]');
  windowObj.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
  });

  // ═══════ CREATOR FRAME ═══════
  const creatorFrame = $('[data-object="creator"]');
  creatorFrame.addEventListener('click', () => {
    const c = characters.meep; // placeholder
    windowTitle.textContent = 'about.txt';
    windowBody.innerHTML = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>';
    if (computerOn) {
      desktopWindow.hidden = false;
    }
  });
  creatorFrame.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      creatorFrame.click();
    }
  });

  // ═══════ HELP ═══════
  const helpOverlay = $('#helpOverlay');
  $('#helpToggle').addEventListener('click', () => { helpOverlay.hidden = false; $('#helpClose').focus(); });
  $('#helpClose').addEventListener('click', () => { helpOverlay.hidden = true; });

  // ═══════ SOUND TOGGLE (infrastructure) ═══════
  const soundBtn = $('#soundToggle');
  soundBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    soundBtn.textContent = state.soundOn ? '♪' : '♪';
    soundBtn.style.opacity = state.soundOn ? '1' : '.5';
    // Sound system ready for future implementation
  });

  // ═══════ KEYBOARD NAV ═══════
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

  // ═══════ INITIAL STATE ═══════
  if (reducedMotion) {
    $$('.dust-particle').forEach(p => p.style.animation = 'none');
  }
})();
