import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, FlatList, ListRenderItemInfo } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { Tool } from '../../core/entities/Tool'
import { Colors, Spacing, Typography } from '../../styles'
import i18n from '../../utils/i18n'
import { GenericErrorMapper } from '../shared/ErrorMapper'
import { StatefulView, ViewState } from '../shared/StatefulView'
import { ToolRow } from './ToolRow'
import { ToolRowViewModel } from './ToolRowViewModel'
import { ToolRowViewModelMapper } from './ToolRowViewModelMapper'
import { useTheme } from '../../themes'
import { ExternalLink } from '../shared/ExternalLink'
import { toolsRepository } from '../../di/DependencyProvider'

const ToolsScreen = () => {
  const [statefulState, setStatefulState] = useState<
    ViewState.Type<ReadonlyArray<ToolRowViewModel>>
  >(new ViewState.Loading())

  const { theme } = useTheme()
  const [fetchedTools] = useState(new Map<number, Tool>())
  const fetch = () => {
    setStatefulState(new ViewState.Loading())
    toolsRepository
      .getTools()
      .then((tools) => {
        fetchedTools.clear()
        tools.forEach((tool) => {
          fetchedTools.set(tool.id, tool)
        })
        const toolsViewModel = ToolRowViewModelMapper.map(theme, tools)
        setStatefulState(new ViewState.Content(toolsViewModel))
      })
      .catch((error) => {
        setStatefulState(
          new ViewState.Error(GenericErrorMapper.mapErrorMessage(error), fetch),
        )
      })
  }

  useEffect(fetch, [theme])

  const renderItem = ({ item }: ListRenderItemInfo<ToolRowViewModel>) => {
    return <ToolRow viewModel={item} onPress={onToolSelected} />
  }

  const onToolSelected = (toolId: number) => {
    const tool = fetchedTools.get(toolId)
    if (tool != null) {
      ExternalLink.openUrl(tool.url)
    } else {
      console.log(`tool id ${toolId} not found`)
    }
  }

  const ToolContent = (tools: ReadonlyArray<ToolRowViewModel>) => {
    return (
      <FlatList
        data={tools}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={
          <Text style={styles.title}>{i18n.t('tools.title')}</Text>
        }
        contentContainerStyle={styles.contentContainer}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatefulView state={statefulState} contentComponent={ToolContent} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.defaultBackground,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.largeMargin,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.mediumMargin,
  },
})

export default ToolsScreen
