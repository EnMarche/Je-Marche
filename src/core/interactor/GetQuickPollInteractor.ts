import { DataSource } from '../../data/DataSource'
import { QuickPollRepository } from '../../data/QuickPollRepository'
import { StatefulQuickPoll } from '../entities/StatefulQuickPoll'

export interface GetQuickPollInteractor {
  execute(dataSource: DataSource): Promise<StatefulQuickPoll | undefined>
}

export class GetQuickPollInteractorImplementation
  implements GetQuickPollInteractor {
  private quickPollRepository: QuickPollRepository

  constructor(quickPollRepository: QuickPollRepository) {
    this.quickPollRepository = quickPollRepository
  }

  public async execute(
    dataSource: DataSource = 'remote',
  ): Promise<StatefulQuickPoll | undefined> {
    const polls = await this.quickPollRepository.getQuickPolls(dataSource)
    if (polls.length === 0) {
      return undefined
    }
    const poll = polls[0]
    const answeredPollsIds = await this.quickPollRepository.getAnsweredQuickPolls()
    return {
      ...poll,
      state: answeredPollsIds.includes(poll.id) ? 'answered' : 'pending',
    }
  }
}
