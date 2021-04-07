import { Tool, ToolImage } from '../core/entities/Tool'
import i18n from '../utils/i18n'

export interface ToolsRepository {
  getTools(): Promise<Array<Tool>>
}

export class ToolsRepositoryImplementation implements ToolsRepository {
  constructor() {}

  private tools: Array<Tool> = [
    {
      id: 2,
      title: i18n.t('tools.reforms.title'),
      image: ToolImage.REFORMS,
      url: i18n.t('tools.reforms.url'),
    },
    {
      id: 1,
      title: i18n.t('tools.near.title'),
      image: ToolImage.NEAR,
      url: i18n.t('tools.near.url'),
    },
    {
      id: 3,
      title: i18n.t('tools.covid.title'),
      image: ToolImage.COVID,
      url: i18n.t('tools.covid.url'),
    },
    {
      id: 4,
      title: i18n.t('tools.desintox.title'),
      image: ToolImage.DESINTOX,
      url: i18n.t('tools.desintox.url'),
    },
    {
      id: 5,
      title: i18n.t('tools.answers.title'),
      image: ToolImage.ANSWERS,
      url: i18n.t('tools.answers.url'),
    },
  ]

  public getTools(): Promise<Array<Tool>> {
    return new Promise((resolve) => {
      resolve(this.tools)
    })
  }
}
