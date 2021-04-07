import {
  LoginInteractor,
  LoginInteractorImplementation,
} from '../core/interactor/LoginInteractor'
import { AuthenticationRepository } from '../data/AuthenticationRepository'
import { ProfileRepository } from '../data/ProfileRepository'
import { RegionsRepository } from '../data/RegionsRepository'
import { ThemeRepository } from '../data/ThemeRepository'

export class LoginInteractorFactory {
  private authenticationRepository: AuthenticationRepository
  private profileRepository: ProfileRepository
  private regionsRepository: RegionsRepository
  private themeRepository: ThemeRepository

  constructor(
    authenticationRepository: AuthenticationRepository,
    profileRepository: ProfileRepository,
    regionsRepository: RegionsRepository,
    themeRepository: ThemeRepository,
  ) {
    this.authenticationRepository = authenticationRepository
    this.profileRepository = profileRepository
    this.regionsRepository = regionsRepository
    this.themeRepository = themeRepository
  }

  makeInstance(): LoginInteractor {
    return new LoginInteractorImplementation(
      this.authenticationRepository,
      this.profileRepository,
      this.regionsRepository,
      this.themeRepository,
    )
  }
}
