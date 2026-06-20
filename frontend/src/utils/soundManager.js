class SoundManager {
  constructor() {
    this.isMuted = localStorage.getItem('arena_sound_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('arena_sound_volume') || '0.5');
    this.audioCtx = null;
  }

  // Lazy initialize AudioContext on user interaction
  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    localStorage.setItem('arena_sound_muted', mute);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('arena_sound_volume', this.volume);
  }

  playTone(freqStart, freqEnd, duration, type = 'sine', gainStart = 0.3) {
    if (this.isMuted) return;
    this.init();
    
    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, this.audioCtx.currentTime);
      
      if (freqEnd && freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, this.audioCtx.currentTime + duration);
      }
      
      gainNode.gain.setValueAtTime(gainStart * this.volume, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio playback blocked or failed', e);
    }
  }

  playClick() {
    this.playTone(600, 300, 0.08, 'sine', 0.25);
  }

  playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    // Simulate dice rolling with rapid small high-pitched tap-like clicks
    let time = 0;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(300 - (i * 20), 100, 0.05, 'triangle', 0.15);
      }, time);
      time += 80;
    }
  }

  playSnakeBite() {
    // Sad slider descending down in pitch
    this.playTone(400, 80, 0.6, 'sawtooth', 0.2);
    setTimeout(() => {
      this.playTone(200, 50, 0.5, 'sine', 0.3);
    }, 150);
  }

  playLadderClimb() {
    // Joyful ascending arpeggio notes
    if (this.isMuted) return;
    this.init();
    const notes = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25]; // C3, E3, G3, C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq + 50, 0.15, 'sine', 0.25);
      }, idx * 70);
    });
  }

  playTrap() {
    // Cyber glitch/warning trap sound: buzzing saw wave sliding down then up
    this.playTone(300, 120, 0.25, 'sawtooth', 0.22);
    setTimeout(() => {
      this.playTone(150, 80, 0.35, 'triangle', 0.25);
    }, 120);
  }

  playBooster() {
    // Sci-fi high tech booster sound: sweeping fast upward sine wave
    this.playTone(400, 1200, 0.4, 'sine', 0.2);
  }


  playAchievementUnlock() {
    // Sparkly chime
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq, 0.25, 'sine', 0.2);
      }, idx * 60);
    });
  }

  playVictory() {
    // Fanfare!
    if (this.isMuted) return;
    this.init();
    const delays = [0, 150, 300, 450, 600];
    const chords = [
      [261.63, 329.63, 392.00], // C4, E4, G4
      [329.63, 392.00, 523.25], // E4, G4, C5
      [392.00, 523.25, 659.25], // G4, C5, E5
      [523.25, 659.25, 783.99], // C5, E5, G5
      [523.25, 659.25, 783.99, 1046.50] // Final major triad + octave
    ];

    chords.forEach((chord, step) => {
      setTimeout(() => {
        chord.forEach(freq => {
          this.playTone(freq, freq, step === 4 ? 1.5 : 0.4, 'sine', 0.12);
        });
      }, delays[step]);
    });
  }
}

const soundManager = new SoundManager();
export default soundManager;
