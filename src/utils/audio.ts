// Audio utilities for Boss Time Tracker alerts

// Global AudioContext to persist across calls and handle browser restrictions
let globalAudioContext: AudioContext | null = null;

// Initialize AudioContext on first user interaction
function getAudioContext(): AudioContext {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Resume context if it was suspended by browser autoplay policy
    if (globalAudioContext.state === 'suspended') {
      globalAudioContext.resume().catch(err => {
        console.warn('AudioContext resume failed:', err);
      });
    }
  }
  return globalAudioContext;
}

// Initialize audio context on any user interaction to bypass autoplay restrictions
if (typeof window !== 'undefined') {
  const initAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.warn('Could not initialize audio context:', e);
    }
  };

  // Listen to multiple events to ensure audio is enabled
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, initAudio, { once: true });
  });
}

export function playAlertSound(): void {
  try {
    const audioContext = getAudioContext();

    // Ensure context is running
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        playBeepSequence(audioContext);
      }).catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    } else {
      playBeepSequence(audioContext);
    }

  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
}

function playBeepSequence(audioContext: AudioContext): void {
  // Create oscillator for beep sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configure beep sound (800Hz, 0.3s duration)
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  // Fade in/out to avoid clicks
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

  // Play beep
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);

  // Play three beeps with intervals
  setTimeout(() => {
    playBeep(audioContext);
  }, 400);

  setTimeout(() => {
    playBeep(audioContext);
  }, 800);
}

function playBeep(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

export function testAlertSound(): void {
  playAlertSound();
}
