import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  Text,
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { NotificationCategory } from '../../../core/entities/Notification'
import { EnablePushNotificationsInteractor } from '../../../core/interactor/EnablePushNotificationsInteractor'
import {
  GetNotificationsInteractor,
  GetNotificationsInteractorResult,
} from '../../../core/interactor/GetNotificationsInteractor'
import PersonalInformationRepository from '../../../data/PersonalInformationRepository'
import { NotificationsScreenProps } from '../../../navigation'
import { Colors, Spacing, Typography } from '../../../styles'
import i18n from '../../../utils/i18n'
import { GenericErrorMapper } from '../../shared/ErrorMapper'
import LoadingOverlay from '../../shared/LoadingOverlay'
import { StatefulView, ViewState } from '../../shared/StatefulView'
import NotificationRowView from './NotificationRowView'
import { ID_PUSH, NotificationRowViewModel } from './NotificationViewModel'
import { NotificationViewModelMapper } from './NotificationViewModelMapper'

const NotificationsContent = (
  category: NotificationCategory,
  content: GetNotificationsInteractorResult,
  refetchData: () => void,
) => {
  const viewModel = NotificationViewModelMapper.map(
    category,
    content.isPushEnabled,
    content.notifications,
    content.notificationsEnabled,
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const displayError = (error: string) => {
    console.log('Displaying error ', error)
    Alert.alert(
      i18n.t('common.error_title'),
      error,
      [
        {
          text: i18n.t('common.ok'),
          style: 'default',
        },
      ],
      { cancelable: false },
    )
  }
  const onNotificationChanged = (id: string, isSelected: boolean) => {
    if (id === ID_PUSH) {
      setIsLoading(true)
      new EnablePushNotificationsInteractor()
        .execute(category, isSelected)
        .then(() => refetchData())
        .catch((error) => {
          displayError(GenericErrorMapper.mapErrorMessage(error))
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      let newSubscriptions: Array<string>
      if (isSelected && !content.notificationsEnabled.includes(id)) {
        newSubscriptions = [...content.notificationsEnabled]
        newSubscriptions.push(id)
      } else if (!isSelected) {
        newSubscriptions = content.notificationsEnabled.filter(
          (subscription) => {
            return subscription !== id
          },
        )
      } else {
        return
      }
      setIsLoading(true)
      PersonalInformationRepository.getInstance()
        .updateSubscriptions(content.userUuid, newSubscriptions)
        .then(() => refetchData())
        .catch((error) => {
          displayError(GenericErrorMapper.mapErrorMessage(error))
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }
  const renderItem = ({
    item,
  }: SectionListRenderItemInfo<NotificationRowViewModel>) => {
    return (
      <NotificationRowView
        viewModel={item}
        onSelectionChanged={onNotificationChanged}
      />
    )
  }
  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <SectionList
        stickySectionHeadersEnabled={false}
        sections={viewModel.sections}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => {
          return <Text style={styles.section}>{title}</Text>
        }}
        keyExtractor={(item) => {
          return item.id
        }}
      />
    </>
  )
}

const NotificationsScreen = (props: NotificationsScreenProps) => {
  const [statefulState, setStatefulState] = useState<
    ViewState.Type<GetNotificationsInteractorResult>
  >(new ViewState.Loading())
  const category = props.route.params.category

  const fetchData = useCallback(() => {
    new GetNotificationsInteractor()
      .execute(category)
      .then((result) => {
        setStatefulState(new ViewState.Content(result))
      })
      .catch((error) => {
        setStatefulState(
          new ViewState.Error(GenericErrorMapper.mapErrorMessage(error), () => {
            setStatefulState(new ViewState.Loading())
            fetchData()
          }),
        )
      })
  }, [category])
  useEffect(() => {
    props.navigation.setOptions({
      title: getTitle(category),
    })
    fetchData()
  }, [props, fetchData, category])

  const refetchData = () => {
    setStatefulState(new ViewState.Loading())
    fetchData()
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatefulView
        state={statefulState}
        contentComponent={(result) => {
          return NotificationsContent(category, result, refetchData)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  section: {
    ...Typography.headline,
    marginBottom: Spacing.unit,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.mediumMargin,
  },
})

function getTitle(category: NotificationCategory): string {
  switch (category) {
    case 'local':
      return i18n.t('notificationmenu.local')
    case 'national':
      return i18n.t('notificationmenu.national')
  }
}

export default NotificationsScreen
