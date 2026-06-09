/**
 * Reproduce un pitido corto idéntico al de un escáner de código de barras real.
 * Usa Web Audio API — sin archivos externos, funciona offline.
 */
export function beepEscaner(): void {
  try {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // 1880 Hz — tono agudo típico de pistola lectora de retail
    osc.type = 'square'
    osc.frequency.setValueAtTime(1880, ctx.currentTime)

    // Volumen: sube de golpe y decae en 90ms
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.09)

    // Liberar contexto tras el pitido
    osc.onended = () => ctx.close()
  } catch {
    // Silenciar cualquier error (política de autoplay, contexto cerrado, etc.)
  }
}
