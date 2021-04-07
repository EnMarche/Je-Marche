import RegionTheme from '../core/entities/RegionTheme'
import { ThemeMapper } from './mapper/ThemeMapper'
import LocalStore from './store/LocalStore'

export interface ThemeRepository {
  getRegionTheme(): Promise<RegionTheme>
  saveRegionTheme(theme: RegionTheme): Promise<void>
}

export class ThemeRepositoryImplementation implements ThemeRepository {
  private localStore: LocalStore

  constructor(localStore: LocalStore) {
    this.localStore = localStore
  }

  public async getRegionTheme(): Promise<RegionTheme> {
    const preferences = await this.localStore.getUserPreferences()
    if (!preferences?.themeId) {
      return RegionTheme.BLUE
    }
    return ThemeMapper.map(preferences.themeId)
  }

  public async saveRegionTheme(theme: RegionTheme) {
    await this.localStore.storeThemeId(ThemeMapper.id(theme))
  }
}
