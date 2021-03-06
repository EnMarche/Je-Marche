import messaging from '@react-native-firebase/messaging'
import { ENVIRONMENT } from '../Config'
import { Department } from '../core/entities/Department'
import { NotificationCategory } from '../core/entities/Notification'
import { Region } from '../core/entities/Region'
import { TokenCannotBeSubscribedError } from '../core/errors'
import ApiService from './network/ApiService'
import LocalStore from './store/LocalStore'

class PushRepository {
  private static instance: PushRepository
  private localStore = LocalStore.getInstance()
  private apiService = ApiService.getInstance()
  private constructor() {}

  public async synchronizePushTokenAssociation(): Promise<void> {
    const registrations = await this.localStore.getTopicsRegistration()
    const pushToken = await messaging().getToken()
    if (registrations?.pushTokenAssociated !== pushToken) {
      try {
        await this.apiService.removePushToken(pushToken)
        console.log('pushToken dissociated with success')
      } catch (error) {
        // no-op
        console.log(error)
      }
      try {
        await this.apiService.addPushToken({
          identifier: pushToken,
          source: TOKEN_SOURCE,
        })
      } catch (error) {
        if (!(error instanceof TokenCannotBeSubscribedError)) {
          throw error
        }
      }
      await this.localStore.updateTopicsRegistration({
        pushTokenAssociated: pushToken,
      })
      console.log('pushToken associated with success')
    } else {
      console.log('pushToken already associated to the user')
    }
  }

  public async dissociateToken() {
    const pushToken = await messaging().getToken()
    try {
      await this.apiService.removePushToken(pushToken)
      console.log('pushToken dissociated with success')
    } catch (error) {
      // no-op
      console.log(error)
    }
  }

  public async synchronizeGeneralTopicSubscription(): Promise<void> {
    const globalNotificationsEnabled = await this.arePushNotificationsEnabled(
      'national',
    )
    if (globalNotificationsEnabled) {
      this.subscribeToGeneralTopic()
    } else {
      this.unsubscribeFromGeneralTopic()
    }
  }

  private async subscribeToGeneralTopic() {
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

  private async unsubscribeFromGeneralTopic() {
    const registrations = await this.localStore.getTopicsRegistration()
    if (registrations?.globalRegistered === true) {
      await messaging().unsubscribeFromTopic(this.createTopicName('global'))
      await this.localStore.updateTopicsRegistration({
        globalRegistered: false,
      })
      console.log('global topic unsubscribed with success')
    } else {
      console.log('already unsubscribed from global topic')
    }
  }

  public async synchronizeDepartmentSubscription(
    department: Department,
  ): Promise<void> {
    const localNotificationsEnabled = await this.arePushNotificationsEnabled(
      'local',
    )
    if (localNotificationsEnabled) {
      return this.subscribeToDepartment(department)
    } else {
      this.unsubscribeDepartments()
    }
  }

  private async subscribeToDepartment(department: Department): Promise<void> {
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

  private async unsubscribeDepartments() {
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.departementRegistered
    if (previousTopic !== undefined) {
      await messaging().unsubscribeFromTopic(previousTopic)
      await this.localStore.updateTopicsRegistration({
        departementRegistered: undefined,
      })
      console.log(`unsubscribed from ${previousTopic}`)
    } else {
      console.log('already unsubscribed from departments')
    }
  }

  public async synchronizeRegionSubscription(region: Region): Promise<void> {
    const localNotificationsEnabled = await this.arePushNotificationsEnabled(
      'local',
    )
    if (localNotificationsEnabled) {
      this.subscribeToRegion(region)
    } else {
      this.unsubscribeRegion()
    }
  }

  private async subscribeToRegion(region: Region): Promise<void> {
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

  private async unsubscribeRegion() {
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.regionRegistered
    if (previousTopic !== undefined) {
      await messaging().unsubscribeFromTopic(previousTopic)
      await this.localStore.updateTopicsRegistration({
        regionRegistered: undefined,
      })
      console.log(`unsubscribed from ${previousTopic}`)
    } else {
      console.log('already unsubscribed from regions')
    }
  }

  public async synchronizeBoroughSubscription(zipCode: string): Promise<void> {
    const localNotificationsEnabled = await this.arePushNotificationsEnabled(
      'local',
    )
    if (localNotificationsEnabled) {
      return this.subscribeToBorough(zipCode)
    } else {
      this.unsubscribeBorough()
    }
  }

  private async subscribeToBorough(zipCode: string): Promise<void> {
    const topicName = this.createTopicName('borough_' + zipCode)
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.boroughRegistered
    if (previousTopic !== topicName) {
      if (previousTopic !== undefined) {
        await messaging().unsubscribeFromTopic(previousTopic)
        console.log(`unsubscribed from ${previousTopic}`)
      }
      if (this.boroughSubscriptionSupported(zipCode)) {
        await messaging().subscribeToTopic(topicName)
        await this.localStore.updateTopicsRegistration({
          boroughRegistered: topicName,
        })
        console.log(`subscribed to ${topicName} with success`)
      } else {
        await this.localStore.updateTopicsRegistration({
          boroughRegistered: undefined,
        })
        console.log(`Borough subscription is not supported for ${zipCode}`)
      }
    } else {
      console.log(`already subscribed to ${topicName}`)
    }
  }

  private boroughSubscriptionSupported(zipCode: string): boolean {
    return (
      zipCode.startsWith('13') ||
      zipCode.startsWith('69') ||
      zipCode.startsWith('75')
    )
  }

  private async unsubscribeBorough() {
    const registrations = await this.localStore.getTopicsRegistration()
    const previousTopic = registrations?.boroughRegistered
    if (previousTopic !== undefined) {
      await messaging().unsubscribeFromTopic(previousTopic)
      await this.localStore.updateTopicsRegistration({
        boroughRegistered: undefined,
      })
      console.log(`unsubscribed from ${previousTopic}`)
    } else {
      console.log('already unsubscribed from borough')
    }
  }

  public async invalidatePushToken(): Promise<void> {
    return messaging()
      .deleteToken()
      .then(() => this.localStore.clearTopicsRegistration())
  }

  public async enablePushNotifications(
    notificationCategory: NotificationCategory,
    enable: boolean,
  ) {
    switch (notificationCategory) {
      case 'local':
        await this.localStore.updateTopicsRegistration({
          localNotificationsEnabled: enable,
        })
        break
      case 'national':
        await this.localStore.updateTopicsRegistration({
          nationalNotificationsEnabled: enable,
        })
        break
    }
  }

  public async arePushNotificationsEnabled(
    notificationCategory: NotificationCategory,
  ): Promise<boolean> {
    const registrations = await this.localStore.getTopicsRegistration()
    switch (notificationCategory) {
      case 'local':
        return registrations?.localNotificationsEnabled ?? true
      case 'national':
        return registrations?.nationalNotificationsEnabled ?? true
    }
  }

  private createTopicName(topic: string): string {
    return ENVIRONMENT + '_jemarche_' + topic
  }

  public static getInstance(): PushRepository {
    if (!PushRepository.instance) {
      PushRepository.instance = new PushRepository()
    }
    return PushRepository.instance
  }
}

const TOKEN_SOURCE = 'je_marche'

export default PushRepository
