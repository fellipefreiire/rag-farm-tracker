// Audio utilities for Boss Time Tracker alerts

export function playAlertSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

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

  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
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
