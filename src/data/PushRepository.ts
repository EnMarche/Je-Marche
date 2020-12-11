import { PushTopic } from '../core/entities/PushTopic'
import messaging from '@react-native-firebase/messaging'
import { ENVIRONMENT } from '../Config'

class PushRepository {
  private static instance: PushRepository
  private constructor() {}

  public async subscribeToTopic(topic: PushTopic): Promise<void> {
    return messaging().subscribeToTopic(this.createTopicName(topic))
  }

  public async invalidatePushToken(): Promise<void> {
    return messaging().deleteToken()
  }

  private createTopicName(topic: PushTopic): string {
    return ENVIRONMENT + '_jemarche_' + topic
  }

  public static getInstance(): PushRepository {
    if (!PushRepository.instance) {
      PushRepository.instance = new PushRepository()
    }
    return PushRepository.instance
  }
}

export default PushRepository
