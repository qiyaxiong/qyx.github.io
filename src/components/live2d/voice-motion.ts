export interface VoiceMotionTarget {
  setParameterValueById(id: string, value: number): void
}

export function applySpeechSway(target: VoiceMotionTarget, elapsedSeconds: number): void {
  const upperBodyPhase = Math.sin(elapsedSeconds * 1.35)
  target.setParameterValueById('ParamBodyAngleZ', upperBodyPhase * 6)
  target.setParameterValueById('ParamBodyAngleX', Math.sin(elapsedSeconds * 1.05) * 2.5)
  target.setParameterValueById('ParamAngleZ', Math.sin(elapsedSeconds * 1.35 + 0.35) * 4)
}

export function resetSpeechSway(target: VoiceMotionTarget): void {
  target.setParameterValueById('ParamAngleZ', 0)
  target.setParameterValueById('ParamBodyAngleX', 0)
  target.setParameterValueById('ParamBodyAngleZ', 0)
}
