import { Department } from '../core/entities/Department'
import { Region } from '../core/entities/Region'
import { DepartmentNotFoundError, NotFoundError } from '../core/errors'
import ApiService from './network/ApiService'
import { DepartmentMapper } from './mapper/DepartmentMapper'
import OAuthApiService from './network/OAuthApiService'
import { RestDepartmentResponse } from './restObjects/RestDepartmentResponse'
import { AuthenticationRepository } from './AuthenticationRepository'
import { DataSource } from './DataSource'
import CacheManager from './store/CacheManager'

export interface RegionsRepository {
  getDepartment(
    zipCode: string,
    dataSource: DataSource,
    mode: 'Anonymous' | 'Authenticated',
  ): Promise<Department>
  getRegion(zipCode: string, dataSource: DataSource): Promise<Region>
}

export class RegionsRepositoryImplementation implements RegionsRepository {
  private oauthService: OAuthApiService
  private authenticationRepository: AuthenticationRepository
  private apiService: ApiService
  private cacheManager: CacheManager

  constructor(
    oauthService: OAuthApiService,
    authenticationRepository: AuthenticationRepository,
    apiService: ApiService,
    cacheManager: CacheManager,
  ) {
    this.oauthService = oauthService
    this.authenticationRepository = authenticationRepository
    this.apiService = apiService
    this.cacheManager = cacheManager
  }

  public async getDepartment(
    zipCode: string,
    dataSource: DataSource = 'remote',
    mode: 'Anonymous' | 'Authenticated' = 'Authenticated',
  ): Promise<Department> {
    try {
      let restDepartment: RestDepartmentResponse
      switch (mode) {
        case 'Anonymous':
          if (dataSource !== 'remote') {
            throw new Error(
              'Unauthenticated department fetch must be done from a remote source',
            )
          }
          const deviceId = await this.authenticationRepository.getDeviceId()
          const credentials = await this.oauthService.anonymousLogin(deviceId)
          restDepartment = await this.apiService.getDepartment(
            zipCode,
            credentials.access_token,
          )
          break
        case 'Authenticated':
          restDepartment = await this.getDepartmentAuthenticated(
            zipCode,
            dataSource,
          )
          break
      }
      return DepartmentMapper.map(restDepartment)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new DepartmentNotFoundError()
      }
      throw error
    }
  }

  private async getDepartmentAuthenticated(
    zipCode: string,
    dataSource: DataSource,
  ): Promise<RestDepartmentResponse> {
    const cacheKey = 'department_' + zipCode
    switch (dataSource) {
      case 'cache':
        return this.cacheManager.getFromCache(cacheKey)
      case 'remote':
        const department = await this.apiService.getDepartment(zipCode)
        await this.cacheManager.setInCache(cacheKey, department)
        return department
    }
  }

  public async getRegion(
    zipCode: string,
    dataSource: DataSource = 'remote',
  ): Promise<Region> {
    return (await this.getDepartment(zipCode, dataSource)).region
  }
}
