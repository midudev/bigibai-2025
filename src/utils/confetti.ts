import confetti from "canvas-confetti";

export default confetti;

/**
 * Lanza confeti en las esquinas inferiores del viewport
*/
export function throwConfetti() {
  confetti({
    colors: ["#f8b134"],
    particleCount: 100,
    spread: 100,
    angle: 60,
    origin: { x: 0, y : 1}
  });
  confetti({
    colors: ["#f8b134"],
    particleCount: 100,
    spread: 100,
    angle: 120,
    origin: { x: 1, y : 1 }
  });
}

/**
 * Lanza confeti mediante un canvas.
 * Importante tener <canvas id="confetti-canvas" /> en el HTML y obtenerlo mediante su id en <script>.
 * @param canvas - HTMLCanvasElement
 * @param confettiObject - confetti.Options[] | Por defecto, lanza confeti en la parte superior del canvas.
 */
export function throwConfettiByCanvas(
  canvas: HTMLCanvasElement,
  confettiObject: confetti.Options[] = [
    {
      colors: ["#f8b134"],
      particleCount: 100,
      spread: 150,
      angle: 45,
      origin: { x : 0, y : 0 }
    },
    {
      colors: ["#f8b134"],
      particleCount: 200,
      spread: 400,
      angle: 90,
      origin: { x : 0.5, y : 0 }
    },
    {
      colors: ["#f8b134"],
      particleCount: 100,
      spread: 150,
      angle: 135,
      origin: { x : 1, y : 0 }
    }
  ]
) {
  canvas.classList = "t-0 l-0 w-full h-full absolute";
  canvas.style.pointerEvents = "none";
  const confettiClass = confetti.create(canvas, { resize: true, useWorker: true });
  
  confettiObject.map(obj => confettiClass(obj));
}
