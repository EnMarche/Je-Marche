import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { StyleSheet, View, Alert, FlatList } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import PollDetailProgressBar from './PollDetailProgressBar'
import { Colors, Spacing } from '../../styles'
import PollDetailNavigationButtons from './PollDetailNavigationButtons'
import { Poll } from '../../core/entities/Poll'
import {
  PollDetailComponentProvider,
  PollDetailComponentProviderImplementation,
} from './PollDetailComponentProvider'
import { PollDetailProgressBarViewModelMapper } from './PollDetailProgressBarViewModelMapper'
import { PollDetailNavigationButtonsViewModelMapper } from './PollDetailNavigationButtonsViewModelMapper'
import LoadingOverlay from '../shared/LoadingOverlay'
import i18n from '../../utils/i18n'
import { StackNavigationProp } from '@react-navigation/stack'
import { PollDetailModalParamList, Screen } from '../../navigation'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import { pollsRepository } from '../../di/DependencyProvider'

type Props = Readonly<{
  poll: Poll
  navigation: StackNavigationProp<
    PollDetailModalParamList,
    typeof Screen.pollDetail
  >
}>

const PollDetailScreenLoaded: FunctionComponent<Props> = ({
  poll,
  navigation,
}) => {
  const [currentStep, setStep] = useState<number>(0)
  const [, updateState] = useState<any>()
  const forceUpdate = useCallback(() => updateState({}), [])
  const [provider] = useState<PollDetailComponentProvider>(
    new PollDetailComponentProviderImplementation(poll, forceUpdate),
  )

  const [isLoading, setIsLoading] = useState(false)

  const progressViewModel = PollDetailProgressBarViewModelMapper.map(
    currentStep,
    provider.getNumberOfSteps(),
    provider.getStepType(currentStep),
  )
  const navigationViewModel = PollDetailNavigationButtonsViewModelMapper.map(
    provider.isPreviousStepAvailable(currentStep),
    provider.isNextStepAvailable(currentStep),
    provider.isDataComplete(currentStep),
  )

  const [pageWidth, setPageWidth] = useState<number>(0)
  const flatListViewRef = useRef<FlatList>(null)

  useEffect(() => {
    flatListViewRef.current?.scrollToIndex({
      animated: true,
      index: currentStep,
    })
  }, [currentStep])

  const displayError = (error: string) => {
    console.log('Displaying error ', error)
    Alert.alert(
      i18n.t('common.error_title'),
      error,
      [
        {
          text: i18n.t('common.error_retry'),
          onPress: postAnswers,
        },
        {
          text: i18n.t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    )
  }

  const postAnswers = () => {
    setIsLoading(true)
    pollsRepository
      .sendPollAnswers(poll, provider.getResult())
      .then(() => {
        navigation.replace(Screen.pollDetailSuccess, {
          pollId: poll.id,
          title: poll.name,
        })
      })
      .catch((error) => {
        displayError(GenericErrorMapper.mapErrorMessage(error))
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <View style={styles.content}>
        <PollDetailProgressBar
          style={styles.progress}
          viewModel={progressViewModel}
        />
        <View
          style={styles.questionContainer}
          onLayout={(event) => {
            setPageWidth(event.nativeEvent.layout.width)
          }}
        >
          <FlatList
            ref={flatListViewRef}
            scrollEnabled={false}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[...Array(provider.getNumberOfSteps()).keys()]}
            renderItem={({ item }) => {
              return (
                <View key={item} style={{ width: pageWidth }}>
                  {provider.getStepComponent(item)}
                </View>
              )
            }}
            extraData={provider}
            getItemLayout={(_data, index) => {
              return { length: pageWidth, offset: pageWidth * index, index }
            }}
            snapToInterval={pageWidth}
            keyExtractor={(item) => item.toString()}
            windowSize={5}
          />
        </View>
        <PollDetailNavigationButtons
          viewModel={navigationViewModel}
          onPrevious={() => setStep(currentStep - 1)}
          onNext={() => setStep(currentStep + 1)}
          onSubmit={postAnswers}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: 'hidden', // hide the shadow on the bottom
  },
  progress: {
    paddingHorizontal: Spacing.margin,
  },
  questionContainer: {
    flexGrow: 1,
  },
  viewPager: {
    flex: 1,
  },
})

export default PollDetailScreenLoaded
