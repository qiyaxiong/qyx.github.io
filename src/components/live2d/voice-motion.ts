export interface VoiceMotionTarget {
  setParameterValueById(id: string, value: number): void
}

export interface AvatarSwayTarget {
  position: { x: number }
  rotation: number
}

export function applySpeechSway(target: VoiceMotionTarget, elapsedSeconds: number): void {
  target.setParameterValueById('ParamAngleZ', Math.sin(elapsedSeconds * 1.7) * 6)
  target.setParameterValueById('ParamBodyAngleX', Math.sin(elapsedSeconds * 1.15) * 4)
}

export function applyAvatarSway(
  target: AvatarSwayTarget,
  centerX: number,
  elapsedSeconds: number
): void {
  target.position.x = centerX + Math.sin(elapsedSeconds * 1.7) * 10
  target.rotation = Math.sin(elapsedSeconds * 1.35) * 0.026
}

export function resetSpeechSway(target: VoiceMotionTarget): void {
  target.setParameterValueById('ParamAngleZ', 0)
  target.setParameterValueById('ParamBodyAngleX', 0)
}

export function resetAvatarSway(target: AvatarSwayTarget, centerX: number): void {
  target.position.x = centerX
  target.rotation = 0
}
