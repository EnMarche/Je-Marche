import {
  SaveQuickPollAsAnsweredInteractor,
  SaveQuickPollAsAnsweredInteractorImplementation,
} from '../core/interactor/SaveQuickPollAsAnsweredInteractor'
import { QuickPollRepository } from '../data/QuickPollRepository'

export class SaveQuickPollAsAnsweredInteractorFactory {
  private quickPollRepository: QuickPollRepository

  constructor(quickPollRepository: QuickPollRepository) {
    this.quickPollRepository = quickPollRepository
  }

  makeInstance(): SaveQuickPollAsAnsweredInteractor {
    return new SaveQuickPollAsAnsweredInteractorImplementation(
      this.quickPollRepository,
    )
  }
}
