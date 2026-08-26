import type { Live2DEvent, Live2DSnapshot } from './client'
import {
  PerformanceRuntime,
  type CubismParameterTarget,
  type PerformanceCue,
  type PerformanceTarget,
  type RuntimeFrame
} from './performance-runtime'

export interface PerformanceAvatar {
  expression(name: string): Promise<unknown>
  motion(group: string, index: number): Promise<unknown>
  coreModel?: CubismParameterTarget
}

export class Live2DPerformanceHost {
  constructor(
    readonly runtime: PerformanceRuntime,
    private readonly avatar: () => PerformanceAvatar | undefined
  ) {}

  update(frame: RuntimeFrame): void {
    const model = this.avatar()?.coreModel
    if (model) this.runtime.update(model, frame)
  }

  async applySnapshot(snapshot: Live2DSnapshot): Promise<void> {
    if (snapshot.performance_target) this.runtime.setTarget(snapshot.performance_target)
    else this.runtime.reset()
    if (snapshot.active_cue) await this.applyCue(snapshot.active_cue)
  }

  async applyEvent(event: Live2DEvent): Promise<boolean> {
    if (event.type === 'live2d.performance.target') {
      this.runtime.setTarget(event.data as unknown as PerformanceTarget)
      return true
    }
    if (event.type === 'live2d.performance.cue') {
      await this.applyCue(event.data as unknown as PerformanceCue)
      return true
    }
    if (event.type === 'live2d.performance.reset') {
      this.runtime.reset()
      return true
    }
    return false
  }

  suspend(value: boolean): void {
    this.runtime.suspend(value)
  }

  private async applyCue(cue: PerformanceCue): Promise<void> {
    const avatar = this.avatar()
    if (!avatar) return
    this.runtime.setCue(cue)
    if (cue.expression) await avatar.expression(cue.expression)
    if (cue.motion_group) await avatar.motion(cue.motion_group, cue.motion_index || 0)
  }
}
