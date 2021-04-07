import { Profile } from '../core/entities/Profile'
import ApiService from './network/ApiService'
import { ProfileMapper } from './mapper/ProfileMapper'
import LocalStore from './store/LocalStore'
import { DataSource } from './DataSource'
import CacheManager from './store/CacheManager'
import { RestProfileResponse } from './restObjects/RestProfileResponse'
import { DetailedProfile } from '../core/entities/DetailedProfile'
import { PersonalInformationsForm } from '../core/entities/PersonalInformationsForm'
import { ProfileUpdateMapper } from './mapper/ProfileUpdateMapper'

export interface ProfileRepository {
  getProfile(dataSource: DataSource): Promise<Profile>
  getDetailedProfile(): Promise<DetailedProfile>
  updateDetailedProfile(
    profileUuid: string,
    newProfile: PersonalInformationsForm,
  ): Promise<void>
  getZipCode(): Promise<string>
  getCityFromPostalCode(postalCode: string): Promise<string | undefined>
  saveZipCode(zipCode: string): Promise<void>
}

export class ProfileRepositoryImplementation implements ProfileRepository {
  private apiService: ApiService
  private localStore: LocalStore
  private cacheManager: CacheManager

  constructor(
    apiService: ApiService,
    localStore: LocalStore,
    cacheManager: CacheManager,
  ) {
    this.apiService = apiService
    this.localStore = localStore
    this.cacheManager = cacheManager
  }

  public async getProfile(dataSource: DataSource = 'remote'): Promise<Profile> {
    const cacheKey = 'profile'
    let result: RestProfileResponse
    switch (dataSource) {
      case 'cache':
        result = await this.cacheManager.getFromCache(cacheKey)
        break
      case 'remote':
        result = await this.apiService.getProfile()
        await this.cacheManager.setInCache(cacheKey, result)
        break
    }
    return ProfileMapper.map(result)
  }

  public async getDetailedProfile(): Promise<DetailedProfile> {
    const response = await this.apiService.getDetailedProfile()
    return ProfileMapper.mapDetailedProfile(response)
  }

  public async updateDetailedProfile(
    profileUuid: string,
    newProfile: PersonalInformationsForm,
  ): Promise<void> {
    await this.apiService.updateProfile(
      profileUuid,
      ProfileUpdateMapper.mapPersonalInformationForm(newProfile),
    )
  }

  public async getZipCode(): Promise<string> {
    const userPreferences = await this.localStore.getUserPreferences()
    if (userPreferences?.zipCode) {
      return userPreferences.zipCode
    } else {
      throw new Error('Zipcode not found for user')
    }
  }

  public async getCityFromPostalCode(
    postalCode: string,
  ): Promise<string | undefined> {
    return this.apiService.getCityFromPostalCode(postalCode)
  }

  public async saveZipCode(zipCode: string): Promise<void> {
    await this.localStore.storeZipCode(zipCode)
  }
}
