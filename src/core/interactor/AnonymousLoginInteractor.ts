import AuthenticationRepository from '../../data/AuthenticationRepository'
import ProfileRepository from '../../data/ProfileRepository'
import { AuthenticationState } from '../entities/AuthenticationState'

export interface AnonymousLoginInteractor {
  login(zipCode: string): Promise<void>
}

export class AnonymousLoginInteractorImplementation
  implements AnonymousLoginInteractor {
  private authenticationRepository: AuthenticationRepository
  private profileRepository: ProfileRepository

  constructor(
    authenticationRepository: AuthenticationRepository,
    profileRepository: ProfileRepository,
  ) {
    this.authenticationRepository = authenticationRepository
    this.profileRepository = profileRepository
  }

  public async login(zipCode: string): Promise<void> {
    await this.authenticationRepository.anonymousLogin()
    await this.profileRepository.saveZipCode(zipCode)
    this.authenticationRepository.dispatchState(AuthenticationState.Anonymous)
  }
}
