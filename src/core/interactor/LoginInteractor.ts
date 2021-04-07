import { AuthenticationRepository } from '../../data/AuthenticationRepository'
import { ProfileRepository } from '../../data/ProfileRepository'
import { RegionsRepository } from '../../data/RegionsRepository'
import ThemeRepository from '../../data/ThemeRepository'
import { AuthenticationState } from '../entities/AuthenticationState'
import RegionTheme from '../entities/RegionTheme'

export interface LoginInteractor {
  login(email: string, password: string): Promise<RegionTheme>
}

export class LoginInteractorImplementation implements LoginInteractor {
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

  public async login(email: string, password: string): Promise<RegionTheme> {
    await this.authenticationRepository.login(email, password)
    try {
      const profile = await this.profileRepository.getProfile('remote')
      const zipCode = profile.zipCode
      const region = await this.regionsRepository.getRegion(zipCode, 'remote')
      await this.themeRepository.saveRegionTheme(region.theme)
      await this.profileRepository.saveZipCode(zipCode)
      this.authenticationRepository.dispatchState(
        AuthenticationState.Authenticated,
      )
      return region.theme
    } catch (error) {
      // We need to clean already saved credentials if an error occurs
      // during profile | region fetch
      await this.authenticationRepository.logout()
      throw error
    }
  }
}
