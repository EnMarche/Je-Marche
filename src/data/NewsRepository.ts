import { News } from '../core/entities/News'
import ApiService from './network/ApiService'
import { RestNewsMapper } from './mapper/RestNewsMapper'
import PaginatedResult from '../core/entities/PaginatedResult'
import { RestMetadataMapper } from './mapper/RestMetadataMapper'
import CacheManager from './store/CacheManager'
import { DataSource } from './DataSource'
import { RestNewsResponse } from './restObjects/RestNewsResponse'

const firstPage = 1

export interface NewsRepository {
  getLatestNews(zipCode: string, dataSource: DataSource): Promise<Array<News>>
  getNews(zipCode: string, page: number): Promise<PaginatedResult<Array<News>>>
}

export class NewsRepositoryImplementation implements NewsRepository {
  private apiService: ApiService
  private cacheManager: CacheManager

  constructor(apiService: ApiService, cacheManager: CacheManager) {
    this.apiService = apiService
    this.cacheManager = cacheManager
  }

  public async getLatestNews(
    zipCode: string,
    dataSource: DataSource = 'remote',
  ): Promise<Array<News>> {
    const cacheKey = 'latest_news_' + zipCode
    let restNews: RestNewsResponse
    switch (dataSource) {
      case 'cache':
        restNews = await this.cacheManager.getFromCache(cacheKey)
        break
      case 'remote':
        restNews = await this.apiService.getNews(zipCode, firstPage)
        await this.cacheManager.setInCache(cacheKey, restNews)
        break
    }
    return restNews.items.map(RestNewsMapper.map)
  }

  public async getNews(
    zipCode: string,
    page: number,
  ): Promise<PaginatedResult<Array<News>>> {
    const restNews = await this.apiService.getNews(zipCode, page)
    const paginationInfo = RestMetadataMapper.map(restNews.metadata)
    const news = restNews.items.map(RestNewsMapper.map)
    return {
      paginationInfo: paginationInfo,
      result: news,
    }
  }
}
