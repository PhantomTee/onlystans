export function rpmToPWM(rpm: number, maxRPM = 110): number {
  return Math.round((rpm / maxRPM) * 255)
}

export function pwmToRPM(pwm: number, maxRPM = 110): number {
  return Math.round((pwm / 255) * maxRPM)
}

export function addGaussianNoise(value: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return value + z * stdDev
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
