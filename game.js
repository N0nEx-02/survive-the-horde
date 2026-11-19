const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // crisp pixel art

    // UI Elements
    const hpFill = document.getElementById('hp-fill');
    const hpLabel = document.getElementById('hp-label');
    const lvlLabel = document.getElementById('lvl-label');
    const xpFill = document.getElementById('xp-fill');
    const timerEl = document.getElementById('timer');
    const bossCountdownEl = document.getElementById('boss-countdown');
    const killsLabel = document.getElementById('kills-label');
    const weaponBar = document.getElementById('weapon-bar');
    const sfxBtn = document.getElementById('sfx-btn');

    const charModal = document.getElementById('char-modal');
    const charGrid = document.getElementById('char-grid');
    const levelupModal = document.getElementById('levelup-modal');
    const draftGrid = document.getElementById('draft-grid');
    const chestModal = document.getElementById('chest-modal');
    const rouletteItemEl = document.getElementById('roulette-item');
    const rouletteDescEl = document.getElementById('roulette-desc');
    const claimChestBtn = document.getElementById('claim-chest-btn');
    const gameoverModal = document.getElementById('gameover-modal');
    const gameoverStats = document.getElementById('gameover-stats');
    const restartBtn = document.getElementById('restart-btn');
    const gameoverTitleBtn = document.getElementById('gameover-title-btn');
    const nameModal = document.getElementById('name-modal');
    const nameInput = document.getElementById('name-input');
    const nameError = document.getElementById('name-error');
    const nameStartBtn = document.getElementById('name-start-btn');
    const quickPlayBtn = document.getElementById('quick-play-btn');
    const castRow = document.getElementById('cast-row');
    const changeNameBtn = document.getElementById('change-name-btn');
    const charTitleBtn = document.getElementById('char-title-btn');
    const charPlayerName = document.getElementById('char-player-name');
    const charModeSubtitle = document.getElementById('char-mode-subtitle');
    const playerChip = document.getElementById('player-chip');
    const myBtn = document.getElementById('my-btn');
    const gameoverSave = document.getElementById('gameover-save');
    const gameoverScoresBtn = document.getElementById('gameover-scores-btn');
    const scoresModal = document.getElementById('scores-modal');
    const scoreSortRow = document.getElementById('score-sort-row');
    const scoreSummary = document.getElementById('score-summary');
    const scoreTableWrap = document.getElementById('score-table-wrap');
    const scoreStatus = document.getElementById('score-status');
    const scoresCloseBtn = document.getElementById('scores-close-btn');
    const skillsBtn = document.getElementById('skills-btn');
    const nameSkillsBtn = document.getElementById('name-skills-btn');
    const charSkillsBtn = document.getElementById('char-skills-btn');
    const skillGuideModal = document.getElementById('skill-guide-modal');
    const skillGuideContent = document.getElementById('skill-guide-content');
    const skillGuideCloseBtn = document.getElementById('skill-guide-close-btn');
    const backgroundMusic = document.getElementById('background-music');
    const musicVolumeSlider = document.getElementById('music-volume');

    // Web Audio API Retro Synthesizer
    const RetroSynth = {
      ctx: null,
      enabled: true,
      comboPitch: 0,
      lastGemTime: 0,
      init() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      },
      tone(freq, type, duration, vol = 0.08, slideTo = null) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
        }
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      },
      shootWand() { this.tone(520, 'triangle', 0.08, 0.05, 260); },
      shootLightning() { this.tone(880, 'sawtooth', 0.1, 0.04, 190); },
      gemPickup() {
        const now = performance.now();
        if (now - this.lastGemTime < 450) {
          this.comboPitch = Math.min(this.comboPitch + 35, 420);
        } else {
          this.comboPitch = 0;
        }
        this.lastGemTime = now;
        this.tone(440 + this.comboPitch, 'sine', 0.07, 0.05, 660 + this.comboPitch);
      },
      hitEnemy() { this.tone(150, 'square', 0.04, 0.03, 90); },
      playerHurt() { this.tone(180, 'sawtooth', 0.22, 0.1, 55); },
      shieldBlock() { this.tone(760, 'triangle', 0.18, 0.08, 420); },
      shieldReady() { this.tone(560, 'sine', 0.16, 0.06, 880); },
      bossWarning() {
        this.tone(110, 'sawtooth', 0.25, 0.1, 95);
        setTimeout(() => this.tone(95, 'sawtooth', 0.35, 0.1, 75), 220);
      },
      bossShockwave() {
        this.tone(130, 'sawtooth', 0.35, 0.11, 42);
      },
      bossDash() {
        this.tone(300, 'square', 0.18, 0.09, 110);
      },
      bossRock() { this.tone(90, 'square', 0.25, 0.12, 40); },
      bossVoid() { this.tone(520, 'sine', 0.3, 0.07, 160); },
      bossBlink() { this.tone(900, 'triangle', 0.15, 0.07, 1500); },
      bossFire() { this.tone(210, 'sawtooth', 0.4, 0.07, 120); },
      bossBone() { this.tone(700, 'square', 0.05, 0.03, 500); },
      bossSummon() { this.tone(240, 'sawtooth', 0.3, 0.08, 420); },
      levelUp() {
        [523, 659, 784, 1046].forEach((f, idx) => {
          setTimeout(() => this.tone(f, 'triangle', 0.14, 0.08), idx * 75);
        });
      },
      evolution() {
        [440, 554, 659, 880, 1108, 1318].forEach((f, idx) => {
          setTimeout(() => this.tone(f, 'sawtooth', 0.18, 0.08), idx * 70);
        });
      },
      rouletteTick(step) {
        this.tone(360 + (step % 5) * 60, 'square', 0.04, 0.05);
      }
    };

    sfxBtn.addEventListener('click', () => {
      RetroSynth.enabled = !RetroSynth.enabled;
      sfxBtn.textContent = `SFX: ${RetroSynth.enabled ? 'ON' : 'OFF'}`;
    });

    function playBackgroundMusic() {
      const playAttempt = backgroundMusic.play();
      if (playAttempt) {
        playAttempt.catch((error) => console.warn('Could not play background music.', error));
      }
    }

    // =====================================================================
    // PIXEL SPRITES  (drawn from character maps, no image files needed)
    // Each letter is a palette colour, "." is transparent. A 1px dark
    // outline is added automatically around every sprite.
    // =====================================================================
    // ==SPRITE-DATA-START==
    const HUMAN_LEGS = [
      ['....LLL..LLL....', '....LLL..LLL....', '...BBBB..BBBB...'],
      ['....LLL...LLL...', '...LLL.....LLL..', '..BBBB.....BBBB.']
    ];

    const PLAYER_SPRITES = {
      // Lyra the Arcanist - female sorceress with purple hat, auburn curls & ruby-magenta gown
      lyra: {
        pal: { V: '#4a0e68', v: '#7e22ce', P: '#a855f7', G: '#fbbf24', H: '#f97316', h: '#ea580c', S: '#fed7aa', E: '#3b0764', R: '#be185d', M: '#86198f', m: '#581c87', L: '#581c87', B: '#2e0842' },
        body: [
          '.......v........',
          '......vv........',
          '.....vvvv.......',
          '....vvvvvv......',
          '....vGGGGv......',
          '..VVVVVVVVVVVV..',
          '..H.SSSSSSSS.H..',
          '..H.SESSSSES.H..',
          '..h.SSSSSSSS.h..',
          '...hRRRRRRRRh...',
          '...RRMGGGMMR....',
          '..MMMMMMMMMMMM..',
          '..mmmmmmmmmmmm..'
        ]
      },
      // Kael the Blademaster - scarlet plume, winged golden crest, gleaming steel knight armor & glowing spirit blade
      kael: {
        pal: { P: '#ef476f', p: '#9f1239', G: '#fbbf24', g: '#d97706', M: '#e2e8f0', m: '#94a3b8', D: '#475569', S: '#fed7aa', E: '#0f172a', C: '#dc2626', c: '#7f1d1d', W: '#38bdf8', w: '#ffffff', L: '#64748b', B: '#1e293b' },
        body: [
          '.......PP.......',
          '......PPPP......',
          '.....GGGGGG.....',
          '....GMMMMMMG....',
          '...GGMMSSMMGG...',
          '...GGMESSEMG....',
          '....GMMMMMMG....',
          '...CGGMMMMGGc...',
          '..CCMMGMMGMMCcw.',
          '..CCmMMGGMMmCcW.',
          '..CcMMDDDDMMCcW.',
          '...cMMMMMMMMc.W.',
          '....GGGGGGGG....'
        ]
      },
      // Ignis the Warden - volcanic magma armor, obsidian curved horns, flame crown & molten core
      ignis: {
        pal: { F: '#f59e0b', f: '#ef476f', Y: '#fde047', H: '#262626', h: '#404040', O: '#f97316', o: '#c2410c', R: '#991b1b', r: '#450a0a', S: '#fed7aa', E: '#fef08a', L: '#7f1d1d', B: '#1c1917' },
        body: [
          '.F.H........H.F.',
          'FFHH........HHFF',
          '.FHHHHFFFFHHHH.F',
          '...hHHYYYYYHHh..',
          '...hHHRRRRRHHh..',
          '....hREESSEERh..',
          '....HRRRRRRRH...',
          '..FFFRRRRRRRRFFF',
          '.FFROOOOOOOORFF.',
          '.fFRRoYYYYoRRfF.',
          '..fRRoOOOOoRRf..',
          '...rRRRRRRRRr...',
          '...YYYYYYYYYY...'
        ]
      },
      // Vespera the Tempest - male archmage with midnight indigo hat, flowing silver beard & royal blue robes
      vespera: {
        pal: { H: '#1e1b4b', h: '#312e81', I: '#4338ca', G: '#fbbf24', S: '#fed7aa', E: '#0f172a', W: '#f8fafc', w: '#cbd5e1', R: '#1d4ed8', r: '#172554', L: '#1e40af', B: '#1e293b' },
        body: [
          '.......I........',
          '......hI........',
          '.....hhII.......',
          '....hHHhII......',
          '...hHGGGGHh.....',
          '.HHHHHHHHHHHHHH.',
          '....SSSSSSSS....',
          '....SESSSSES....',
          '...wWWWWWWWWw...',
          '..RRwWWWWWWwRR..',
          '..RRrWWGWWrrRR..',
          '..RRRRwWWwRRRR..',
          '..rrrrrrrrrrrr..'
        ]
      }
    };

    // Grunt - snarling red imp (2 walk frames)
    const GRUNT = {
      pal: { R: '#e63946', r: '#a01d2c', Y: '#ffe66d', K: '#2b0a10', W: '#ffffff' },
      frames: [
        [
          '..R..........R..',
          '..RR........RR..',
          '...RRRRRRRRRR...',
          '..RRRRRRRRRRRR..',
          '..RRYYRRRRYYRR..',
          '..RRYKRRRRKYRR..',
          '..RRRRRRRRRRRR..',
          '..RrRRRRRRRRrR..',
          '..RRKKKKKKKKRR..',
          '..RRKWKWKWKWRR..',
          '..RRRRRRRRRRRR..',
          '...rRRRRRRRRr...',
          '...rrRRRRRRrr...',
          '...RRR....RRR...',
          '...RRR....RRR...',
          '..KKKK....KKKK..'
        ],
        [
          '..R..........R..',
          '..RR........RR..',
          '...RRRRRRRRRR...',
          '..RRRRRRRRRRRR..',
          '..RRYYRRRRYYRR..',
          '..RRYKRRRRKYRR..',
          '..RRRRRRRRRRRR..',
          '..RrRRRRRRRRrR..',
          '..RRKKKKKKKKRR..',
          '..RRKWKWKWKWRR..',
          '..RRRRRRRRRRRR..',
          '...rRRRRRRRRr...',
          '...rrRRRRRRrr...',
          '....RRR..RRR....',
          '....RRR..RRR....',
          '...KKKK..KKKK...'
        ]
      ]
    };

    // Bat - fast pink flyer (wings up / wings down)
    const BAT = {
      pal: { P: '#f15bb5', p: '#b0287e', Y: '#ffe66d', K: '#2b0a1f', W: '#ffffff' },
      frames: [
        [
          'P...P..P...P',
          'PP..PPPP..PP',
          'PPp.YPPY.pPP',
          'PPPPPPPPPPPP',
          '.PpPPKKPPpP.',
          '..PpPWWPpP..',
          '...PPPPPP...',
          '....pPPp....'
        ],
        [
          '............',
          '....P..P....',
          '....PPPP....',
          '.P..YPPY..P.',
          'PPPPPKKPPPPP',
          'PPpPPWWPPpPP',
          '.PP.PPPP.PP.',
          '..P..pp..P..'
        ]
      ]
    };

    // Brute - hulking purple ogre with tusks
    const BRUTE = {
      pal: { U: '#9b5de5', u: '#6a3aa8', L: '#c9a0ff', Y: '#ffd166', K: '#2b0a10', W: '#ffffff', B: '#3d1f66' },
      body: [
        '......UUUUUU......',
        '....UUUUUUUUUU....',
        '...UUUUUUUUUUUU...',
        '...UUYYUUUUYYUU...',
        '...UUYKUUUUKYUU...',
        '...UUUUUUUUUUUU...',
        '...uUUUWUUWUUUu...',
        '...uUUKKKKKKUUu...',
        '..UUUUUUUUUUUUUU..',
        '.UUUuUUUUUUUUuUUU.',
        '.UUuuUULLLLUUuuUU.',
        '.UUuuUULLLLUUuuUU.',
        '.UUuUUUUUUUUUUuUU.',
        '..UUUUUUUUUUUUUU..',
        '..BBBBBBBBBBBBBB..'
      ],
      legs: [
        ['..UUUUU....UUUUU..', '..UUUUU....UUUUU..', '.BBBBBB....BBBBBB.'],
        ['...UUUUU..UUUUU...', '...UUUUU..UUUUU...', '..BBBBBB..BBBBBB..']
      ]
    };

    // Occultist - hooded void sorcerer that keeps distance and shoots projectiles (appears after 3m)
    const OCCULTIST = {
      pal: {
        K: '#120d1e',
        k: '#2c1845',
        V: '#5b21b6',
        v: '#7c3aed',
        G: '#06d6a0',
        g: '#4cc9f0',
        S: '#78350f',
        W: '#f8fafc',
        L: '#3b0764',
        B: '#170b24'
      },
      frames: [
        [
          '......kKKk......',
          '.....kKKKKk.....',
          '....kKKKKKKk....',
          '....kKGKKGKk....',
          '....kKGGGGKk....',
          '....kKKKKKKk....',
          '..vv.kKKKKk.vv..',
          '.vvvvVVVVVVvvvv.',
          'S.vvVVVvvVVVvv.S',
          'S..vVVVvvVVVv..S',
          'S..VVVVVVVVVV..S',
          'S..VVVVGGVVVV..S',
          '...VVVVGGVVVV...',
          '...LLLL..LLLL...',
          '...LLLL..LLLL...',
          '..BBBBB..BBBBB..'
        ],
        [
          '......kKKk......',
          '.....kKKKKk.....',
          '....kKKKKKKk....',
          '....kKgKKgKk....',
          '....kKggggKk....',
          '....kKKKKKKk....',
          '..vv.kKKKKk.vv..',
          '.vvvvVVVVVVvvvv.',
          'S.vvVVVvvVVVvv.S',
          'S..vVVVvvVVVv..S',
          'W..VVVVVVVVVV..W',
          'W..VVVVggVVVV..W',
          '...VVVVggVVVV...',
          '....LLLL.LLLL...',
          '....LLLL.LLLL...',
          '...BBBBB.BBBBB..'
        ]
      ]
    };

    // Prism Warden - circles the player and fires a three-shot spread
    const PRISM_WARDEN = {
      pal: { K: '#171326', k: '#35234f', P: '#8b5cf6', p: '#5b21b6', C: '#00e5ff', G: '#ffd166', B: '#20243a', W: '#f8fafc' },
      frames: [
        [
          '.......kk.......',
          '......kPPk......',
          '.....kPPPPk.....',
          '.....kPGPPk.....',
          '.....kPCCPk.....',
          '......kPPk......',
          '....PPPPPPPP....',
          '...PPPPPPPPPP...',
          '..PPPPPPPPPPPP..',
          '..PPPPCCCCPPPP..',
          '..PPPPCCGGPPPP..',
          '.PPPPPPPPPPPPPP.',
          'PPPPPPPPPPPPPPPP',
          '..PPPPP..PPPPP..',
          '...BBBB..BBBB...',
          '..BBBBB..BBBBB..'
        ],
        [
          '.......kk.......',
          '......kPPk......',
          '.....kPPPPk.....',
          '.....kPGPPk.....',
          '.....kPGCPk.....',
          '......kPPk......',
          '....PPPPPPPP....',
          '...PPPPPPPPPP...',
          '..PPPPPPPPPPPP..',
          '..PPPPCCGGPPPP..',
          '..PPPPCCCCPPPP..',
          '.PPPPPPPPPPPPPP.',
          'PPPPPPPPPPPPPPPP',
          '..PPPPP..PPPPP..',
          '..BBBBB..BBBBB..',
          '...BBBB..BBBB...'
        ]
      ]
    };

    // ---- Boss roster sprites (LEFT half only, mirrored automatically) ----
    const BOSS_SPRITES = [
      // 0  Malakor the Dread - demon king
      {
        pal: { C: '#ff2a5f', c: '#a3123a', L: '#ff8fa3', G: '#ffd166', g: '#c9a227', Y: '#fff3b0', K: '#1a0610', W: '#ffffff' },
        half: [
          '.G..........',
          '.GG.........',
          '.GGG...G.G.G',
          '.GGGCCGGGGGG',
          '..GCCCCCCCCC',
          '..CCCCCCCCCC',
          '..CCccccccCC',
          '..CCCYYYYCCC',
          '..CCCCYYYCCC',
          '..CCCCCCCCCC',
          '..CcCCCCCCCC',
          '..CCKKKKKKKK',
          '..CCKWKWKWKW',
          '...CCKKKKKKK',
          '....CCCCCCCC',
          '.GGGGGCCCCCC',
          '.GGgGCCCCCCC',
          '.CCCCCCCCLLL',
          '.CCcCCCCCLLL',
          '.CCcCCCCCCLL',
          '..GGGGGGGGGG',
          '..CCCCCCCCCC',
          '...CCCCCC...',
          '..GGGGGGG...'
        ]
      },
      // 1  Vorgath Ironhide - stone golem with a lava core
      {
        pal: { S: '#8c919c', s: '#575c68', L: '#bcc1cc', M: '#5f8f5a', Y: '#ffb703', C: '#ff7b00' },
        half: [
          '............',
          '....SSSSSSSS',
          '...SSLLLLLLL',
          '...SLLLLLLLL',
          '...SSYYSSSSS',
          '...SSYYSSSSS',
          '...SSSSSSSSS',
          '...SSsSsSsSs',
          '....SSSSSSSS',
          '.SSSSSSSSSSS',
          'SSLLLSSSSSSS',
          'SLLLLLSSMSSS',
          'SLLLLsSSSSSC',
          'SSSSS.SSSSCC',
          'SSsSS.SSSSCC',
          'SSSSS.SSSSSC',
          'SsSSS.SSSSSS',
          'SSSSS.SSSSSS',
          'LLLLL.SSSSSS',
          'LLLLLL.SSSSS',
          'LLLLLL.sssss',
          '.LLLL..sssss',
          '......SSSS..',
          '.....SSSSS..'
        ]
      },
      // 2  Xylar Voidweaver - floating eye with tentacles
      {
        pal: { P: '#7b2cbf', L: '#c77dff', W: '#f1f1ff', I: '#00e5ff', K: '#0b0020', G: '#5a189a' },
        half: [
          '............',
          '.......PPPPP',
          '.....PPLLLLL',
          '....PLLWWWWW',
          '...PLWWWWWWW',
          '..PPWWWWIIII',
          '..PWWWWIIIKK',
          '..PWWWWIIIKK',
          '..PWWWWIIIKK',
          '..PPWWWWIIII',
          '...PLWWWWWWW',
          '....PLLWWWWW',
          '.....PPLLLLL',
          '.......PPPPP',
          '...GG.GG.GG.',
          '...GG.GG.GG.',
          '..GG.GG.GG..',
          '..GG.GG.GG..',
          '...GG.GG.GG.',
          '...GG.GG.GG.',
          '..GG.GG.GG..',
          '..G..G..G...',
          '..G..G..G...',
          '............'
        ]
      },
      // 3  Nyxara the Brood Mother - spider queen (top-down)
      {
        pal: { B: '#3a2350', b: '#1a0b2a', p: '#5b3a7d', L: '#7a4a9a', T: '#b07ad8', Y: '#ff2a5f', F: '#ffffff', R: '#ff2a5f' },
        half: [
      '............',
      '............',
      '.........BBB',
      '...T....BBBB',
      '..LLL...BYBY',
      '..L.L...BBYB',
      '.LL.LL..BFbb',
      '.L...LL..bbb',
      'LL....L..bBB',
      'LTL...LLbBBB',
      '.LLLL..bBpBB',
      '.L.LLLLbBpBB',
      '.L...LbBBpBR',
      'LL....bBBBRR',
      'L....LbBBBBR',
      'L..LLLbBBBBR',
      'LTLLL.bBBBRR',
      '.LL...bBBBRR',
      '.L....bBBBBR',
      '.L...LLbBBBB',
      '.L..LL.bBBBB',
      '.L.TL...bBBB',
      '.L.L......bB',
      '...L........'
        ]
      },
      // 4  Mordrek the Bone King - crowned skeletal lich
      {
        pal: { W: '#e8e4d0', K: '#14101a', G: '#ffd166', Q: '#ff2a5f', E: '#7cffb2', R: '#4a2d6b', r: '#2d1a45' },
        half: [
          '.....G..G..G',
          '.....GGGGGGG',
          '.....GGGGGQG',
          '....WWWWWWWW',
          '...WWWWWWWWW',
          '...WKKKWWWWW',
          '...WKEKWWWWW',
          '...WKKKWWWWW',
          '....WWWWWWWK',
          '....WKWKWKWK',
          '.....WWWWWWW',
          '..RRRRRRRWWW',
          '.RRRRRRRWWWW',
          '.RRrRRRRWKKK',
          '.RRRRRRRWWWW',
          '.RRrRRRRWKKK',
          '.RRRRRRRWWWW',
          '..RRRRRRRWKK',
          '..RrRRRRRRWW',
          '..RRRRRRRRRR',
          '..RRrRRRRRRR',
          '..RRRRRRRRRR',
          '..RrRRrRRrRR',
          '..R.RR.RR.RR'
        ]
      },
      // 5  Abyssal Sovereign - sea dragon
      {
        pal: { D: '#1d3557', d: '#0b1a2e', L: '#457b9d', T: '#2ec4b6', G: '#ffd166', Y: '#ff2a5f', K: '#050a12', W: '#e8f1ff', F: '#ff9f1c' },
        half: [
          '..G.........',
          '..GG........',
          '...GG..DDDDD',
          '...GGGDDLLLL',
          '..TGGDDDDDDD',
          '.TTTDDDDLLLL',
          '.TLTYYDDDDDD',
          '.TLLTDYYDDDD',
          '.TLLTDDDDKDD',
          '..TLTDDDDDDD',
          '...TDDDDDDDD',
          '...DDWDWDWDW',
          '...DKKKKKKFF',
          '...DKKKKKFFF',
          '...DKKKKKFFF',
          '...DDWDWDWDW',
          '....DDDDDDDD',
          '....DDDDDDDD',
          '...DDDDLLLLL',
          '..DDDDLLLLLL',
          '..DDDDLdLLLL',
          '..DDDDLLLLLL',
          '..DDDDdLdLdL',
          '..dddddddddd'
        ]
      },
      // 6  Eclipsara the Starless - crowned cosmic sorceress
      {
        pal: { P: '#6b2fb5', p: '#32105f', G: '#ffd166', W: '#f1e9ff', K: '#0c0718' },
        half: [
          '......G.....',
          '.....GGG....',
          '....GPGG....',
          '...GPPPPG...',
          '..GPPPPPPG..',
          '.PPPPWWWWWWG',
          'PPWWWWWWWWGG',
          'PPWWWWGGGGGG',
          '.PPPPWWWWWWW',
          '..PPKKKKKKKK',
          '...PPKWKWKWK',
          '...PPKKKKKKK',
          '....PPPPPPPP',
          '...PPPPPPPPP',
          '..PPPPPPPPPP',
          '.PPPPPPPPPPP',
          'PPPPPPPPPPPP',
          'PPpPPPPPPPPP',
          'PPPPPPPPPPPP',
          'PP..PP..PP..',
          '..PP....PP..',
          '...PP...PP..',
          '....PP..PP..',
          '.....PPPP...'
        ]
      },
      // 7  Gravenox the Cinder Titan - molten stone juggernaut
      {
        pal: { S: '#8c919c', s: '#575c68', L: '#bcc1cc', O: '#ff7b00', Y: '#ffb703', K: '#1a1010', G: '#ffd166' },
        half: [
          '............',
          '....GGGG....',
          '...GSSSSGG..',
          '..GSSLLLLSGG',
          '.SSSLLLLLLSS',
          'SSLLYYLLYYSS',
          'SSLLYYLLYYSS',
          'SSLLLLLLLLSS',
          '.SSSSSSSSSS.',
          '..SSsssssS..',
          '.SSSSSSSSSS.',
          'SSLLLLLLLLLL',
          'SLLLSSSSSSSS',
          'SLLLLSSSSSSO',
          'SSsSS.SSSSOO',
          'SSSSS.SSSSSO',
          'SSsSS.SSSSSS',
          'SSSSSSSSSSSS',
          'LLLLLSSSSSSS',
          'LLLLLLSSSSSS',
          '.LLLL.SSSSSS',
          '..SSS..SSSS.',
          '..SSS..SSSS.',
          '.SSSS..SSSS.'
        ]
      },
      // 8  Zephyra the Storm Sovereign - winged lightning monarch
      {
        pal: { B: '#2b4c7e', b: '#132644', C: '#00e5ff', T: '#2ec4b6', W: '#e8f1ff', G: '#ffd166', P: '#9b5de5' },
        half: [
          '............',
          '....GGGG....',
          '...GCCCCG...',
          '..CCBBBBCC..',
          '.CBWWWWWWBC.',
          'CBWWWWWWWWBC',
          'CBWWCCWWWWBC',
          'CBWWWWWWWWBC',
          '.CBWWWWWWBC.',
          '..CCBBBBCC..',
          '...CCTTCC...',
          '..CCTTTTCC..',
          '.CCCTTTTTCC.',
          'CCCTTGGTTTCC',
          'CCCTGGGGTTCC',
          '.CCTTTTTTCC.',
          '..CCTTTTCC..',
          '...CCPPCC...',
          '..CCPPPPCC..',
          '.CCPPPPPPCC.',
          'CCPPPPPPPPCC',
          '..PP..PP....',
          '.PP....PP...',
          'PP......PP..'
        ]
      },
      // 9  Rimefang the Glacial Wyrm - armored frost dragon
      {
        pal: { I: '#5a8dee', i: '#274690', W: '#f8fbff', C: '#00e5ff', B: '#14213d', K: '#0a1736', G: '#ffd166' },
        half: [
          '......GG....',
          '.....GGGG...',
          '....IIIII...',
          '...IIWWWWW..',
          '..IIWWWWWW..',
          '.IIWWWWWWWW.',
          'IIWWWWWWWWWW',
          'IIWWCCWWWWWW',
          'IIWWWWWWWWWW',
          '.IIIIWWWWWWW',
          '..IIIKKKKKKK',
          '..IIKKWKWKWK',
          '..IIKKKKKKKK',
          '....IIIIIIII',
          '...IIIIIIIII',
          '..IIIIIIIIII',
          '.IIIIIIIIIII',
          'IIIIIIIIIIII',
          'IIiIIIIIIIII',
          'IIIIIIIIIIII',
          'II..II..II..',
          '..II....II..',
          '...II..II...',
          '....IIII....'
        ]
      }
    ];

    // ---- Skill / weapon sprites ----
    // Projectile & blade sprites point UP and are rotated when drawn.
    const ARCANE_BOLT = {            // Arcane Wand
      pal: { c: '#4cc9f0', C: '#bff4ff', W: '#ffffff', b: '#2a6fdb' },
      frames: [
        ['..C', '.CW', '.CW', 'cCW', 'cCW', '.cC', '.cC', '..c', '..b', '..b'],
        ['..C', '.CW', '.CW', 'cCW', 'cCW', '.cC', '.cC', '..c', '..b', '...']
      ]
    };
    const STAR_BOLT = {              // Celestial Gatling (evolved wand)
      pal: { Y: '#ffd166', W: '#fff8d6', O: '#ff9f1c' },
      rows: ['.....Y', '.....Y', '....YW', '....YW', '..YYWW', 'OYYWWW', 'OYYWWW', '..YYWW', '....YW', '....YW', '.....Y', '.....Y']
    };
    const SPIRIT_SWORD = {           // Spirit Blades
      pal: { M: '#e8f1ff', m: '#8aa8c8', G: '#06d6a0', H: '#ffd166', h: '#a06a2c' },
      rows: ['..M', '.mM', '.mM', '.GM', '.mM', '.mM', '.GM', '.mM', 'HHH', '.hh', '.hh', '.HH']
    };
    const SUN_RAY = {                // Solar Supernova rays
      pal: { Y: '#ffd166', W: '#fff8d6', O: '#ff9f1c' },
      rows: ['.W', '.W', '.Y', 'YY', 'OY', 'OO']
    };
    const FLAMES = {                 // Brimstone Aura (red) / Solar Supernova (gold)
      red:  { r: '#ef476f', o: '#ff9f1c', y: '#ffd166', w: '#fff3b0' },
      gold: { r: '#ff9f1c', o: '#ffd166', y: '#fff3b0', w: '#ffffff' },
      frames: [
        ['...r', '...r', '..rr', '..ro', '.rro', '.roy', 'rooy', 'rooy', 'rowy', '.rwy'],
        ['....', '...r', '..rr', '.rro', '.rro', '.roy', 'rooy', 'rooy', 'rowy', '.rwy'],
        ['..r.', '..rr', '..ro', '.rro', '.roo', '.roy', 'rooy', 'rooy', 'rowy', '.rwy']
      ]
    };
    const BOLT_ICON = {              // Storm Ring icon
      rows: ['...YYYY..', '..YYYY...', '.YYYY....', 'YYYYYYY..', '..YYYYYY.', '....YYY..', '...YYY...', '..YY.....', '.Y.......']
    };
    // Boss attack sprites
    const BONE_SHARD = {
      pal: { W: '#e8e4d0', w: '#b3ad94' },
      rows: ['WW', '.W', '.W', '.w', '.w', 'WW']
    };
    const SPIDERLING = {
      pal: { B: '#3a2350', b: '#1a0b2a', L: '#7a4a9a', Y: '#ff2a5f' },
      frames: [
        ['.....B', 'L.BBBB', '.LBYBB', 'L.BBBB', '.LBBBB', 'L..BBB', '....BB', '.....b'],
        ['.....B', '.LBBBB', 'L.BYBB', '.LBBBB', 'L.BBBB', '.L.BBB', '....BB', '.....b']
      ]
    };
    // ==SPRITE-DATA-END==

    const OUTLINE_COLOR = '#07070c';

    function buildSprite(rows, pal, mirror) {
      const grid = mirror ? rows.map((r) => r + r.split('').reverse().join('')) : rows;
      const w = grid[0].length;
      const h = grid.length;
      const c = document.createElement('canvas');
      c.width = w + 2;
      c.height = h + 2;
      const g = c.getContext('2d');
      const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && grid[y][x] !== '.' && !!pal[grid[y][x]];

      g.fillStyle = OUTLINE_COLOR;
      for (let y = -1; y <= h; y++) {
        for (let x = -1; x <= w; x++) {
          if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) {
            g.fillRect(x + 1, y + 1, 1, 1);
          }
        }
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (solid(x, y)) {
            g.fillStyle = pal[grid[y][x]];
            g.fillRect(x + 1, y + 1, 1, 1);
          }
        }
      }
      return c;
    }

    // Solid-colour silhouette copy of a sprite (used for boss attack flashes)
    function tintSprite(src, color) {
      const c = document.createElement('canvas');
      c.width = src.width;
      c.height = src.height;
      const g = c.getContext('2d');
      g.drawImage(src, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, c.width, c.height);
      return c;
    }

    const SPR = { players: {}, grunt: [], bat: [], brute: [], occultist: [], triad: [], boss: [], bossFlash: [] };
    Object.entries(PLAYER_SPRITES).forEach(([id, def]) => {
      SPR.players[id] = HUMAN_LEGS.map((legs) => buildSprite(def.body.concat(legs), def.pal, false));
    });
    SPR.grunt = GRUNT.frames.map((f) => buildSprite(f, GRUNT.pal, false));
    SPR.bat = BAT.frames.map((f) => buildSprite(f, BAT.pal, false));
    SPR.brute = BRUTE.legs.map((legs) => buildSprite(BRUTE.body.concat(legs), BRUTE.pal, false));
    SPR.occultist = OCCULTIST.frames.map((f) => buildSprite(f, OCCULTIST.pal, false));
    SPR.triad = PRISM_WARDEN.frames.map((f) => buildSprite(f, PRISM_WARDEN.pal, false));
    SPR.boss = BOSS_SPRITES.map((b) => buildSprite(b.half, b.pal, true));
    SPR.bossFlash = SPR.boss.map((s) => tintSprite(s, '#ffd166'));

    // ---- Skill & boss-attack sprites ----
    // Procedural pixel maps (same letter/palette format as the hand-drawn ones)
    function scytheRows() {
      const N = 20;
      const rows = [];
      for (let y = 0; y < N; y++) {
        let r = '';
        for (let x = 0; x < N; x++) {
          const d1 = Math.hypot(x - 9.2, y - 9.2);
          const d2 = Math.hypot(x - 11.9, y - 12.7);
          let ch = '.';
          if (d1 <= 8.6 && d2 > 7.1 && y <= 13) ch = d2 < 8.4 ? 'L' : (d1 > 7.4 ? 'r' : 'R');
          if (x >= 15 && x <= 16 && y >= 4) ch = x === 15 ? 'h' : 'H';
          r += ch;
        }
        rows.push(r);
      }
      return rows;
    }
    function orbRows(phase) {
      const rows = [];
      for (let y = 0; y < 11; y++) {
        let r = '';
        for (let x = 0; x < 11; x++) {
          const d = Math.hypot(x - 5, y - 5);
          r += d > 5.2 ? '.' : d > 4.2 ? 'p' : d > 2.8 ? 'P' : d > 1.5 ? 'L' : (phase ? 'L' : 'W');
        }
        rows.push(r);
      }
      return rows;
    }
    function boulderRows() {
      const rows = [];
      for (let y = 0; y < 16; y++) {
        let r = '';
        for (let x = 0; x < 16; x++) {
          const dx = x - 7.5;
          const dy = y - 7.5;
          const a = Math.atan2(dy, dx);
          const rad = 6.6 + 1.1 * Math.sin(3 * a + 1) + 0.7 * Math.sin(5 * a + 2);
          const d = Math.hypot(dx, dy);
          let ch = '.';
          if (d <= rad) {
            const shade = (dx + dy) / rad;
            ch = shade < -0.45 ? 'l' : (shade > 0.45 ? 'd' : 'm');
            if ((x * 7 + y * 3) % 11 === 0 && d < rad - 1) ch = 'k';
          }
          r += ch;
        }
        rows.push(r);
      }
      return rows;
    }
    function sparkRows(step) {
      const S = 15;
      const mid = 7;
      const g = Array.from({ length: S }, () => Array(S).fill('.'));
      const reach = [3, 5, 7][step];
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const len = i % 2 === 0 ? reach : Math.max(1, reach - 2);
        for (let d = 1; d <= len; d++) g[Math.round(mid + Math.sin(a) * d)][Math.round(mid + Math.cos(a) * d)] = 'a';
      }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) g[mid + dy][mid + dx] = 'b';
      return g.map((r) => r.join(''));
    }

    SPR.arcaneBolt = ARCANE_BOLT.frames.map((f) => buildSprite(f, ARCANE_BOLT.pal, true));
    SPR.starBolt = buildSprite(STAR_BOLT.rows, STAR_BOLT.pal, true);
    SPR.sword = buildSprite(SPIRIT_SWORD.rows, SPIRIT_SWORD.pal, true);
    SPR.scythe = buildSprite(scytheRows(), { R: '#ef476f', L: '#ffd1da', r: '#a3203f', H: '#4a3b52', h: '#7a6a85' }, false);
    SPR.sunRay = buildSprite(SUN_RAY.rows, SUN_RAY.pal, true);
    SPR.flameRed = FLAMES.frames.map((f) => buildSprite(f, FLAMES.red, true));
    SPR.flameGold = FLAMES.frames.map((f) => buildSprite(f, FLAMES.gold, true));
    SPR.boltIcon = buildSprite(BOLT_ICON.rows, { Y: '#c77dff' }, false);
    SPR.boltIconGold = buildSprite(BOLT_ICON.rows, { Y: '#ffd166' }, false);
    SPR.sparkViolet = [0, 1, 2].map((i) => buildSprite(sparkRows(i), { a: '#c77dff', b: '#ffffff' }, false));
    SPR.sparkGold = [0, 1, 2].map((i) => buildSprite(sparkRows(i), { a: '#ffd166', b: '#fff8d6' }, false));
    SPR.bone = buildSprite(BONE_SHARD.rows, BONE_SHARD.pal, true);
    SPR.orb = [0, 1].map((p) => buildSprite(orbRows(p), { p: '#3c096c', P: '#9b5de5', L: '#d0a6ff', W: '#ffffff' }, false));
    SPR.boulder = buildSprite(boulderRows(), { l: '#b9b0a4', m: '#8a8176', d: '#5c554d', k: '#3b352f' }, false);
    SPR.spiderling = SPIDERLING.frames.map((f) => buildSprite(f, SPIDERLING.pal, true));

    // Small icons for the weapon bar and level-up cards
    const iconCache = {};
    function weaponIcon(key, evolved) {
      const id = key + (evolved ? '*' : '');
      if (!iconCache[id]) {
        let c;
        if (key === 'wand') c = evolved ? SPR.starBolt : SPR.arcaneBolt[0];
        else if (key === 'blades') c = evolved ? SPR.scythe : SPR.sword;
        else if (key === 'aura') c = (evolved ? SPR.flameGold : SPR.flameRed)[0];
        else c = evolved ? SPR.boltIconGold : SPR.boltIcon;
        iconCache[id] = c.toDataURL();
      }
      return iconCache[id];
    }

    function drawSprite(img, x, y, scale) {
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    }

    function drawShadow(x, y, r) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.9, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Game Definitions
    const CHAMPIONS = [
      {
        id: 'lyra',
        name: 'Lyra the Arcanist',
        color: '#4cc9f0',
        startWeapon: 'wand',
        passiveText: '+20% Cooldown Speed & +15% Projectile Velocity',
        applyBonus: (p) => { p.cooldownMult *= 0.8; p.projSpeedMult *= 1.15; }
      },
      {
        id: 'kael',
        name: 'Kael the Blademaster',
        color: '#ffd166',
        startWeapon: 'blades',
        passiveText: '+25% Weapon Damage & +10% Move Speed',
        applyBonus: (p) => { p.damageMult *= 1.25; p.speed *= 1.1; }
      },
      {
        id: 'ignis',
        name: 'Ignis the Warden',
        color: '#ef476f',
        startWeapon: 'aura',
        passiveText: '+35 Max HP & +25% Area Size',
        applyBonus: (p) => { p.maxHp += 35; p.hp += 35; p.areaMult *= 1.25; }
      },
      {
        id: 'vespera',
        name: 'Vespera the Tempest',
        color: '#9b5de5',
        startWeapon: 'storm',
        passiveText: '+1 Extra Projectile & +20% Pickup Radius',
        applyBonus: (p) => { p.bonusProjectiles += 1; p.pickupRadius *= 1.2; }
      }
    ];

    const WEAPON_DEFS = {
      wand: {
        name: 'Arcane Wand',
        catalyst: 'tome',
        evoName: 'Celestial Gatling',
        evoDesc: 'Fires a relentless stream of piercing starbolts at high speed.',
        desc: 'Fires homing magic bolts at the nearest enemy.'
      },
      blades: {
        name: 'Spirit Blades',
        catalyst: 'bracer',
        evoName: 'Phantom Reaper',
        evoDesc: 'Permanent high-speed crimson scythes that shred all nearby foes.',
        desc: 'Summons orbiting spectral blades around your hero.'
      },
      aura: {
        name: 'Brimstone Aura',
        catalyst: 'heart',
        evoName: 'Solar Supernova',
        evoDesc: 'Massive scorching corona that burns enemies and heals 1 HP on kills.',
        desc: 'Damages all enemies inside a burning ring.'
      },
      storm: {
        name: 'Storm Ring',
        catalyst: 'duplicator',
        evoName: 'Thunderstorm Sovereign',
        evoDesc: 'Calls down rapid lightning strikes at random enemies across the arena.',
        desc: 'Strikes random nearby enemies with bolts of lightning.'
      }
    };

    const PASSIVE_DEFS = {
      tome: { name: 'Empty Tome', desc: 'Reduces weapon cooldowns by 12% per rank.' },
      bracer: { name: 'Crimson Bracer', desc: 'Increases all weapon damage by 15% per rank.' },
      heart: { name: 'Hollow Heart', desc: 'Increases Max HP by +25 and heals 25 HP.' },
      duplicator: { name: 'Duplicator Ring', desc: 'Adds +1 projectile to compatible weapons.' },
      boots: { name: 'Winged Boots', desc: 'Increases movement speed by 12% per rank.' },
      magnet: { name: 'Attractorb', desc: 'Expands XP gem pickup radius by 30% per rank.' },
      shield: { name: 'Aegis Shield', desc: 'Blocks one hit. Recharges in 5 minutes at rank 1, with each rank reducing recharge by 1 minute (max rank 5).' },
      regen: { name: 'Vitality', desc: 'Regenerates 5% of Max HP per minute per rank (up to 25% per minute at rank 5).' }
    };

    // Game State
    let gameState = 'NAME_ENTRY'; // NAME_ENTRY, CHAR_SELECT, PLAYING, PAUSED, GAMEOVER
    let leaderboardEnabled = true;
    let lastTime = 0;
    let elapsedSeconds = 0;
    let kills = 0;
    let nextBossMinute = 1;
    let bossSpawnCount = 0;
    let spawnAccumulator = 0;
    const UNIQUE_DROP_CHANCE = 0.02;

    let player = {};
    let enemies = [];
    let projectiles = [];
    let enemyProjectiles = [];
    let hordeBoostLevel = 0;
    let gems = [];
    let uniqueDrops = [];
    let chests = [];
    let particles = [];
    let floatingTexts = [];
    let bossTelegraphs = []; // Active shockwaves, boulder impacts & lightning
    let bossShots = [];      // Projectiles fired by bosses
    let bladeAngle = 0;
    let camera = { x: 0, y: 0 }; // top-left of the view in world coordinates
    let gameZoom = 1;
    let gameViewOffsetY = 0;

    const keys = {};
    window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

    // ---- Virtual joystick (mobile) ----
    const joystick = {
      active: false, touchId: null,
      startX: 0, startY: 0,
      currX: 0, currY: 0,
      dx: 0, dy: 0,
      maxR: 55
    };

    // Show mobile overlay only when first touch is detected
    let mobileMode = false;
    function activateMobileMode() {
      if (mobileMode) return;
      mobileMode = true;
      document.getElementById('mobile-controls').style.display = 'block';
    }

    function getCanvasPoint(touch) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }

    // Interactive elements and menus/modals should NOT start the joystick (so taps still register as clicks)
    const INTERACTIVE = new Set(['BUTTON','INPUT','A','SELECT','TEXTAREA','LABEL']);

    document.addEventListener('touchstart', (e) => {
      // Let buttons / links handle their own touches
      if (INTERACTIVE.has(e.target.tagName) || (e.target.closest && e.target.closest('.overlay-modal'))) return;
      e.preventDefault();
      activateMobileMode();
      for (const touch of e.changedTouches) {
        if (!joystick.active) {
          const pt = getCanvasPoint(touch);
          joystick.active = true;
          joystick.touchId = touch.identifier;
          // Store actual start (may be off-canvas; used for dx/dy math)
          joystick.startX = pt.x;
          joystick.startY = pt.y;
          joystick.dx = 0;
          joystick.dy = 0;
        }
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (INTERACTIVE.has(e.target.tagName) || (e.target.closest && e.target.closest('.overlay-modal'))) return;
      if (joystick.active) e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === joystick.touchId) {
          const pt = getCanvasPoint(touch);
          let dx = pt.x - joystick.startX;
          let dy = pt.y - joystick.startY;
          const len = Math.hypot(dx, dy);
          if (len > joystick.maxR) {
            dx = (dx / len) * joystick.maxR;
            dy = (dy / len) * joystick.maxR;
          }
          joystick.dx = dx / joystick.maxR;
          joystick.dy = dy / joystick.maxR;
        }
      }
    }, { passive: false });

    function resetJoystick() {
      joystick.active = false;
      joystick.touchId = null;
      joystick.dx = 0;
      joystick.dy = 0;
    }

    document.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === joystick.touchId) resetJoystick();
      }
    }, { passive: false });

    document.addEventListener('touchcancel', () => resetJoystick(), { passive: false });

    // Mobile pause button
    document.getElementById('pause-mobile-btn').addEventListener('click', () => {
      if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        backgroundMusic.pause();
        document.getElementById('pause-mobile-btn').textContent = '▶';
      } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        playBackgroundMusic();
        lastTime = performance.now();
        document.getElementById('pause-mobile-btn').textContent = '⏸';
      }
    });

    function initCharSelect() {
      charGrid.innerHTML = '';
      CHAMPIONS.forEach((champ) => {
        const card = document.createElement('div');
        card.className = 'choice-card char-card';
        card.innerHTML = `
          <div>
            <img class="char-sprite" alt="" src="${SPR.players[champ.id][0].toDataURL()}">
            <div class="card-tag">Starts with ${WEAPON_DEFS[champ.startWeapon].name}</div>
            <div class="card-name">${champ.name}</div>
            <div class="card-desc">${champ.passiveText}</div>
          </div>
        `;
        card.addEventListener('click', () => {
          RetroSynth.init();
          startGame(champ, leaderboardEnabled);
        });
        charGrid.appendChild(card);
      });
    }

    function startGame(champ, recordScore = true) {
      leaderboardEnabled = recordScore;
      myBtn.classList.toggle('hidden', !leaderboardEnabled);
      gameoverScoresBtn.classList.toggle('hidden', !leaderboardEnabled);
      elapsedSeconds = 0;
      kills = 0;
      nextBossMinute = 1;
      bossSpawnCount = 0;
      spawnAccumulator = 0;
      enemies = [];
      projectiles = [];
      enemyProjectiles = [];
      hordeBoostLevel = 0;
      gems = [];
      uniqueDrops = [];
      chests = [];
      particles = [];
      floatingTexts = [];
      bossTelegraphs = [];
      bossShots = [];

      player = {
        x: 0,
        y: 0,
        radius: 15,
        color: champ.color,
        champId: champ.id,
        name: playerName,
        moving: false,
        speed: 3.1,
        hp: 100,
        maxHp: 100,
        lvl: 1,
        xp: 0,
        nextXp: 25,
        damageMult: 1,
        cooldownMult: 1,
        areaMult: 1,
        projSpeedMult: 1,
        bonusProjectiles: 0,
        pickupRadius: 65,
        invuln: 0,
        shieldActive: false,
        shieldCooldown: 0,
        weapons: {},
        passives: {},
        cooldowns: { wand: 0, aura: 0, storm: 0 }
      };

      Object.keys(keys).forEach((k) => { keys[k] = false; });
      resetJoystick();
      document.getElementById('pause-mobile-btn').textContent = '⏸';
      camera.x = player.x - canvas.width / 2;
      camera.y = player.y - canvas.height / 2 - gameViewOffsetY / gameZoom;
      champ.applyBonus(player);
      player.weapons[champ.startWeapon] = { level: 1, evolved: false };

      nameModal.classList.add('hidden');
      charModal.classList.add('hidden');
      gameoverModal.classList.add('hidden');
      levelupModal.classList.add('hidden');
      chestModal.classList.add('hidden');

      updateWeaponBar();
      updateHUD();
      gameState = 'PLAYING';
      playBackgroundMusic();
      lastTime = performance.now();
    }

    function updateWeaponBar() {
      weaponBar.innerHTML = '';
      Object.entries(player.weapons).forEach(([key, w]) => {
        const def = WEAPON_DEFS[key];
        const badge = document.createElement('div');
        badge.className = 'slot-badge' + (w.evolved ? ' evolved' : '');
        badge.innerHTML = `<img class="slot-icon" alt="" src="${weaponIcon(key, w.evolved)}"><span>${w.evolved ? `★ ${def.evoName}` : `${def.name} Lv.${w.level}`}</span>`;
        weaponBar.appendChild(badge);
      });
      Object.entries(player.passives).forEach(([key, lvl]) => {
        const def = PASSIVE_DEFS[key];
        const badge = document.createElement('div');
        badge.className = 'slot-badge';
        if (key === 'shield') {
          badge.style.color = player.shieldActive ? '#ffd166' : '#9ad1d4';
          badge.textContent = `Aegis Lv.${lvl} ${player.shieldActive ? 'READY' : 'RECHARGING'}`;
          badge.title = player.shieldActive ? 'Blocks the next hit.' : 'The shield is regenerating.';
        } else {
          badge.style.color = '#9ad1d4';
          badge.textContent = `${def.name} Lv.${lvl}`;
        }
        weaponBar.appendChild(badge);
      });
    }

    function formatTime(sec) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function updateHUD() {
      hpFill.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
      hpLabel.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
      lvlLabel.textContent = player.lvl;
      xpFill.style.width = `${Math.min(100, (player.xp / player.nextXp) * 100)}%`;
      timerEl.textContent = formatTime(elapsedSeconds);
      killsLabel.textContent = kills;

      const nextBossSec = nextBossMinute * 60;
      const rem = Math.max(0, nextBossSec - elapsedSeconds);
      const activeBoss = enemies.find((e) => e.isBoss);
      if (activeBoss) {
        const activeBossCount = enemies.filter((e) => e.isBoss).length;
        bossCountdownEl.textContent = activeBossCount > 1
          ? `BOSSES: ${activeBossCount} ACTIVE`
          : `BOSS: ${activeBoss.name}`;
      } else {
        bossCountdownEl.textContent = `Next Boss: ${formatTime(rem)}`;
      }
    }

    function addFloatingText(x, y, text, color = '#fff', screen = false) {
      // screen = true draws a fixed on-screen banner instead of text in the world
      floatingTexts.push({ x, y, text, color, life: screen ? 110 : 45, screen });
    }

    function addParticles(x, y, color, count = 6) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 2.8 + 0.8;
        particles.push({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          color,
          life: 22
        });
      }
    }

    // Spawn regular enemies & milestone Overlord Bosses
    function spawnEnemy(isBoss = false, bossIndex = 1, announceBoss = true) {
      // Spawn on a ring just outside the visible screen, centred on the player
      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist = 540;
      const x = player.x + Math.cos(spawnAngle) * spawnDist;
      const y = player.y + Math.sin(spawnAngle) * spawnDist;

      if (isBoss) {
        const defIdx = (bossIndex - 1) % BOSS_DEFS.length;
        const def = BOSS_DEFS[defIdx];
        const lap = Math.floor((bossIndex - 1) / BOSS_DEFS.length);
        const bossName = def.name + (lap > 0 ? ` ${['', 'II', 'III', 'IV', 'V', 'VI'][Math.min(lap, 5)]}` : '');
        const cycleHpMult = Math.pow(1.5, lap);
        const maxHp = Math.round((650 + bossIndex * 480) * def.hpMult * cycleHpMult);
        if (announceBoss) {
          RetroSynth.bossWarning();
          addFloatingText(canvas.width / 2, 95, `WARNING: ${bossName.toUpperCase()} APPROACHES!`, '#ff758f', true);
        }

        enemies.push({
          x, y,
          isBoss: true,
          name: bossName,
          bossId: def.id,
          spriteIdx: defIdx,
          tier: bossIndex,
          phase: 0,
          radius: def.radius,
          speed: def.speed + Math.min(bossIndex * 0.08, 0.5),
          hp: maxHp,
          maxHp,
          damage: 22 + bossIndex * 4,
          color: def.color || '#ff2a5f',
          xpValue: 40 + bossIndex * 15,
          // Attack state machine: CHASE -> WINDUP -> (attack) -> CHASE
          attacks: def.attacks,
          attackIdx: 0,
          attack: null,
          windupMax: 1,
          aiState: 'CHASE', // CHASE, WINDUP, DASHING, CASTING, BREATHING
          stateTimer: 160,
          dashAngle: 0,
          dashSpeed: 0,
          shockwaveRadius: 0,
          shockwaveMax: 185,
          rockTargets: [],
          blinkX: 0,
          blinkY: 0,
          spiralAngle: 0
        });
        return;
      }

      const difficulty = 1 + elapsedSeconds / 45;
      // After 5 minutes, increase all enemy health by 25% (and +25% every 5 minutes thereafter)
      const fiveMinBoostMult = Math.pow(1.25, Math.floor(elapsedSeconds / 300));

      // Ranged enemies start appearing at 3 minutes; the Prism Warden joins at 6.
      const isTriad = elapsedSeconds >= 360 && Math.random() < 0.18;
      const isOccultist = !isTriad && elapsedSeconds >= 180 && Math.random() < 0.32;
      const isRanged = isTriad || isOccultist;
      const isBat = !isRanged && Math.random() < 0.25 && elapsedSeconds > 15;
      const isBrute = !isRanged && Math.random() < 0.15 && elapsedSeconds > 35;

      let kind = 'grunt';
      let radius = 13;
      let speed = 1.45 + Math.min(difficulty * 0.08, 0.9);
      let baseHp = 22;
      let damage = 9;
      let color = '#e63946';
      let xpValue = 3;

      if (isTriad) {
        kind = 'triad';
        radius = 14;
        speed = 1.2;
        const stepsAfter6 = Math.floor(Math.max(0, elapsedSeconds - 360) / 300);
        baseHp = 34 * Math.pow(1.25, stepsAfter6);
        damage = 11;
        color = '#ff9f1c';
        xpValue = 8;
      } else if (isOccultist) {
        kind = 'occultist';
        radius = 12;
        speed = 1.35;
        const stepsAfter3 = Math.floor(Math.max(0, elapsedSeconds - 180) / 300);
        baseHp = 22 * Math.pow(1.25, stepsAfter3);
        damage = 10;
        color = '#06d6a0';
        xpValue = 6;
      } else if (isBrute) {
        kind = 'brute';
        radius = 18;
        speed = 1.05;
        baseHp = 55;
        damage = 16;
        color = '#9b5de5';
        xpValue = 8;
      } else if (isBat) {
        kind = 'bat';
        radius = 10;
        speed = 2.25;
        baseHp = 14;
        damage = 9;
        color = '#f15bb5';
        xpValue = 3;
      }

      const calculatedHp = baseHp * (isRanged ? 1 : fiveMinBoostMult) * (isRanged ? 1 : difficulty);

      enemies.push({
        x, y,
        isBoss: false,
        kind,
        isRanged,
        shootTimer: 1.2 + Math.random() * 1.4,
        phase: Math.random() * 2,
        radius,
        speed,
        hp: calculatedHp,
        maxHp: calculatedHp,
        damage,
        color,
        xpValue,
        orbitDirection: isTriad ? (Math.random() < 0.5 ? -1 : 1) : 1
      });
    }

    // =====================================================================
    // BOSS ROSTER & ATTACKS
    // Each boss has its own sprite and cycles through its own attack list.
    // =====================================================================
    const BOSS_DEFS = [
      { id: 'malakor', name: 'Malakor the Dread',       radius: 30, speed: 1.15, hpMult: 1.0,  attacks: ['SHOCKWAVE', 'CHARGE'] },
      { id: 'vorgath', name: 'Vorgath Ironhide',        radius: 34, speed: 0.85, hpMult: 1.3,  attacks: ['ROCKFALL', 'SHOCKWAVE'] },
      { id: 'xylar',   name: 'Xylar Voidweaver',        radius: 28, speed: 1.0,  hpMult: 0.85, attacks: ['VOID_ORBS', 'BLINK'] },
      { id: 'nyxara',  name: 'Nyxara the Brood Mother', radius: 30, speed: 1.35, hpMult: 0.95, attacks: ['BROOD_CALL', 'CHARGE'] },
      { id: 'mordrek', name: 'Mordrek the Bone King',   radius: 30, speed: 0.95, hpMult: 1.0,  attacks: ['BONE_SPIRAL', 'SHOCKWAVE'] },
      { id: 'abyssal', name: 'Abyssal Sovereign',       radius: 32, speed: 1.05, hpMult: 1.2,  attacks: ['FIRE_BREATH', 'CHARGE'] },
      { id: 'eclipsara', name: 'Eclipsara the Starless', radius: 32, speed: 1.0, hpMult: 1.1, color: '#c77dff', attacks: ['BLINK', 'FIRE_BREATH'] },
      { id: 'gravenox', name: 'Gravenox the Cinder Titan', radius: 38, speed: 0.78, hpMult: 1.4, color: '#ff7b00', attacks: ['ROCKFALL', 'BONE_SPIRAL'] },
      { id: 'zephyra', name: 'Zephyra the Storm Sovereign', radius: 30, speed: 1.3, hpMult: 0.95, color: '#00e5ff', attacks: ['VOID_ORBS', 'BROOD_CALL'] },
      { id: 'rimefang', name: 'Rimefang the Glacial Wyrm', radius: 34, speed: 1.05, hpMult: 1.15, color: '#5a8dee', attacks: ['BLINK', 'CHARGE'] }
    ];

    const BOSS_ATTACKS = {
      SHOCKWAVE:   { windup: 75, label: 'SHOCKWAVE!',  color: '#ffd166' },
      CHARGE:      { windup: 60, label: 'CHARGE!',     color: '#ff758f' },
      ROCKFALL:    { windup: 80, label: 'ROCKFALL!',   color: '#ffb703' },
      VOID_ORBS:   { windup: 55, label: 'VOID BURST!', color: '#c77dff' },
      BLINK:       { windup: 45, label: 'BLINK!',      color: '#00e5ff' },
      BROOD_CALL:  { windup: 55, label: 'BROOD CALL!', color: '#ff2a5f' },
      BONE_SPIRAL: { windup: 45, label: 'BONE STORM!', color: '#e8e4d0' },
      FIRE_BREATH: { windup: 60, label: 'FIRE BREATH!', color: '#ff9f1c' }
    };

    const BREATH_RANGE = 280;
    const BREATH_HALF = 0.52;   // half-angle of the fire cone (radians)
    const ROCK_RADIUS = 48;

    function fireBossShot(x, y, ang, speed, kind, dmg, life) {
      bossShots.push({
        x, y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        kind, dmg, life,
        r: kind === 'orb' ? 9 : 7,
        spin: Math.random() * 6
      });
    }

    function spawnSpiderling(x, y, tier) {
      const hp = 12 + tier * 4;
      enemies.push({
        x, y,
        isBoss: false,
        kind: 'spiderling',
        phase: Math.random() * 2,
        radius: 9,
        speed: 2.6,
        hp, maxHp: hp,
        damage: 7,
        color: '#7a4a9a',
        xpValue: 2
      });
    }

    function startBossAttack(boss, id) {
      const atk = BOSS_ATTACKS[id];
      boss.attack = id;
      boss.aiState = 'WINDUP';
      boss.windupMax = atk.windup;
      boss.stateTimer = atk.windup;
      addFloatingText(boss.x, boss.y - 72, atk.label, atk.color);

      const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
      if (id === 'SHOCKWAVE') boss.shockwaveRadius = boss.radius;
      if (id === 'CHARGE' || id === 'FIRE_BREATH') boss.dashAngle = aim;
      if (id === 'ROCKFALL') {
        // 4-7 boulders: the first lands where you stand, the rest around you
        const n = 4 + Math.min(3, Math.floor(boss.tier / 2));
        boss.rockTargets = [{ x: player.x, y: player.y }];
        for (let i = 1; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = 70 + Math.random() * 140;
          boss.rockTargets.push({ x: player.x + Math.cos(a) * d, y: player.y + Math.sin(a) * d });
        }
      }
      if (id === 'BLINK') {
        const a = Math.random() * Math.PI * 2;
        boss.blinkX = player.x + Math.cos(a) * 230;
        boss.blinkY = player.y + Math.sin(a) * 230;
      }
      if (id === 'VOID_ORBS') RetroSynth.bossVoid();
    }

    function fireBossAttack(boss) {
      const id = boss.attack;
      boss.aiState = 'CHASE';
      boss.stateTimer = 160;

      if (id === 'SHOCKWAVE') {
        RetroSynth.bossShockwave();
        addParticles(boss.x, boss.y, '#ffd166', 18);
        bossTelegraphs.push({ type: 'SHOCKWAVE_BURST', x: boss.x, y: boss.y, radius: boss.radius, maxRadius: boss.shockwaveMax, life: 16 });
        const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
        if (dist <= boss.shockwaveMax + player.radius && player.invuln <= 0) {
          damagePlayer(Math.round(boss.damage * 1.15));
        }
        boss.stateTimer = 175;
      } else if (id === 'CHARGE') {
        RetroSynth.bossDash();
        boss.aiState = 'DASHING';
        boss.stateTimer = 26;
        boss.dashSpeed = 9.5;
      } else if (id === 'ROCKFALL') {
        RetroSynth.bossRock();
        boss.rockTargets.forEach((t) => {
          bossTelegraphs.push({ type: 'ROCK_IMPACT', x: t.x, y: t.y, life: 18 });
          addParticles(t.x, t.y, '#9a8f84', 8);
          if (Math.hypot(player.x - t.x, player.y - t.y) <= ROCK_RADIUS + player.radius) {
            damagePlayer(Math.round(boss.damage * 1.1));
          }
        });
        boss.stateTimer = 150;
      } else if (id === 'VOID_ORBS') {
        const n = 10 + Math.min(6, boss.tier);
        const base = Math.random() * Math.PI * 2;
        const dmg = Math.round(boss.damage * 0.5);
        for (let i = 0; i < n; i++) fireBossShot(boss.x, boss.y, base + (i * Math.PI * 2) / n, 2.3, 'orb', dmg, 300);
        const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
        [-0.2, 0, 0.2].forEach((o) => fireBossShot(boss.x, boss.y, aim + o, 3.6, 'orb', dmg, 260));
        addParticles(boss.x, boss.y, '#c77dff', 14);
        boss.stateTimer = 160;
      } else if (id === 'BLINK') {
        RetroSynth.bossBlink();
        addParticles(boss.x, boss.y, '#00e5ff', 14);
        boss.x = boss.blinkX;
        boss.y = boss.blinkY;
        addParticles(boss.x, boss.y, '#00e5ff', 14);
        boss.stateTimer = 30; // strikes again right after appearing
      } else if (id === 'BROOD_CALL') {
        RetroSynth.bossSummon();
        const n = Math.min(9, 4 + boss.tier);
        for (let i = 0; i < n; i++) {
          const a = (i * Math.PI * 2) / n;
          const sx = boss.x + Math.cos(a) * 46;
          const sy = boss.y + Math.sin(a) * 46;
          spawnSpiderling(sx, sy, boss.tier);
          addParticles(sx, sy, '#ff2a5f', 4);
        }
        boss.stateTimer = 170;
      } else if (id === 'BONE_SPIRAL') {
        boss.aiState = 'CASTING';
        boss.stateTimer = 80;
        boss.spiralAngle = Math.random() * Math.PI * 2;
      } else if (id === 'FIRE_BREATH') {
        RetroSynth.bossFire();
        boss.aiState = 'BREATHING';
        boss.stateTimer = 44;
      }
    }

    function updateBossAI(boss) {
      boss.stateTimer--;

      if (boss.aiState === 'CHASE') {
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
        boss.x += Math.cos(angle) * boss.speed;
        boss.y += Math.sin(angle) * boss.speed;
        if (boss.stateTimer <= 0) {
          const id = boss.attacks[boss.attackIdx % boss.attacks.length];
          boss.attackIdx++;
          startBossAttack(boss, id);
        }
      } else if (boss.aiState === 'WINDUP') {
        const id = boss.attack;
        if (id === 'SHOCKWAVE') {
          const progress = 1 - boss.stateTimer / boss.windupMax;
          boss.shockwaveRadius = boss.radius + progress * (boss.shockwaveMax - boss.radius);
        } else if ((id === 'CHARGE' || id === 'FIRE_BREATH') && boss.stateTimer > 28) {
          // track the player during the first part of the wind-up, then lock the direction
          boss.dashAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        }
        if (boss.stateTimer <= 0) fireBossAttack(boss);
      } else if (boss.aiState === 'DASHING') {
        boss.x += Math.cos(boss.dashAngle) * boss.dashSpeed;
        boss.y += Math.sin(boss.dashAngle) * boss.dashSpeed;
        boss.dashSpeed *= 0.96;
        if (boss.stateTimer % 3 === 0) addParticles(boss.x, boss.y, '#ff2a5f', 3);
        if (boss.stateTimer <= 0) {
          boss.aiState = 'CHASE';
          boss.stateTimer = 165;
        }
      } else if (boss.aiState === 'CASTING') {
        // Bone Storm: two spiralling arms of bone shards
        if (boss.stateTimer % 4 === 0) {
          RetroSynth.bossBone();
          for (let k = 0; k < 2; k++) {
            fireBossShot(boss.x, boss.y, boss.spiralAngle + k * Math.PI, 3.2, 'bone', Math.round(boss.damage * 0.4), 230);
          }
          boss.spiralAngle += 0.42;
        }
        if (boss.stateTimer <= 0) {
          boss.aiState = 'CHASE';
          boss.stateTimer = 150;
        }
      } else if (boss.aiState === 'BREATHING') {
        // Fire Breath: damages anything inside the locked cone
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        if (Math.hypot(dx, dy) < BREATH_RANGE + player.radius) {
          let diff = Math.atan2(dy, dx) - boss.dashAngle;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          if (Math.abs(diff) < BREATH_HALF + 0.08) damagePlayer(Math.round(boss.damage * 0.9));
        }
        if (boss.stateTimer <= 0) {
          boss.aiState = 'CHASE';
          boss.stateTimer = 165;
        }
      }
    }

    function damagePlayer(amount) {
      if (player.invuln > 0) return;
      if (player.shieldActive) {
        player.shieldActive = false;
        player.shieldCooldown = Math.max(60, (6 - player.passives.shield) * 60);
        player.invuln = 40;
        RetroSynth.shieldBlock();
        addParticles(player.x, player.y, '#00e5ff', 16);
        addFloatingText(player.x, player.y - 18, 'SHIELD BLOCKED', '#00e5ff');
        updateWeaponBar();
        return;
      }
      player.hp -= amount;
      player.invuln = 40;
      RetroSynth.playerHurt();
      addFloatingText(player.x, player.y - 18, `-${amount}`, '#ef476f');
      if (player.hp <= 0) {
        player.hp = 0;
        triggerGameOver();
      }
    }

    function updateWeapons(dt) {
      bladeAngle += 0.055;

      // 1. Arcane Wand / Celestial Gatling
      if (player.weapons.wand) {
        const w = player.weapons.wand;
        player.cooldowns.wand -= dt;
        const baseCd = w.evolved ? 0.14 : Math.max(0.28, 0.85 - w.level * 0.1);
        if (player.cooldowns.wand <= 0 && enemies.length > 0) {
          player.cooldowns.wand = baseCd * player.cooldownMult;
          RetroSynth.shootWand();

          // Find nearest enemy
          let nearest = enemies[0];
          let minD = Infinity;
          enemies.forEach((e) => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < minD) { minD = d; nearest = e; }
          });

          const count = (w.evolved ? 2 : 1) + player.bonusProjectiles;
          const baseAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
          for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 0.14;
            const ang = baseAngle + spread;
            const spd = (w.evolved ? 8.5 : 6.2) * player.projSpeedMult;
            projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              radius: w.evolved ? 6 : 5,
              damage: (w.evolved ? 26 : 14 + w.level * 5) * player.damageMult,
              pierce: w.evolved ? 3 : 1,
              color: w.evolved ? '#ffd166' : '#4cc9f0',
              evo: !!w.evolved,
              life: 95
            });
          }
        }
      }

      // 2. Spirit Blades / Phantom Reaper (Orbiting collision)
      if (player.weapons.blades) {
        const w = player.weapons.blades;
        const bladeCount = (w.evolved ? 4 : Math.min(4, 1 + Math.floor(w.level / 2))) + player.bonusProjectiles;
        const orbitRadius = (w.evolved ? 86 : 68) * player.areaMult;
        const dmg = (w.evolved ? 1.8 : 0.7 + w.level * 0.25) * player.damageMult;

        for (let i = 0; i < bladeCount; i++) {
          const ang = bladeAngle * (w.evolved ? 1.6 : 1) + (i * Math.PI * 2) / bladeCount;
          const bx = player.x + Math.cos(ang) * orbitRadius;
          const by = player.y + Math.sin(ang) * orbitRadius;

          enemies.forEach((e) => {
            if (Math.hypot(e.x - bx, e.y - by) < e.radius + (w.evolved ? 16 : 12)) {
              e.hp -= dmg;
              if (Math.random() < 0.15) addParticles(e.x, e.y, w.evolved ? '#ffd166' : '#4cc9f0', 2);
            }
          });
        }
      }

      // 3. Brimstone Aura / Solar Supernova
      if (player.weapons.aura) {
        const w = player.weapons.aura;
        player.cooldowns.aura -= dt;
        if (player.cooldowns.aura <= 0) {
          player.cooldowns.aura = 0.25;
          const radius = (w.evolved ? 135 : 85 + w.level * 10) * player.areaMult;
          const dmg = (w.evolved ? 18 : 6 + w.level * 3) * player.damageMult;

          enemies.forEach((e) => {
            if (Math.hypot(e.x - player.x, e.y - player.y) <= radius + e.radius) {
              e.hp -= dmg;
              if (e.hp <= 0 && w.evolved && player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + 1);
              }
            }
          });
        }
      }

      // 4. Storm Ring / Thunderstorm Sovereign
      if (player.weapons.storm) {
        const w = player.weapons.storm;
        player.cooldowns.storm -= dt;
        const baseCd = w.evolved ? 0.45 : Math.max(0.6, 1.5 - w.level * 0.15);
        if (player.cooldowns.storm <= 0 && enemies.length > 0) {
          player.cooldowns.storm = baseCd * player.cooldownMult;
          RetroSynth.shootLightning();

          const strikes = (w.evolved ? 3 : 1 + Math.floor(w.level / 3)) + player.bonusProjectiles;
          const dmg = (w.evolved ? 52 : 24 + w.level * 9) * player.damageMult;

          for (let i = 0; i < strikes; i++) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            if (target) {
              target.hp -= dmg;
              addParticles(target.x, target.y, w.evolved ? '#ffd166' : '#9b5de5', 8);
              bossTelegraphs.push({
                type: 'LIGHTNING_BOLT',
                x: target.x,
                y: target.y,
                color: w.evolved ? '#ffd166' : '#b5179e',
                evo: !!w.evolved,
                seed: Math.random() * 1000,
                life: 10
              });
            }
          }
        }
      }
    }

    function update(dt) {
      if (gameState !== 'PLAYING') return;

      elapsedSeconds += dt;
      const regenLevel = player.passives.regen || 0;
      if (regenLevel > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.05 * regenLevel * (dt / 60));
      }

      if (player.passives.shield && !player.shieldActive) {
        player.shieldCooldown = Math.max(0, player.shieldCooldown - dt);
        if (player.shieldCooldown === 0) {
          player.shieldActive = true;
          RetroSynth.shieldReady();
          addParticles(player.x, player.y, '#00e5ff', 14);
          addFloatingText(player.x, player.y - 28, 'SHIELD RESTORED', '#00e5ff');
          updateWeaponBar();
        }
      }

      // After 5 minutes, increase all enemy health by 25% (and every 5 minutes thereafter)
      const currentBoostLevel = Math.floor(elapsedSeconds / 300);
      if (currentBoostLevel > hordeBoostLevel) {
        hordeBoostLevel = currentBoostLevel;
        const boostMin = hordeBoostLevel * 5;
        enemies.forEach((e) => {
          e.maxHp *= 1.25;
          e.hp *= 1.25;
        });
        RetroSynth.bossWarning();
        addFloatingText(canvas.width / 2, 95, `HORDE SURGE (${boostMin} MIN): ALL ENEMIES +25% HEALTH!`, '#ff758f', true);
      }

      // Check Milestone Boss Spawn (every 60s)
      if (elapsedSeconds >= nextBossMinute * 60) {
        const completedCycles = Math.floor(bossSpawnCount / BOSS_DEFS.length);
        // Keep one boss per wave for three full rosters, then add one per completed roster.
        const bossesThisWave = Math.max(1, completedCycles - 1);
        for (let i = 0; i < bossesThisWave; i++) {
          spawnEnemy(true, bossSpawnCount + 1, bossesThisWave === 1);
          bossSpawnCount++;
        }
        if (bossesThisWave > 1) {
          RetroSynth.bossWarning();
          addFloatingText(canvas.width / 2, 95, `WARNING: ${bossesThisWave} BOSSES APPROACH!`, '#ff758f', true);
        }
        nextBossMinute++;
      }

      // Regular Horde Spawner
      const spawnRate = Math.max(0.18, 0.95 - elapsedSeconds * 0.004);
      spawnAccumulator += dt;
      if (spawnAccumulator >= spawnRate) {
        spawnAccumulator = 0;
        spawnEnemy(false);
      }

      // Player Movement
      let mx = 0, my = 0;
      if (keys['w'] || keys['arrowup']) my -= 1;
      if (keys['s'] || keys['arrowdown']) my += 1;
      if (keys['a'] || keys['arrowleft']) mx -= 1;
      if (keys['d'] || keys['arrowright']) mx += 1;

      // Blend in touch joystick input
      if (joystick.active) {
        mx += joystick.dx;
        my += joystick.dy;
      }

      player.moving = (mx !== 0 || my !== 0);
      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        player.x += (mx / len) * player.speed;
        player.y += (my / len) * player.speed;
      }
      // Camera follows the player through the endless world
      camera.x = player.x - canvas.width / 2;
        camera.y = player.y - canvas.height / 2 - gameViewOffsetY / gameZoom;

      if (player.invuln > 0) player.invuln--;

      updateWeapons(dt);

      // Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
            e.hp -= p.damage;
            RetroSynth.hitEnemy();
            addParticles(p.x, p.y, p.color, 3);
            p.pierce--;
            if (p.pierce <= 0) {
              p.life = 0;
              break;
            }
          }
        }

        if (p.life <= 0) projectiles.splice(i, 1);
      }
      // Update Enemy Projectiles
      for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = enemyProjectiles[i];
        ep.x += ep.vx;
        ep.y += ep.vy;
        ep.life--;

        // Collision with player
        if (Math.hypot(player.x - ep.x, player.y - ep.y) < player.radius + ep.radius) {
          damagePlayer(ep.damage);
          addParticles(ep.x, ep.y, ep.color, 6);
          enemyProjectiles.splice(i, 1);
          continue;
        }

        if (ep.life <= 0) {
          enemyProjectiles.splice(i, 1);
        }
      }


      // Update boss projectiles (void orbs, bone shards)
      for (let i = bossShots.length - 1; i >= 0; i--) {
        const s = bossShots[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        if (player.invuln <= 0 && Math.hypot(player.x - s.x, player.y - s.y) < player.radius + s.r) {
          addParticles(s.x, s.y, s.kind === 'orb' ? '#9b5de5' : '#e8e4d0', 5);
          damagePlayer(s.dmg);
          s.life = 0;
        }
        if (s.life <= 0) bossShots.splice(i, 1);
      }

      // Update Enemies & Bosses
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        if (e.hp <= 0) {
          kills++;
          addParticles(e.x, e.y, e.color, e.isBoss ? 25 : 7);
          if (e.isBoss) {
            chests.push({ x: e.x, y: e.y, radius: 16 });
            addFloatingText(e.x, e.y - 20, 'OVERLORD CHEST DROPPED!', '#ffd166');
          } else {
            gems.push({ x: e.x, y: e.y, value: e.xpValue, radius: e.xpValue > 4 ? 7 : 5 });
            if (!e.noUniqueDrop && Math.random() < UNIQUE_DROP_CHANCE) {
              uniqueDrops.push({ x: e.x, y: e.y, radius: 14, phase: Math.random() * Math.PI * 2 });
            }
          }
          enemies.splice(i, 1);
          continue;
        }

        if (e.isBoss) {
          updateBossAI(e);
        } else if (e.isRanged) {
          // Ranged enemies hold firing distance; Prism Wardens orbit the player.
          const dist = Math.hypot(player.x - e.x, player.y - e.y);
          const STOP_DIST = e.kind === 'triad' ? 300 : 250;

          if (dist > STOP_DIST + 20) {
            // Approach until reaching firing range
            const ang = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(ang) * e.speed;
            e.y += Math.sin(ang) * e.speed;
          } else if (dist < STOP_DIST - 50) {
            // Too close: kite back slightly
            const ang = Math.atan2(player.y - e.y, player.x - e.x);
            e.x -= Math.cos(ang) * (e.speed * 0.7);
            e.y -= Math.sin(ang) * (e.speed * 0.7);
          } else if (e.kind === 'triad') {
            const ang = Math.atan2(player.y - e.y, player.x - e.x) + Math.PI / 2 * e.orbitDirection;
            e.x += Math.cos(ang) * 0.8;
            e.y += Math.sin(ang) * 0.8;
          } else {
            // STOPS moving closer to player! Gentle strafe
            const ang = Math.atan2(player.y - e.y, player.x - e.x) + Math.PI / 2;
            e.x += Math.cos(ang) * 0.35 * Math.sin(performance.now() / 250 + e.phase);
            e.y += Math.sin(ang) * 0.35 * Math.sin(performance.now() / 250 + e.phase);
          }

          // Shoot projectile at player
          e.shootTimer -= dt;
          if (e.shootTimer <= 0) {
            const isTriad = e.kind === 'triad';
            e.shootTimer = isTriad ? 3.2 : 2.4;
            const ang = Math.atan2(player.y - e.y, player.x - e.x);
            const pSpd = isTriad ? 3.5 : 3.8;
            const spreadAngles = isTriad ? [-0.22, 0, 0.22] : [0];
            spreadAngles.forEach((offset) => {
              const shotAngle = ang + offset;
              enemyProjectiles.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(shotAngle) * pSpd,
                vy: Math.sin(shotAngle) * pSpd,
                radius: isTriad ? 5 : 6,
                damage: isTriad ? 9 : 12,
                color: e.color,
                life: isTriad ? 155 : 140
              });
            });
            RetroSynth.tone(480, 'sine', 0.08, 0.05, 240);
            addParticles(e.x, e.y, e.color, isTriad ? 8 : 5);
          }
        } else {
          const ang = Math.atan2(player.y - e.y, player.x - e.x);
          e.x += Math.cos(ang) * e.speed;
          e.y += Math.sin(ang) * e.speed;
        }

        // Contact Damage
        if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
          damagePlayer(e.damage);
        }
      }

      // Update XP Gems
      for (let i = gems.length - 1; i >= 0; i--) {
        const g = gems[i];
        const dist = Math.hypot(player.x - g.x, player.y - g.y);
        if (dist < player.pickupRadius) {
          const ang = Math.atan2(player.y - g.y, player.x - g.x);
          g.x += Math.cos(ang) * 6.5;
          g.y += Math.sin(ang) * 6.5;
        }
        if (dist < player.radius + g.radius) {
          player.xp += g.value;
          RetroSynth.gemPickup();
          gems.splice(i, 1);

          if (player.xp >= player.nextXp) {
            player.xp -= player.nextXp;
            player.lvl++;
            player.nextXp = Math.round(player.nextXp * 1.32);
            triggerLevelUp();
            break;
          }
        }
      }

      // Unique Nova drop: clear regular enemies without affecting bosses.
      for (let i = uniqueDrops.length - 1; i >= 0; i--) {
        const drop = uniqueDrops[i];
        if (Math.hypot(player.x - drop.x, player.y - drop.y) >= player.radius + drop.radius) continue;

        uniqueDrops.splice(i, 1);
        enemies.forEach((enemy) => {
          if (!enemy.isBoss) {
            enemy.hp = 0;
            enemy.noUniqueDrop = true;
          }
        });
        RetroSynth.evolution();
        addParticles(player.x, player.y, '#ffd166', 24);
        addFloatingText(canvas.width / 2, 95, 'HORDE CLEARED!', '#ffd166', true);
        break;
      }

      // Update Boss Chests
      for (let i = chests.length - 1; i >= 0; i--) {
        const c = chests[i];
        if (Math.hypot(player.x - c.x, player.y - c.y) < player.radius + c.radius + 8) {
          chests.splice(i, 1);
          triggerBossChest();
          break;
        }
      }

      // Visual Effects Cleanup
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(idx, 1);
      });

      floatingTexts.forEach((ft, idx) => {
        if (!ft.screen) ft.y -= 0.65;
        ft.life--;
        if (ft.life <= 0) floatingTexts.splice(idx, 1);
      });

      bossTelegraphs.forEach((bt, idx) => {
        bt.life--;
        if (bt.type === 'SHOCKWAVE_BURST') {
          bt.radius += (bt.maxRadius - bt.radius) * 0.35;
        }
        if (bt.life <= 0) bossTelegraphs.splice(idx, 1);
      });

      updateHUD();
    }

    function getAvailableUpgrades() {
      const pool = [];

      // Check Evolutions first
      Object.entries(WEAPON_DEFS).forEach(([wKey, def]) => {
        const owned = player.weapons[wKey];
        if (owned && owned.level >= 5 && !owned.evolved && player.passives[def.catalyst]) {
          pool.push({
            type: 'EVOLUTION',
            key: wKey,
            name: def.evoName,
            tag: '★ WEAPON EVOLUTION',
            desc: def.evoDesc
          });
        }
      });

      // Weapons
      Object.entries(WEAPON_DEFS).forEach(([wKey, def]) => {
        const owned = player.weapons[wKey];
        if (!owned) {
          pool.push({
            type: 'WEAPON',
            key: wKey,
            name: def.name,
            tag: 'New Weapon',
            desc: def.desc
          });
        } else if (owned.level < 5 && !owned.evolved) {
          pool.push({
            type: 'WEAPON',
            key: wKey,
            name: `${def.name} (Lv.${owned.level + 1})`,
            tag: 'Weapon Upgrade',
            desc: `Boosts damage, area, or projectile count. (Catalyst: ${PASSIVE_DEFS[def.catalyst].name})`
          });
        }
      });

      // Passives
      Object.entries(PASSIVE_DEFS).forEach(([pKey, def]) => {
        const lvl = player.passives[pKey] || 0;
        if (lvl < 5) {
          pool.push({
            type: 'PASSIVE',
            key: pKey,
            name: `${def.name} (Lv.${lvl + 1})`,
            tag: 'Passive Relic',
            desc: def.desc
          });
        }
      });

      return pool;
    }

    function applyUpgrade(item) {
      if (item.type === 'EVOLUTION') {
        player.weapons[item.key].evolved = true;
        RetroSynth.evolution();
      } else if (item.type === 'WEAPON') {
        if (!player.weapons[item.key]) {
          player.weapons[item.key] = { level: 1, evolved: false };
        } else {
          player.weapons[item.key].level++;
        }
      } else if (item.type === 'PASSIVE') {
        const previousLevel = player.passives[item.key] || 0;
        player.passives[item.key] = previousLevel + 1;
        if (item.key === 'shield') {
          if (previousLevel === 0) {
            player.shieldActive = true;
            player.shieldCooldown = 0;
            RetroSynth.shieldReady();
          } else if (!player.shieldActive) {
            player.shieldCooldown = Math.max(0, player.shieldCooldown - 60);
            if (player.shieldCooldown === 0) {
              player.shieldActive = true;
              RetroSynth.shieldReady();
            }
          }
        }
        if (item.key === 'tome') player.cooldownMult *= 0.88;
        if (item.key === 'bracer') player.damageMult += 0.15;
        if (item.key === 'heart') { player.maxHp += 25; player.hp = Math.min(player.maxHp, player.hp + 25); }
        if (item.key === 'duplicator') player.bonusProjectiles += 1;
        if (item.key === 'boots') player.speed *= 1.12;
        if (item.key === 'magnet') player.pickupRadius *= 1.3;
      } else if (item.type === 'HEAL') {
        player.hp = Math.min(player.maxHp, player.hp + 45);
      }
      updateWeaponBar();
      updateHUD();
    }

    function triggerLevelUp() {
      if (gameState === 'GAMEOVER') return;
      gameState = 'PAUSED';
      RetroSynth.levelUp();

      const pool = getAvailableUpgrades();
      const evos = pool.filter((i) => i.type === 'EVOLUTION');
      const others = pool.filter((i) => i.type !== 'EVOLUTION').sort(() => Math.random() - 0.5);

      const choices = [...evos, ...others].slice(0, 3);
      if (choices.length === 0) {
        choices.push({
          type: 'HEAL',
          name: 'Crimson Elixir',
          tag: 'Consumable',
          desc: 'Restores 45 HP immediately.'
        });
      }

      draftGrid.innerHTML = '';
      choices.forEach((choice) => {
        const card = document.createElement('div');
        card.className = 'choice-card' + (choice.type === 'EVOLUTION' ? ' evo-card' : '');
        card.innerHTML = `
          <div>
            ${choice.type === 'WEAPON' || choice.type === 'EVOLUTION' ? `<img class="card-icon" alt="" src="${weaponIcon(choice.key, choice.type === 'EVOLUTION')}">` : ''}
            <div class="card-tag">${choice.tag}</div>
            <div class="card-name">${choice.name}</div>
            <div class="card-desc">${choice.desc}</div>
          </div>
        `;
        card.addEventListener('click', () => {
          applyUpgrade(choice);
          levelupModal.classList.add('hidden');
          gameState = 'PLAYING';
          lastTime = performance.now();
        });
        draftGrid.appendChild(card);
      });

      levelupModal.classList.remove('hidden');
    }

    function triggerBossChest() {
      gameState = 'PAUSED';
      claimChestBtn.classList.add('hidden');
      chestModal.classList.remove('hidden');

      const pool = getAvailableUpgrades();
      const evos = pool.filter((i) => i.type === 'EVOLUTION');
      const reward = evos.length > 0
        ? evos[0]
        : (pool[Math.floor(Math.random() * pool.length)] || {
            type: 'HEAL',
            name: 'Overlord Heart',
            desc: 'Restores 45 HP.'
          });

      let step = 0;
      const totalSteps = 16;
      const interval = setInterval(() => {
        RetroSynth.rouletteTick(step);
        const sample = pool.length > 0 ? pool[step % pool.length] : reward;
        rouletteItemEl.textContent = sample.name;
        rouletteDescEl.textContent = 'Unlocking Overlord Relic...';
        step++;

        if (step >= totalSteps) {
          clearInterval(interval);
          rouletteItemEl.textContent = reward.name;
          rouletteDescEl.textContent = reward.desc;
          applyUpgrade(reward);
          if (reward.type !== 'EVOLUTION') RetroSynth.levelUp();
          claimChestBtn.classList.remove('hidden');
        }
      }, 85);

      claimChestBtn.onclick = () => {
        chestModal.classList.add('hidden');
        gameState = 'PLAYING';
        lastTime = performance.now();
      };
    }

    function triggerGameOver() {
      if (gameState === 'GAMEOVER') return;
      gameState = 'GAMEOVER';
      backgroundMusic.pause();
      const seconds = Math.floor(elapsedSeconds);
      gameoverStats.textContent = `Survived ${formatTime(seconds)} • Level ${player.lvl} • ${kills} Enemies Defeated`;
      gameoverSave.className = 'save-status';
      gameoverModal.classList.remove('hidden');

      if (!leaderboardEnabled) {
        gameoverSave.textContent = 'Just Play run — not submitted to the leaderboard.';
        gameoverScoresBtn.classList.add('hidden');
        return;
      }

      gameoverSave.textContent = 'Saving score…';
      pendingSubmit = submitRun({
        run_id: makeRunId(),
        name: playerName,
        champion: player.champId,
        time: seconds,
        kills,
        level: player.lvl,
        ts: Math.floor(Date.now() / 1000)
      }).then((data) => {
        if (data) {
          gameoverSave.textContent = `Score saved ✓  Rank #${data.rank_kills} by kills • #${data.rank_time} by survival time`;
        } else {
          gameoverSave.className = 'save-status offline';
          gameoverSave.textContent = 'Server unreachable — score kept on this device and will sync later.';
        }
      });
    }

    restartBtn.addEventListener('click', () => {
      gameoverModal.classList.add('hidden');
      if (!leaderboardEnabled) {
        const champ = CHAMPIONS.find((item) => item.id === player.champId) || CHAMPIONS[0];
        startGame(champ, false);
        return;
      }
      charModal.classList.remove('hidden');
      gameState = 'CHAR_SELECT';
    });

    // =====================================================================
    // SKILL + BOSS-ATTACK DRAWING
    // =====================================================================
    function drawSpriteRot(img, x, y, scale, angle, alpha = 1) {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(angle);
      if (alpha !== 1) ctx.globalAlpha = alpha;
      ctx.drawImage(img, -(img.width * scale) / 2, -(img.height * scale) / 2, img.width * scale, img.height * scale);
      ctx.restore();
    }

    // Brimstone Aura (flame ring) / Solar Supernova (golden flames + rotating rays)
    function drawAura() {
      const w = player.weapons.aura;
      if (!w) return;
      const t = performance.now();
      const radius = (w.evolved ? 135 : 85 + w.level * 10) * player.areaMult;

      const grad = ctx.createRadialGradient(player.x, player.y, radius * 0.15, player.x, player.y, radius);
      grad.addColorStop(0, w.evolved ? 'rgba(255, 209, 102, 0.03)' : 'rgba(239, 71, 111, 0.02)');
      grad.addColorStop(1, w.evolved ? 'rgba(255, 209, 102, 0.20)' : 'rgba(239, 71, 111, 0.17)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = w.evolved ? 'rgba(255, 209, 102, 0.45)' : 'rgba(239, 71, 111, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (w.evolved) {
        const rays = 14;
        for (let i = 0; i < rays; i++) {
          const a = (i * Math.PI * 2) / rays + t / 2600;
          drawSpriteRot(SPR.sunRay, player.x + Math.cos(a) * (radius + 20), player.y + Math.sin(a) * (radius + 20), 3, a + Math.PI / 2);
        }
      }

      const frames = w.evolved ? SPR.flameGold : SPR.flameRed;
      const scale = w.evolved ? 3 : 2;
      const n = Math.max(8, Math.round((Math.PI * 2 * radius) / (w.evolved ? 30 : 24)));
      for (let i = 0; i < n; i++) {
        const a = (i * Math.PI * 2) / n + t / (w.evolved ? 1800 : 3200);
        const f = frames[Math.floor(t / 110 + i * 1.7) % 3];
        drawSprite(f, player.x + Math.cos(a) * radius, player.y + Math.sin(a) * radius - (f.height * scale) / 2 + 3, scale);
      }
    }

    // Spirit Blades (swords) / Phantom Reaper (scythes), with afterimages
    function drawBlades() {
      const w = player.weapons.blades;
      if (!w) return;
      const bladeCount = (w.evolved ? 4 : Math.min(4, 1 + Math.floor(w.level / 2))) + player.bonusProjectiles;
      const orbitRadius = (w.evolved ? 86 : 68) * player.areaMult;
      const spin = bladeAngle * (w.evolved ? 1.6 : 1);
      const img = w.evolved ? SPR.scythe : SPR.sword;

      ctx.strokeStyle = w.evolved ? 'rgba(239, 71, 111, 0.16)' : 'rgba(76, 201, 240, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < bladeCount; i++) {
        const ang = spin + (i * Math.PI * 2) / bladeCount;
        for (let k = 3; k >= 1; k--) {
          const a = ang - 0.11 * k;
          drawSpriteRot(img, player.x + Math.cos(a) * orbitRadius, player.y + Math.sin(a) * orbitRadius, 2, a + Math.PI, 0.1 * (4 - k));
        }
        drawSpriteRot(img, player.x + Math.cos(ang) * orbitRadius, player.y + Math.sin(ang) * orbitRadius, 2, ang + Math.PI);
      }
    }

    // Arcane Wand bolts / Celestial Gatling star-bolts
    function drawPlayerProjectiles() {
      const t = performance.now();
      projectiles.forEach((p) => {
        const dir = Math.atan2(p.vy, p.vx) + Math.PI / 2;
        if (p.evo) {
          drawSpriteRot(SPR.starBolt, p.x - p.vx * 1.6, p.y - p.vy * 1.6, 1.6, t / 80, 0.25);
          drawSpriteRot(SPR.starBolt, p.x, p.y, 2, t / 90 + p.x * 0.01);
        } else {
          const fr = Math.abs(Math.floor(t / 80 + p.x * 0.05)) % 2;
          drawSpriteRot(SPR.arcaneBolt[fr], p.x - p.vx * 2.4, p.y - p.vy * 2.4, 2, dir, 0.18);
          drawSpriteRot(SPR.arcaneBolt[fr], p.x - p.vx * 1.2, p.y - p.vy * 1.2, 2, dir, 0.32);
          drawSpriteRot(SPR.arcaneBolt[fr], p.x, p.y, 2, dir);
        }
      });
    }

    // Projectiles fired by bosses (void orbs, bone shards)
    function drawBossShots() {
      const t = performance.now();
      bossShots.forEach((s) => {
        if (s.kind === 'orb') {
          ctx.fillStyle = 'rgba(155, 93, 229, 0.25)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
          ctx.fill();
          drawSprite(SPR.orb[Math.floor(t / 130) % 2], s.x, s.y, 2);
        } else {
          drawSpriteRot(SPR.bone, s.x, s.y, 2, t / 110 + s.spin);
        }
      });
    }

    // Storm Ring / Thunderstorm Sovereign: jagged bolt + impact burst
    function drawLightning(bt) {
      const top = bt.y - 240;
      const n = 7;
      const pts = [{ x: bt.x, y: top }];
      for (let i = 1; i < n; i++) {
        const k = i / n;
        pts.push({ x: bt.x + Math.sin(bt.seed * (i + 1.7)) * 18 * (1 - k * 0.4), y: top + (bt.y - top) * k });
      }
      pts.push({ x: bt.x, y: bt.y });
      const col = bt.evo
        ? ['rgba(255, 209, 102, 0.35)', '#ffd166', '#fff8d6']
        : ['rgba(181, 23, 158, 0.35)', '#c77dff', '#ffffff'];
      ctx.lineCap = 'square';
      [[10, col[0]], [5, col[1]], [2, col[2]]].forEach(([wd, c]) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = wd;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(Math.round(p.x), Math.round(p.y)) : ctx.moveTo(Math.round(p.x), Math.round(p.y))));
        ctx.stroke();
      });
      ctx.lineCap = 'butt';
      const step = bt.life > 6 ? 0 : (bt.life > 3 ? 1 : 2);
      drawSprite((bt.evo ? SPR.sparkGold : SPR.sparkViolet)[step], bt.x, bt.y, 3);
    }

    function conePath(x, y, ang, range, half) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, range, ang - half, ang + half);
      ctx.closePath();
    }

    // Warning markers for every boss attack + active attack visuals
    function drawBossTelegraphs(t) {
      enemies.forEach((e) => {
        if (!e.isBoss) return;

        if (e.aiState === 'WINDUP') {
          const prog = 1 - e.stateTimer / e.windupMax;

          if (e.attack === 'SHOCKWAVE') {
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.75)';
            ctx.setLineDash([6, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.shockwaveMax, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255, 117, 143, 0.18)';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.shockwaveRadius, 0, Math.PI * 2);
            ctx.fill();
          } else if (e.attack === 'CHARGE') {
            const endX = e.x + Math.cos(e.dashAngle) * 260;
            const endY = e.y + Math.sin(e.dashAngle) * 260;
            ctx.save();
            ctx.strokeStyle = 'rgba(239, 71, 111, 0.35)';
            ctx.lineWidth = e.radius * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.strokeStyle = '#ffd166';
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
          } else if (e.attack === 'ROCKFALL') {
            e.rockTargets.forEach((r) => {
              ctx.strokeStyle = 'rgba(255, 183, 3, 0.85)';
              ctx.setLineDash([5, 5]);
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(r.x, r.y, ROCK_RADIUS, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = `rgba(255, 90, 40, ${0.08 + 0.2 * prog})`;
              ctx.beginPath();
              ctx.arc(r.x, r.y, ROCK_RADIUS * prog, 0, Math.PI * 2);
              ctx.fill();
              if (e.stateTimer < 18) {
                const k = e.stateTimer / 18;
                drawSprite(SPR.boulder, r.x, r.y - 10 - k * k * 260, 2);
              }
            });
          } else if (e.attack === 'VOID_ORBS') {
            const gr = ctx.createRadialGradient(e.x, e.y, 4, e.x, e.y, 30 + prog * 50);
            gr.addColorStop(0, 'rgba(199, 125, 255, 0.6)');
            gr.addColorStop(1, 'rgba(123, 44, 191, 0)');
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 30 + prog * 50, 0, Math.PI * 2);
            ctx.fill();
          } else if (e.attack === 'BLINK') {
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
            ctx.setLineDash([4, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.blinkX, e.blinkY, 36, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(0, 229, 255, ${0.08 + 0.2 * prog})`;
            ctx.beginPath();
            ctx.arc(e.blinkX, e.blinkY, 36, 0, Math.PI * 2);
            ctx.fill();
            drawSprite(SPR.sparkViolet[Math.floor(t / 90) % 3], e.blinkX, e.blinkY, 2);
          } else if (e.attack === 'BROOD_CALL') {
            ctx.strokeStyle = `rgba(255, 42, 95, ${0.85 - 0.5 * prog})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 30 + prog * 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 42, 95, 0.08)';
            ctx.fill();
          } else if (e.attack === 'BONE_SPIRAL') {
            ctx.strokeStyle = `rgba(232, 228, 208, ${0.35 + 0.4 * Math.abs(Math.sin(t / 80))})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 38 + prog * 14, 0, Math.PI * 2);
            ctx.stroke();
          } else if (e.attack === 'FIRE_BREATH') {
            conePath(e.x, e.y, e.dashAngle, BREATH_RANGE, BREATH_HALF);
            ctx.fillStyle = 'rgba(255, 159, 28, 0.10)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.85)';
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
            conePath(e.x, e.y, e.dashAngle, BREATH_RANGE * prog, BREATH_HALF);
            ctx.fillStyle = 'rgba(255, 90, 30, 0.25)';
            ctx.fill();
          }
        } else if (e.aiState === 'BREATHING') {
          conePath(e.x, e.y, e.dashAngle, BREATH_RANGE, BREATH_HALF);
          ctx.fillStyle = 'rgba(255, 120, 30, 0.16)';
          ctx.fill();
          const dx = Math.cos(e.dashAngle);
          const dy = Math.sin(e.dashAngle);
          const count = 18;
          for (let i = 0; i < count; i++) {
            const d = 36 + (i / (count - 1)) * (BREATH_RANGE - 36);
            const off = Math.sin(i * 7.3 + t / 70) * d * Math.tan(BREATH_HALF) * 0.85;
            const f = (i % 3 === 0 ? SPR.flameGold : SPR.flameRed)[(Math.floor(t / 70) + i) % 3];
            drawSprite(f, e.x + dx * d - dy * off, e.y + dy * d + dx * off - 10, 2);
          }
        }
      });

      // One-shot effects: shockwave rings, boulder impacts, lightning
      bossTelegraphs.forEach((bt) => {
        if (bt.type === 'SHOCKWAVE_BURST') {
          ctx.strokeStyle = `rgba(255, 209, 102, ${bt.life / 16})`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(bt.x, bt.y, bt.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (bt.type === 'ROCK_IMPACT') {
          const k = bt.life / 18;
          ctx.strokeStyle = `rgba(214, 196, 168, ${k})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(bt.x, bt.y, ROCK_RADIUS * (1.1 - k * 0.45), 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(120, 108, 96, ${k * 0.35})`;
          ctx.fill();
        } else if (bt.type === 'LIGHTNING_BOLT') {
          drawLightning(bt);
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      if (gameZoom !== 1) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(gameZoom, gameZoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Endless scrolling grid (60px tiles). The camera is rounded so the
      // pixel-art sprites stay crisp while the world moves.
      const TILE = 60;
      const camX = Math.round(camera.x);
      const camY = Math.round(camera.y);
      const gridX = -(((camX % TILE) + TILE) % TILE);
      const gridY = -(((camY % TILE) + TILE) % TILE);
      ctx.strokeStyle = '#1d1d2b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = gridX; x < canvas.width; x += TILE) {
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, canvas.height);
      }
      for (let y = gridY; y < canvas.height; y += TILE) {
        ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5);
      }
      ctx.stroke();

      if (gameState === 'CHAR_SELECT' || gameState === 'NAME_ENTRY') {
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(-camX, -camY); // everything below is drawn in world coordinates

      drawAura();

      // Draw XP Gems
      gems.forEach((g) => {
        ctx.fillStyle = g.value > 4 ? '#ffd166' : '#06d6a0';
        ctx.beginPath();
        ctx.moveTo(g.x, g.y - g.radius);
        ctx.lineTo(g.x + g.radius, g.y);
        ctx.lineTo(g.x, g.y + g.radius);
        ctx.lineTo(g.x - g.radius, g.y);
        ctx.closePath();
        ctx.fill();
      });

      uniqueDrops.forEach((drop) => {
        ctx.save();
        ctx.translate(drop.x, drop.y);
        ctx.rotate(performance.now() / 600 + drop.phase);
        ctx.shadowColor = '#ff2a5f';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ff2a5f';
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let point = 0; point < 8; point++) {
          const angle = point * Math.PI / 4 - Math.PI / 2;
          const radius = point % 2 === 0 ? drop.radius : drop.radius * 0.48;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw Boss Chests
      chests.forEach((c) => {
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(c.x - 14, c.y - 11, 28, 22);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x - 14, c.y - 11, 28, 22);
      });

      // Boss attack warnings + active attack effects
      drawBossTelegraphs(performance.now());

      // Draw Enemies & Bosses (pixel sprites)
      const nowMs = performance.now();
      enemies.forEach((e) => {
        drawShadow(e.x, e.y, e.radius);

        if (e.isBoss) {
          const bob = Math.round(Math.sin(nowMs / 200) * 2);
          const by = e.y - 8 + bob;
          if (e.aiState === 'WINDUP' && e.attack === 'BLINK') ctx.globalAlpha = 0.45 + 0.4 * Math.abs(Math.sin(nowMs / 60));
          drawSprite(SPR.boss[e.spriteIdx], e.x, by, 3);
          ctx.globalAlpha = 1;

          // Flash gold while dashing, pulse while winding up an attack
          const winding = e.aiState === 'WINDUP';
          if (e.aiState === 'DASHING' || (winding && Math.floor(e.stateTimer / 5) % 2 === 0)) {
            ctx.globalAlpha = e.aiState === 'DASHING' ? 0.6 : 0.4;
            drawSprite(SPR.bossFlash[e.spriteIdx], e.x, by, 3);
            ctx.globalAlpha = 1;
          }

          // Boss HP Bar
          const bw = 74;
          ctx.fillStyle = '#222';
          ctx.fillRect(e.x - bw / 2, e.y - 60, bw, 7);
          ctx.fillStyle = '#ff2a5f';
          ctx.fillRect(e.x - bw / 2, e.y - 60, bw * Math.max(0, e.hp / e.maxHp), 7);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 1;
          ctx.strokeRect(e.x - bw / 2 - 0.5, e.y - 60.5, bw + 1, 8);
        } else {
          const frames = SPR[e.kind];
          const fr = Math.floor(nowMs / (e.kind === 'bat' ? 110 : (e.kind === 'spiderling' ? 90 : ((e.kind === 'occultist' || e.kind === 'triad') ? 150 : 190))) + e.phase) % 2;
          const lift = e.kind === 'bat' ? 0 : (e.kind === 'brute' ? -4 : (e.kind === 'spiderling' ? -1 : -3));
          drawSprite(frames[fr], e.x, e.y + lift + (fr && e.kind !== 'bat' && e.kind !== 'spiderling' ? -1 : 0), 2);
        }
      });

      drawBlades();


      // Draw Enemy Projectiles
      enemyProjectiles.forEach((ep) => {
        const projectileColor = ep.color || '#06d6a0';
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = projectileColor;
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.radius * 1.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = projectileColor;
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // Skill projectiles + boss projectiles
      drawPlayerProjectiles();
      drawBossShots();

      // Draw Player (pixel sprite + name tag)
      if (player.shieldActive) {
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.72 + Math.sin(performance.now() / 120) * 0.18})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 9, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawShadow(player.x, player.y, player.radius);
      if (player.invuln % 6 < 3) {
        const pf = player.moving ? Math.floor(performance.now() / 120) % 2 : 0;
        drawSprite(SPR.players[player.champId][pf], player.x, player.y - 3 - (pf ? 1 : 0), 2);
      }
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeText(player.name, player.x, player.y - 26);
      ctx.lineJoin = 'miter';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(player.name, player.x, player.y - 26);

      // Draw Particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
      });

      // Draw Floating Texts (world space)
      floatingTexts.forEach((ft) => {
        if (ft.screen) return;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      });

      ctx.restore();
      ctx.restore();

      // ---- Virtual Joystick Overlay (mobile) ----
      if (joystick.active) {
        // Clamp the visual base to canvas bounds so it's always fully visible,
        // even when the finger started outside the canvas (off-screen area).
        const pad = joystick.maxR + 4;
        const baseX = Math.max(pad, Math.min(canvas.width  - pad, joystick.startX));
        const baseY = Math.max(pad, Math.min(canvas.height - pad, joystick.startY));

        ctx.save();
        // Base ring
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(24,24,34,0.5)';
        ctx.beginPath();
        ctx.arc(baseX, baseY, joystick.maxR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = 'rgba(255,209,102,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(baseX, baseY, joystick.maxR * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // Knob: position relative to clamped base using tracked dx/dy
        const knobX = baseX + joystick.dx * joystick.maxR;
        const knobY = baseY + joystick.dy * joystick.maxR;
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(knobX, knobY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // ---- Screen-space overlay ----
      // Banners (boss warning)
      floatingTexts.forEach((ft) => {
        if (!ft.screen) return;
        ctx.globalAlpha = Math.min(1, ft.life / 25);
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.lineJoin = 'miter';
        ctx.globalAlpha = 1;
      });

      // Arrows at the screen edge pointing to boss chests that are off-screen
      const vw = canvas.width;
      const vh = canvas.height;
      const edge = 26;
      chests.forEach((c) => {
        const sx = vw / 2 + (c.x - camX - vw / 2) * gameZoom;
        const sy = vh / 2 + (c.y - camY - vh / 2) * gameZoom;
        if (sx > 0 && sx < vw && sy > 0 && sy < vh) return;
        const dx = sx - vw / 2;
        const focusY = vh / 2 + gameViewOffsetY;
        const dy = sy - focusY;
        const topEdge = gameViewOffsetY ? 72 + edge : edge;
        const verticalSpace = dy < 0 ? focusY - topEdge : vh - edge - focusY;
        const k = Math.min((vw / 2 - edge) / (Math.abs(dx) || 1e-6), verticalSpace / (Math.abs(dy) || 1e-6));
        ctx.save();
        ctx.translate(vw / 2 + dx * k, focusY + dy * k);
        ctx.rotate(Math.atan2(dy, dx));
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(performance.now() / 180);
        ctx.fillStyle = '#ffd166';
        ctx.strokeStyle = '#07070c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -9);
        ctx.lineTo(-8, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    function gameLoop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      draw();
      requestAnimationFrame(gameLoop);
    }

    // =====================================================================
    // PLAYER NAME + SCORES  (saved to MySQL through api.php)
    // =====================================================================
    const SCORE_API = 'api.php';
    const LS_NAME = 'sth_player_name';
    const LS_RUNS = 'sth_runs';
    const LS_MUSIC_VOLUME = 'sth_music_volume';
    let playerName = '';
    let pendingSubmit = Promise.resolve();

    function lsGet(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    }
    function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* storage unavailable */ } }
    const storedMusicVolume = Number(lsGet(LS_MUSIC_VOLUME, '0.5'));
    const initialMusicVolume = Number.isFinite(storedMusicVolume)
      ? Math.min(1, Math.max(0, storedMusicVolume))
      : 0.5;
    backgroundMusic.volume = initialMusicVolume;
    musicVolumeSlider.value = String(Math.round(initialMusicVolume * 100));
    musicVolumeSlider.addEventListener('input', () => {
      const volume = Number(musicVolumeSlider.value) / 100;
      backgroundMusic.volume = volume;
      lsSet(LS_MUSIC_VOLUME, String(volume));
    });
    function loadRuns() { try { return JSON.parse(lsGet(LS_RUNS, '[]')) || []; } catch (e) { return []; } }
    function storeRuns(runs) { lsSet(LS_RUNS, JSON.stringify(runs.slice(-200))); }
    function esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function makeRunId() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }

    async function api(method, params, body) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const url = SCORE_API + (params ? '?' + new URLSearchParams(params) : '');
        const res = await fetch(url, {
          method,
          signal: ctrl.signal,
          cache: 'no-store',
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          const err = new Error(data.error || 'Request failed');
          err.status = res.status;
          throw err;
        }
        return data;
      } finally {
        clearTimeout(timer);
      }
    }

    function postRun(run) {
      return api('POST', null, {
        action: 'submit',
        run_id: run.run_id,
        name: run.name,
        champion: run.champion,
        time: run.time,
        kills: run.kills,
        level: run.level
      });
    }

    function markSynced(id) {
      const runs = loadRuns();
      const r = runs.find((x) => x.run_id === id);
      if (r) { r.synced = true; storeRuns(runs); }
    }

    // Every run is kept locally first; it is marked "synced" once MySQL accepts it.
    async function submitRun(run) {
      const runs = loadRuns();
      runs.push({ ...run, synced: false });
      storeRuns(runs);
      try {
        const data = await postRun(run);
        markSynced(run.run_id);
        flushUnsynced();
        return data;
      } catch (e) {
        return null;
      }
    }

    async function flushUnsynced() {
      for (const run of loadRuns().filter((r) => !r.synced)) {
        try {
          await postRun(run);
          markSynced(run.run_id);
        } catch (e) {
          if (e.status === 400) markSynced(run.run_id); // rejected by validation: don't retry forever
          else break; // server still offline
        }
      }
    }

    // ---------- Name screen ----------
    function spriteImgHTML(c, px, i) {
      return `<img alt="" src="${c.toDataURL()}" style="width:${c.width * px}px;height:${c.height * px}px;animation-delay:${(i * 0.12).toFixed(2)}s">`;
    }

    function buildCast() {
      const cast = [
        ...CHAMPIONS.map((ch) => SPR.players[ch.id][0]),
        SPR.grunt[0], SPR.bat[0], SPR.brute[0], SPR.occultist[0], SPR.triad[0], SPR.boss[0]
      ];
      castRow.innerHTML = cast.map((c, i) => spriteImgHTML(c, 3, i)).join('');
    }

    function updatePlayerChip() {
      playerChip.textContent = playerName ? `Player: ${playerName}` : '';
      playerChip.classList.toggle('hidden', !playerName);
      charPlayerName.textContent = playerName;
    }

    function showNameScreen() {
      gameState = 'NAME_ENTRY';
      backgroundMusic.pause();
      leaderboardEnabled = true;
      myBtn.classList.remove('hidden');
      gameoverScoresBtn.classList.remove('hidden');
      gameoverModal.classList.add('hidden');
      charModal.classList.add('hidden');
      levelupModal.classList.add('hidden');
      chestModal.classList.add('hidden');
      scoresModal.classList.add('hidden');
      skillGuideModal.classList.add('hidden');
      nameModal.classList.remove('hidden');
      nameInput.value = playerName;
      nameError.textContent = '';
      setTimeout(() => nameInput.focus(), 0);
    }

    function confirmName() {
      const v = nameInput.value.trim().replace(/\s+/g, ' ');
      if (!/^[\p{L}\p{N} _.\-]{1,16}$/u.test(v)) {
        nameError.textContent = 'Use 1–16 letters, numbers, spaces, _ - or .';
        return;
      }
      playerName = v;
      lsSet(LS_NAME, v);
      updatePlayerChip();
      leaderboardEnabled = true;
      myBtn.classList.remove('hidden');
      gameoverScoresBtn.classList.remove('hidden');
      charModeSubtitle.textContent = 'Survive escalating hordes & dodge telegraphed Overlord boss attacks!';
      RetroSynth.init();
      nameModal.classList.add('hidden');
      charModal.classList.remove('hidden');
      gameState = 'CHAR_SELECT';
    }

    nameStartBtn.addEventListener('click', confirmName);
    quickPlayBtn.addEventListener('click', () => {
      RetroSynth.init();
      leaderboardEnabled = false;
      myBtn.classList.add('hidden');
      gameoverScoresBtn.classList.add('hidden');
      charModeSubtitle.textContent = 'Just Play mode: this run will not be recorded on the leaderboard.';
      charPlayerName.textContent = playerName;
      nameModal.classList.add('hidden');
      charModal.classList.remove('hidden');
      gameState = 'CHAR_SELECT';
    });
    nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmName(); });
    changeNameBtn.addEventListener('click', showNameScreen);
    charTitleBtn.addEventListener('click', showNameScreen);
    gameoverTitleBtn.addEventListener('click', showNameScreen);

    // ---------- Scores modal ----------
    let scoresTab = 'my';
    let scoresSort = 'kills';
    let scoresReq = 0;
    let pausedForScores = false;
    let pausedForSkillGuide = false;

    function renderSkillGuide() {
      const weaponPaths = Object.entries(WEAPON_DEFS).map(([key, weapon]) => {
        const catalyst = PASSIVE_DEFS[weapon.catalyst];
        return `
          <article class="skill-tree-card">
            <div class="skill-path">${weapon.name} <span>Lv.1 → Lv.5</span></div>
            <p class="skill-detail">${weapon.desc}</p>
            <div class="skill-path"><span>+ Catalyst:</span> ${catalyst.name}</div>
            <div class="skill-path">→ ${weapon.evoName}</div>
            <p class="skill-detail">${weapon.evoDesc}</p>
          </article>`;
      }).join('');
      const passiveSkills = Object.values(PASSIVE_DEFS).map((passive) => `
        <article class="skill-passive-card">
          <strong>${passive.name}</strong>
          <p>${passive.desc}</p>
        </article>`).join('');
      const championBuilds = CHAMPIONS.map((champion) => {
        const weapon = WEAPON_DEFS[champion.startWeapon];
        const catalyst = PASSIVE_DEFS[weapon.catalyst];
        return `
          <article class="skill-build-card">
            <strong>${champion.name}</strong>
            <p>Start with ${weapon.name}. Pair it with ${catalyst.name} to unlock ${weapon.evoName} after the weapon reaches Lv.5.</p>
            <p>Champion bonus: ${champion.passiveText}</p>
          </article>`;
      }).join('');

      skillGuideContent.innerHTML = `
        <section class="skill-section">
          <h2>Weapon Evolution Tree</h2>
          <p class="skill-section-intro">Raise a weapon to Lv.5 and own at least one rank of its matching catalyst. The evolution then appears as an upgrade choice.</p>
          <div class="skill-tree-grid">${weaponPaths}</div>
        </section>
        <section class="skill-section">
          <h2>Champion Combos</h2>
          <div class="skill-build-grid">${championBuilds}</div>
        </section>
        <section class="skill-section">
          <h2>Passive Skills</h2>
          <div class="skill-passive-grid">${passiveSkills}</div>
        </section>`;
    }

    function openSkillGuide() {
      renderSkillGuide();
      if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pausedForSkillGuide = true;
      }
      skillGuideModal.classList.remove('hidden');
    }

    function closeSkillGuide() {
      skillGuideModal.classList.add('hidden');
      if (pausedForSkillGuide) {
        pausedForSkillGuide = false;
        gameState = 'PLAYING';
        lastTime = performance.now();
      }
    }

    skillsBtn.addEventListener('click', openSkillGuide);
    nameSkillsBtn.addEventListener('click', openSkillGuide);
    charSkillsBtn.addEventListener('click', openSkillGuide);
    skillGuideCloseBtn.addEventListener('click', closeSkillGuide);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !skillGuideModal.classList.contains('hidden')) closeSkillGuide();
    });

    function champLabel(id) {
      const c = CHAMPIONS.find((x) => x.id === id);
      return c ? c.name.split(' ')[0] : id;
    }
    function fmtDate(ts) {
      return new Date(ts * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    function statsFrom(rows) {
      return {
        runs: rows.length,
        best_kills: Math.max(0, ...rows.map((r) => r.kills)),
        best_time: Math.max(0, ...rows.map((r) => r.time)),
        total_kills: rows.reduce((a, r) => a + r.kills, 0)
      };
    }
    function localRows(name) {
      return loadRuns()
        .filter((r) => !name || r.name.toLowerCase() === name.toLowerCase())
        .map((r) => ({ name: r.name, champion: r.champion, time: r.time, kills: r.kills, level: r.level, ts: r.ts }));
    }

    async function renderScores() {
      const req = ++scoresReq;
      const isMy = scoresTab === 'my';
      scoreSortRow.classList.toggle('hidden', isMy);
      scoreSummary.innerHTML = '';
      scoreStatus.className = 'score-status';
      scoreStatus.textContent = '';

      if (isMy && !playerName) {
        scoreTableWrap.innerHTML = '<div class="score-empty">Enter your player name to see your scores.</div>';
        return;
      }
      scoreTableWrap.innerHTML = '<div class="score-empty">Loading…</div>';
      await pendingSubmit; // let a just-finished run reach the database first

      let rows;
      let stats = null;
      let online = true;
      try {
        if (isMy) {
          const d = await api('GET', { action: 'my', name: playerName });
          rows = d.rows;
          stats = d.stats;
        } else {
          const d = await api('GET', { action: 'top', sort: scoresSort, limit: 20 });
          rows = d.rows;
        }
      } catch (e) {
        online = false;
        rows = localRows(isMy ? playerName : '');
        if (isMy) rows.sort((a, b) => b.ts - a.ts);
        else if (scoresSort === 'time') rows.sort((a, b) => b.time - a.time || b.kills - a.kills);
        else rows.sort((a, b) => b.kills - a.kills || b.time - a.time);
        rows = rows.slice(0, isMy ? 50 : 20);
        if (isMy) stats = statsFrom(rows);
      }
      if (req !== scoresReq) return; // a newer render took over

      if (stats && stats.runs > 0) {
        const box = (v, label) => `<div class="sum-box"><strong>${v}</strong><span>${label}</span></div>`;
        scoreSummary.innerHTML =
          box(stats.runs, 'Runs') +
          box(stats.best_kills, 'Best kills') +
          box(formatTime(stats.best_time), 'Best time') +
          box(stats.total_kills, 'Total kills');
      }

      if (!rows.length) {
        scoreTableWrap.innerHTML = `<div class="score-empty">${isMy ? 'No runs yet. Go survive the horde!' : 'No scores yet. Be the first!'}</div>`;
      } else {
        const me = playerName.toLowerCase();
        const head = isMy
          ? '<th>Date</th><th>Hero</th><th>Time</th><th>Kills</th><th>Lvl</th>'
          : '<th>#</th><th>Player</th><th>Hero</th><th>Time</th><th>Kills</th><th>Lvl</th>';
        const body = rows.map((r, i) => {
          const cells = isMy
            ? `<td>${fmtDate(Number(r.ts))}</td>`
            : `<td>${i + 1}</td><td>${esc(r.name)}</td>`;
          const mine = !isMy && String(r.name).toLowerCase() === me ? ' class="me"' : '';
          return `<tr${mine}>${cells}<td>${esc(champLabel(r.champion))}</td><td>${formatTime(Number(r.time))}</td><td>${Number(r.kills)}</td><td>${Number(r.level)}</td></tr>`;
        }).join('');
        scoreTableWrap.innerHTML = `<table class="score-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
      }

      if (online) {
        scoreStatus.textContent = 'Connected to the MySQL score database.';
      } else {
        scoreStatus.className = 'score-status offline';
        scoreStatus.textContent = 'Server unreachable — showing runs saved on this device.';
      }
    }

    function setTab(tab) {
      scoresTab = tab;
      scoresModal.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
      renderScores();
    }

    function openScores(tab) {
      if (gameState === 'PLAYING') { gameState = 'PAUSED'; pausedForScores = true; }
      scoresModal.classList.remove('hidden');
      setTab(tab);
    }

    function closeScores() {
      scoresModal.classList.add('hidden');
      if (pausedForScores) {
        pausedForScores = false;
        gameState = 'PLAYING';
        lastTime = performance.now();
      }
    }

    myBtn.addEventListener('click', () => openScores(playerName ? 'my' : 'top'));
    gameoverScoresBtn.addEventListener('click', () => openScores('my'));
    scoresCloseBtn.addEventListener('click', closeScores);
    scoresModal.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
    scoresModal.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
      scoresSort = b.dataset.sort;
      scoresModal.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === b));
      renderScores();
    }));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !scoresModal.classList.contains('hidden')) closeScores();
    });

    // ---------- Boot ----------
    playerName = lsGet(LS_NAME, '');
    updatePlayerChip();
    buildCast();
    initCharSelect();
    showNameScreen();
    flushUnsynced();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);

    // ── Responsive scaling + centering (landscape, portrait, desktop) ────────
    (function () {
      const scaler = document.getElementById('game-scaler');
      // Native unscaled dimensions of the whole game block
      const NATIVE_W = 904;
      const BASE_CANVAS_W = canvas.width;
      const BASE_CANVAS_H = canvas.height;
      let   NATIVE_H = 0; // measured live from DOM so borders/padding are included

      function getViewport() {
        // visualViewport is accurate on mobile (excludes on-screen keyboard, etc.)
        if (window.visualViewport) {
          return { w: window.visualViewport.width, h: window.visualViewport.height };
        }
        return { w: window.innerWidth, h: window.innerHeight };
      }

      function resizeGame() {
        // Measure native height once from real DOM (offsetHeight ignores transforms)
        if (!NATIVE_H) NATIVE_H = scaler.offsetHeight || 650;

        const { w: vw, h: vh } = getViewport();

        if (window.matchMedia('(max-width: 700px), (pointer: coarse)').matches) {
          scaler.classList.add('mobile-layout');
          scaler.style.width = vw + 'px';
          scaler.style.height = vh + 'px';
          scaler.style.transform = 'none';
          gameZoom = vw > vh ? 0.82 : 1;
          gameViewOffsetY = vw > vh ? 36 : 0;

          const width = Math.max(1, Math.round(vw));
          const height = Math.max(1, Math.round(vh));
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingEnabled = false;
          }
          if (Number.isFinite(player.x) && Number.isFinite(player.y)) {
            camera.x = player.x - canvas.width / 2;
            camera.y = player.y - canvas.height / 2 - gameViewOffsetY / gameZoom;
          }
          return;
        }

        scaler.classList.remove('mobile-layout');
        scaler.style.width = '';
        scaler.style.height = '';
        gameZoom = 1;
        gameViewOffsetY = 0;
        if (canvas.width !== BASE_CANVAS_W || canvas.height !== BASE_CANVAS_H) {
          canvas.width = BASE_CANVAS_W;
          canvas.height = BASE_CANVAS_H;
          ctx.imageSmoothingEnabled = false;
        }

        // Uniformly scale to use the available viewport while preserving aspect ratio.
        const scale = Math.min(vw / NATIVE_W, vh / NATIVE_H);

        // Translate so the scaled block sits in the exact centre of the viewport
        const scaledW = NATIVE_W * scale;
        const scaledH = NATIVE_H * scale;
        const tx = Math.round((vw - scaledW) / 2);
        const ty = Math.round((vh - scaledH) / 2);

        scaler.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      }

      // Run once after first paint so NATIVE_H can be measured
      requestAnimationFrame(function () {
        NATIVE_H = scaler.offsetHeight || 650;
        resizeGame();
      });

      window.addEventListener('resize', resizeGame);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resizeGame);
      }
      window.addEventListener('orientationchange', function () {
        setTimeout(resizeGame, 150); // let browser settle after rotation
      });
    })();
