import messaging from '@react-native-firebase/messaging'
import { ENVIRONMENT } from '../Config'
import { Department } from '../core/entities/Department'
import { Region } from '../core/entities/Region'
import LocalStore from './store/LocalStore'

export interface PushRepository {
  subscribeToGeneralTopic(): Promise<void>
  subscribeToDepartment(department: Department): Promise<void>
  subscribeToRegion(region: Region): Promise<void>
  invalidatePushToken(): Promise<void>
}

export class PushRepositoryImplementation implements PushRepository {
  private localStore: LocalStore

  constructor(localStore: LocalStore) {
    this.localStore = localStore
  }

  public async subscribeToGeneralTopic(): Promise<void> {
    const registrations = await this.localStore.getTopicsRegistration()
    if (registrations?.globalRegistered !== true) {
      await messaging().subscribeToTopic(this.createTopicName('global'))
      await this.localStore.updateTopicsRegistration({
        globalRegistered: true,
      })
      console.log('global topic subscribed with success')
    } else {
      console.log('already subscribed to global topic')
    }
  }

  public async subscribeToDepartment(department: Department): Promise<void> {
    const topicName = this.createTopicName('department_' + department.code)
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.departementRegistered
    if (previousTopic !== topicName) {
      if (previousTopic !== undefined) {
        await messaging().unsubscribeFromTopic(previousTopic)
        console.log(`unsubscribed from ${previousTopic}`)
      }
      await messaging().subscribeToTopic(topicName)
      await this.localStore.updateTopicsRegistration({
        departementRegistered: topicName,
      })
      console.log(`subscribed to ${topicName} with success`)
    } else {
      console.log(`already subscribed to ${topicName}`)
    }
  }

  public async subscribeToRegion(region: Region): Promise<void> {
    const topicName = this.createTopicName('region_' + region.code)
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.regionRegistered
    if (previousTopic !== topicName) {
      if (previousTopic !== undefined) {
        await messaging().unsubscribeFromTopic(previousTopic)
        console.log(`unsubscribed from ${previousTopic}`)
      }
      await messaging().subscribeToTopic(topicName)
      await this.localStore.updateTopicsRegistration({
        regionRegistered: topicName,
      })
      console.log(`subscribed to ${topicName} with success`)
    } else {
      console.log(`already subscribed to ${topicName}`)
    }
  }

  public async invalidatePushToken(): Promise<void> {
    return messaging()
      .deleteToken()
      .then(() => this.localStore.clearTopicsRegistration())
  }

  private createTopicName(topic: string): string {
    return ENVIRONMENT + '_jemarche_' + topic
  }
}
