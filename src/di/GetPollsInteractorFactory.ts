import {
  GetPollsInteractor,
  GetPollsInteractorImplementation,
} from '../core/interactor/GetPollsInteractor'
import { AuthenticationRepository } from '../data/AuthenticationRepository'
import { PollsRepository } from '../data/PollsRepository'
import { ProfileRepository } from '../data/ProfileRepository'

export class GetPollsInteractorFactory {
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

  makeInstance(): GetPollsInteractor {
    return new GetPollsInteractorImplementation(
      this.pollsRepository,
      this.profileRepository,
      this.authenticationRepository,
    )
  }
}
