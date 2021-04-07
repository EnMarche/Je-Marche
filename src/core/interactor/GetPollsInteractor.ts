import AuthenticationRepository from '../../data/AuthenticationRepository'
import { DataSource } from '../../data/DataSource'
import { PollsRepository } from '../../data/PollsRepository'
import ProfileRepository from '../../data/ProfileRepository'
import { AuthenticationState } from '../entities/AuthenticationState'
import { Poll } from '../entities/Poll'

export interface GetPollsInteractor {
  execute(dataSource: DataSource): Promise<Array<Poll>>
}

export class GetPollsInteractorImplementation implements GetPollsInteractor {
  private pollsRepository: PollsRepository
  private profileRepository: ProfileRepository
  private authenticationRepository: AuthenticationRepository

  constructor(
    pollsRepository: PollsRepository,
    profileRepository: ProfileRepository,
    authenticationRepository: AuthenticationRepository,
  ) {
    this.pollsRepository = pollsRepository
    this.profileRepository = profileRepository
    this.authenticationRepository = authenticationRepository
  }

  public async execute(
    dataSource: DataSource = 'remote',
  ): Promise<Array<Poll>> {
    const state = await this.authenticationRepository.getAuthenticationState()
    let zipCode: string | undefined
    if (state === AuthenticationState.Anonymous) {
      zipCode = await this.profileRepository.getZipCode()
    } else {
      zipCode = undefined
    }
    return this.pollsRepository.getPolls(zipCode, dataSource)
  }
}
