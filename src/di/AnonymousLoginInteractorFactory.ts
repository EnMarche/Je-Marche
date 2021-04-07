import {
  AnonymousLoginInteractor,
  AnonymousLoginInteractorImplementation,
} from '../core/interactor/AnonymousLoginInteractor'
import { AuthenticationRepository } from '../data/AuthenticationRepository'
import { ProfileRepository } from '../data/ProfileRepository'

export class AnonymousLoginInteractorFactory {
  private authenticationRepository: AuthenticationRepository
  private profileRepository: ProfileRepository

  constructor(
    authenticationRepository: AuthenticationRepository,
    profileRepository: ProfileRepository,
  ) {
    this.authenticationRepository = authenticationRepository
    this.profileRepository = profileRepository
  }

  makeInstance(): AnonymousLoginInteractor {
    return new AnonymousLoginInteractorImplementation(
      this.authenticationRepository,
      this.profileRepository,
    )
  }
}
