import React, { useEffect, useState } from 'react'
import { Alert, BackHandler, View, StyleSheet } from 'react-native'

import { PollDetailScreenProps } from '../../navigation'
import i18n from '../../utils/i18n'
import { Poll } from '../../core/entities/Poll'
import PollDetailScreenLoaded from './PollDetailScreenLoaded'
import { StatefulView, ViewState } from '../shared/StatefulView'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import {
  CloseButton,
  NavigationHeaderButton,
} from '../shared/NavigationHeaderButton'
import ModalOverlay from '../shared/ModalOverlay'
import PollDetailTools from './PollDetailTools'
import { useTheme } from '../../themes'
import { pollsRepository } from '../../di/DependencyProvider'

const PollDetailScreen = ({ route, navigation }: PollDetailScreenProps) => {
  const { theme } = useTheme()
  const [statefulState, setStatefulState] = useState<ViewState.Type<Poll>>(
    new ViewState.Loading(),
  )
  const [isModalVisible, setModalVisible] = useState(false)

  React.useLayoutEffect(() => {
    const askConfirmationBeforeLeaving = () => {
      Alert.alert(
        i18n.t('polldetail.leave_alert.title'),
        i18n.t('polldetail.leave_alert.message'),
        [
          {
            text: i18n.t('polldetail.leave_alert.action'),
            onPress: () => navigation.goBack(),
            style: 'destructive',
          },
          {
            text: i18n.t('polldetail.leave_alert.cancel'),
            style: 'cancel',
          },
        ],
        { cancelable: false },
      )
    }

    const updateNavigationHeader = () => {
      navigation.setOptions({
        headerLeft: () => (
          <CloseButton onPress={() => askConfirmationBeforeLeaving()} />
        ),
      })
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        askConfirmationBeforeLeaving()
        return true
      },
    )

    updateNavigationHeader()
    return () => backHandler.remove()
  }, [navigation])

  const fetchPoll = () => {
    setStatefulState(new ViewState.Loading())
    pollsRepository
      .getPoll(route.params.pollId)
      .then((poll) => {
        navigation.setOptions({
          title: poll.name,
          headerRight: () => (
            <NavigationHeaderButton
              onPress={() => setModalVisible(true)}
              source={theme.image.pollTools()}
            />
          ),
        })
        setStatefulState(new ViewState.Content(poll))
      })
      .catch((error) => {
        console.error(error)
        setStatefulState(
          new ViewState.Error(
            GenericErrorMapper.mapErrorMessage(error),
            fetchPoll,
          ),
        )
      })
  }

  useEffect(fetchPoll, [route.params.pollId, navigation, theme])
  return (
    <View style={styles.container}>
      <ModalOverlay
        modalVisible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <PollDetailTools />
      </ModalOverlay>
      <StatefulView
        state={statefulState}
        contentComponent={(poll) => (
          <PollDetailScreenLoaded poll={poll} navigation={navigation} />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default PollDetailScreen
