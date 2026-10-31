import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
  });
}

export function triggerGoldenRain() {
  const end = Date.now() + 1.5 * 1000;
  const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#10B981'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
