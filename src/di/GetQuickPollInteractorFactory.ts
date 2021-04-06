import {
  GetQuickPollInteractor,
  GetQuickPollInteractorImplementation,
} from '../core/interactor/GetQuickPollInteractor'
import { QuickPollRepository } from '../data/QuickPollRepository'

export class GetQuickPollInteractorFactory {
  private quickPollRepository: QuickPollRepository

  constructor(quickPollRepository: QuickPollRepository) {
    this.quickPollRepository = quickPollRepository
  }

  makeInstance(): GetQuickPollInteractor {
    return new GetQuickPollInteractorImplementation(this.quickPollRepository)
  }
}
