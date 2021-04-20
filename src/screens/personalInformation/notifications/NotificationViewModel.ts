export interface NotificationsViewModel {
  sections: Array<NotificationSectionViewModel>
}

export interface NotificationSectionViewModel {
  title: string
  data: Array<NotificationRowViewModel>
}

export interface NotificationRowViewModel {
  id: string
  label: string
  isSelected: boolean
}
