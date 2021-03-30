import React, { FC } from 'react'
import {
  SectionList,
  StyleSheet,
  SectionListRenderItemInfo,
  Text,
  ListRenderItemInfo,
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Spacing, Typography } from '../../styles'
import EventGridItem from './EventGridItem'
import EventView from './EventView'
import {
  EventSectionViewModel,
  EventRowContainerViewModel,
  EventRowViewModel,
} from './EventViewModel'

type Props = Readonly<{
  eventFilter: EventFilter
}>

type EventFilter = 'home' | 'calendar' | 'myEvents'

const EventListScreen: FC<Props> = (props) => {
  const mockedDataGrouped: Array<EventSectionViewModel> = [
    {
      id: 'conference',
      sectionViewModel: { sectionName: 'Conférences' },
      data: [
        {
          type: 'grouped',
          value: {
            events: [
              {
                id: '1',
                title: 'LREM Senlis Sud Oise - déjeunons Zoom',
                isOnline: true,
                tag: 'CONFERENCE',
                tagBackgroundColor: '#4489f7',
                tagTextColor: '#ffffff',
                imageUrl:
                  'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/980px-Olympique_lyonnais_%28logo%29.svg.png',
                isSubscribed: true,
                date: "Aujourd'hui\n12:00 - 15:00",
              },
              {
                id: '2',
                title: 'Porte à porte Montmartre',
                isOnline: false,
                tag: 'CONFERENCE',
                tagBackgroundColor: '#4489f7',
                tagTextColor: '#ffffff',
                isSubscribed: false,
                date: "Aujourd'hui\n11:00 - 15:00",
              },
              {
                id: '3',
                title: 'Porte à porte Montmartre',
                isOnline: false,
                tag: 'CONFERENCE',
                tagBackgroundColor: '#4489f7',
                tagTextColor: '#ffffff',
                isSubscribed: false,
                date: "Aujourd'hui\n11:00 - 15:00",
              },
            ],
          },
        },
      ],
    },
    {
      id: 'meeting',
      sectionViewModel: { sectionName: 'Réunions' },
      data: [
        {
          type: 'grouped',
          value: {
            events: [
              {
                id: '10',
                title: 'LREM Senlis Sud Oise - déjeunons Zoom',
                isOnline: true,
                tag: 'REUNIONS',
                tagBackgroundColor: '#1c00ff',
                tagTextColor: '#ffffff',
                imageUrl:
                  'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/980px-Olympique_lyonnais_%28logo%29.svg.png',
                isSubscribed: true,
                date: "Aujourd'hui\n12:00 - 15:00",
              },
              {
                id: '20',
                title: 'Porte à porte Montmartre',
                isOnline: false,
                tag: 'REUNIONS',
                tagBackgroundColor: '#1c00ff',
                tagTextColor: '#ffffff',
                isSubscribed: false,
                date: "Aujourd'hui\n11:00 - 15:00",
              },
            ],
          },
        },
      ],
    },
  ]
  const mockedDataFlat: Array<EventSectionViewModel> = [
    {
      id: 'today',
      sectionViewModel: { sectionName: "Aujourd'hui" },
      data: [
        {
          type: 'event',
          value: {
            id: '1',
            title: 'LREM Senlis Sud Oise - déjeunon',
            isOnline: true,
            tag: 'CONFERENCE',
            tagBackgroundColor: '#4489f7',
            tagTextColor: '#ffffff',
            imageUrl:
              'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/980px-Olympique_lyonnais_%28logo%29.svg.png',
            isSubscribed: true,
            date: '12:00 - 15:00',
          },
        },
        {
          type: 'event',
          value: {
            id: '2',
            title: 'Porte à porte Montmartre',
            isOnline: false,
            tag: 'ACTIONS TERRAINS',
            tagBackgroundColor: '#b1d8ff',
            tagTextColor: '#413d45',
            isSubscribed: false,
            date: '11:00 - 15:00',
          },
        },
      ],
    },
    {
      id: 'tomorrow',
      sectionViewModel: { sectionName: 'Mardi 23 mars' },
      data: [
        {
          type: 'event',
          value: {
            id: '4',
            title: 'Échange sur le Grand Paris avec Pâcome',
            isOnline: false,
            tag: 'REUNIONS',
            tagBackgroundColor: '#1c00ff',
            tagTextColor: '#ffffff',
            isSubscribed: true,
            date: '12:00 - 15:00',
          },
        },
      ],
    },
  ]

  const renderItemHorizontal = (
    info: ListRenderItemInfo<EventRowViewModel>,
    totalItemCount: number,
  ) => {
    const isLastItem = info.index + 1 === totalItemCount
    const marginEnd = isLastItem ? Spacing.margin : 0
    return (
      <EventGridItem
        style={[styles.eventGridCell, { marginEnd: marginEnd }]}
        viewModel={info.item}
      />
    )
  }
  const renderItem = ({
    item,
  }: SectionListRenderItemInfo<EventRowContainerViewModel>) => {
    if (item.type === 'grouped') {
      return (
        <FlatList
          horizontal={true}
          data={item.value.events}
          renderItem={(info) =>
            renderItemHorizontal(info, item.value.events.length)
          }
        />
      )
    } else if (item.type === 'event') {
      return <EventView viewModel={item.value} />
    } else {
      return null
    }
  }
  return (
    <SectionList
      stickySectionHeadersEnabled={false}
      sections={
        props.eventFilter === 'home' ? mockedDataGrouped : mockedDataFlat
      }
      renderItem={renderItem}
      renderSectionHeader={({ section: { sectionViewModel } }) => {
        return sectionViewModel !== undefined ? (
          <Text style={styles.section}>{sectionViewModel.sectionName}</Text>
        ) : null
      }}
      keyExtractor={(item, index) => item.type + index}
    />
  )
}

const styles = StyleSheet.create({
  eventGridCell: {
    marginStart: Spacing.margin,
    marginVertical: Spacing.margin,
  },
  section: {
    ...Typography.headline,
    marginBottom: Spacing.unit,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.mediumMargin,
  },
})

export default EventListScreen