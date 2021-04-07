import { QuickPollRepository } from '../../data/QuickPollRepository'
import { StatefulQuickPoll } from '../entities/StatefulQuickPoll'

export interface SaveQuickPollAsAnsweredInteractor {
  execute(request: {
    quickPollId: string
    answerId: string
  }): Promise<StatefulQuickPoll>
}

export class SaveQuickPollAsAnsweredInteractorImplementation
  implements SaveQuickPollAsAnsweredInteractor {
  private quickPollRepository: QuickPollRepository

  constructor(quickPollRepository: QuickPollRepository) {
    this.quickPollRepository = quickPollRepository
  }

  public async execute(request: {
    quickPollId: string
    answerId: string
  }): Promise<StatefulQuickPoll> {
    const poll = await this.quickPollRepository.sendQuickPollAnswer(
      request.answerId,
    )
    await this.quickPollRepository.saveAnsweredQuickPoll(request.quickPollId)

    // refresh the 'quick polls list' cache
    await this.quickPollRepository.getQuickPolls('remote')
    return {
      ...poll,
      state: 'answered',
    }
  }
}
