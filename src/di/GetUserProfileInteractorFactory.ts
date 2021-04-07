import {
  GetUserProfileInteractor,
  GetUserProfileInteractorImplementation,
} from '../core/interactor/GetUserProfileInteractor'
import AuthenticationRepository from '../data/AuthenticationRepository'
import { ProfileRepository } from '../data/ProfileRepository'
import RegionsRepository from '../data/RegionsRepository'

export class GetUserProfileInteractorFactory {
  private profileRepository: ProfileRepository
  private regionsRepository: RegionsRepository
  private authenticationRepository: AuthenticationRepository

  constructor(
    profileRepository: ProfileRepository,
    regionsRepository: RegionsRepository,
    authenticationRepository: AuthenticationRepository,
  ) {
    this.profileRepository = profileRepository
    this.regionsRepository = regionsRepository
    this.authenticationRepository = authenticationRepository
  }

  makeInstance(): GetUserProfileInteractor {
    return new GetUserProfileInteractorImplementation(
      this.profileRepository,
      this.regionsRepository,
      this.authenticationRepository,
    )
  }
}
