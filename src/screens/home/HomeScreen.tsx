import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  StyleSheet,
  SectionList,
  SectionListRenderItemInfo,
  RefreshControl,
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'

import { HomeScreenProps, Screen } from '../../navigation'
import { Colors } from '../../styles'
import { useTheme } from '../../themes'
import i18n from '../../utils/i18n'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import { StatefulView, ViewState } from '../shared/StatefulView'
import HomeAdhere from './HomeAdhere'
import HomeHeader from './HomeHeader'
import HomePollRowContainer from './HomePollRowContainer'
import HomeRegion from './HomeRegion'
import { HomeRowViewModel } from './HomeRowViewModel'
import HomeSectionRow from './HomeSectionRow'
import HomeToolRowContainer from './tools/HomeToolRowContainer'
import { HomeViewModel } from './HomeViewModel'
import { HomeViewModelMapper } from './HomeViewModelMapper'
import HomeNewsRowContainer from './news/HomeNewsRowContainer'
import {
  HomeResources,
  useGetHomeResourcesInteractor,
} from '../../core/interactor/GetHomeResourcesInteractor'
import { useFocusEffect } from '@react-navigation/native'
import { Region } from '../../core/entities/Region'
import ThemeRepository from '../../data/ThemeRepository'
import { ExternalLink } from '../shared/ExternalLink'
import { ServerTimeoutError } from '../../core/errors'
import HomeQuickPollRowContainer from './quickPoll/HomeQuickPollRowContainer'
import { useSaveQuickPollAsAnsweredInteractor } from '../../core/interactor/SaveQuickPollAsAnsweredInteractor'

const HomeScreen: FunctionComponent<HomeScreenProps> = ({ navigation }) => {
  const { theme, setTheme } = useTheme()
  const [statefulState, setStatefulState] = useState<
    ViewState.Type<HomeResources>
  >(new ViewState.Loading())
  const [isRefreshing, setRefreshing] = useState(true)
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const [currentResources, setResources] = useState<HomeResources>()

  const getHomeResourcesInteractor = useGetHomeResourcesInteractor()
  const saveQuickPollAsAnsweredInteractor = useSaveQuickPollAsAnsweredInteractor()

  useEffect(() => {
    // Reload view model (and view) when resources model changes
    if (!currentResources) {
      return
    }
    const viewModel = HomeViewModelMapper.map(
      theme,
      currentResources.profile,
      currentResources.region,
      currentResources.news,
      currentResources.polls,
      currentResources.tools,
      currentResources.quickPoll,
    )
    setStatefulState(new ViewState.Content(viewModel))
  }, [theme, currentResources])

  const fetchData = useCallback(
    (cacheJustLoaded: boolean = false) => {
      const updateTheme = (region: Region | undefined) => {
        if (region) {
          setTheme(region.theme)
          ThemeRepository.getInstance().saveRegionTheme(region.theme)
        }
      }

      setRefreshing(true)
      getHomeResourcesInteractor
        .execute('remote')
        .then((resources) => {
          setResources(resources)
          updateTheme(resources.region)
        })
        .catch((error) => {
          const isNetworkError = error instanceof ServerTimeoutError
          if (isNetworkError && cacheJustLoaded) {
            return
          }
          setStatefulState(
            new ViewState.Error(
              GenericErrorMapper.mapErrorMessage(error),
              () => {
                setStatefulState(new ViewState.Loading())
                fetchData()
              },
            ),
          )
        })
        .finally(() => {
          setRefreshing(false)
        })
    },
    [setTheme, getHomeResourcesInteractor],
  )

  const firstDataFetch = useCallback(() => {
    getHomeResourcesInteractor
      .execute('cache')
      .then((resources) => {
        setResources(resources)
        if (!initialFetchDone) {
          setInitialFetchDone(true)
          fetchData(true)
        }
      })
      .catch(() => {
        fetchData()
      })
  }, [fetchData, initialFetchDone, getHomeResourcesInteractor])

  useFocusEffect(firstDataFetch)

  const onPollSelected = (pollId: number) => {
    navigation.navigate(Screen.pollDetailModal, {
      screen: Screen.pollDetail,
      params: { pollId: pollId },
    })
  }
  const onNewsSelected = (newsUrl: string) => {
    ExternalLink.openUrl(newsUrl)
  }
  const onToolSelected = (toolUrl: string) => {
    ExternalLink.openUrl(toolUrl)
  }
  const onNewsMorePressed = () => {
    navigation.navigate(Screen.homeNavigator, {
      screen: Screen.news,
    })
    navigation.navigate(Screen.news)
  }
  const onPollsMorePressed = () => {
    navigation.navigate(Screen.polls)
  }
  const onToolsMorePressed = () => {
    navigation.navigate(Screen.tools)
  }
  const onRegionMorePressed = () => {
    if (!currentResources) {
      return
    }
    navigation.navigate(Screen.homeNavigator, {
      screen: Screen.region,
      params: { zipCode: currentResources.zipCode },
    })
  }
  const onFooterButtonPressed = () => {
    ExternalLink.openUrl(i18n.t('unauthenticatedhome.register_url'))
  }
  const onQuickPollAnswerSelected = async (
    pollId: string,
    answerId: string,
  ) => {
    if (!currentResources) {
      return
    }
    const updatedPoll = await saveQuickPollAsAnsweredInteractor.execute({
      quickPollId: pollId,
      answerId: answerId,
    })
    // We must make a clone to update state
    const clone: HomeResources = {
      ...currentResources,
      quickPoll: updatedPoll,
    }
    setResources(clone)
  }

  const renderItem = ({
    item,
  }: SectionListRenderItemInfo<HomeRowViewModel>) => {
    if (item.type === 'news') {
      return (
        <HomeNewsRowContainer
          viewModel={item.value}
          onNewsSelected={onNewsSelected}
          onMorePressed={onNewsMorePressed}
        />
      )
    } else if (item.type === 'polls') {
      return (
        <HomePollRowContainer
          viewModel={item.value}
          onPollSelected={onPollSelected}
          onMorePressed={onPollsMorePressed}
        />
      )
    } else if (item.type === 'tools') {
      return (
        <HomeToolRowContainer
          viewModel={item.value}
          onMorePressed={onToolsMorePressed}
          onToolSelected={onToolSelected}
        />
      )
    } else if (item.type === 'adhere') {
      return <HomeAdhere onPress={onFooterButtonPressed} />
    } else if (item.type === 'region') {
      return (
        <HomeRegion
          viewModel={item.value}
          onMorePressed={onRegionMorePressed}
        />
      )
    } else if (item.type === 'quick_poll') {
      return (
        <HomeQuickPollRowContainer
          viewModel={item.value}
          onAnswerSelected={onQuickPollAnswerSelected}
        />
      )
    } else {
      return null
    }
  }

  const HomeContent = (homeViewModel: HomeViewModel) => {
    return (
      <SectionList
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={<HomeHeader title={homeViewModel.title} />}
        sections={homeViewModel.rows}
        renderItem={renderItem}
        renderSectionHeader={({ section: { sectionViewModel } }) => {
          return sectionViewModel !== undefined ? (
            <HomeSectionRow viewModel={sectionViewModel} />
          ) : null
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchData}
            colors={[theme.primaryColor]}
          />
        }
        keyExtractor={(item, index) => item.type + index}
      />
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatefulView contentComponent={HomeContent} state={statefulState} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
})

export default HomeScreen
