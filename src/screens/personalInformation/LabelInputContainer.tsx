import React, { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Typography } from '../../styles'

type Props = Readonly<{
  label: string
  errorMessage?: string
  children: any
}>

const LabelInputContainer: FC<Props> = (props) => {
  const hasErrorMessage =
    props.errorMessage !== undefined && props.errorMessage !== ''
  const borderColor = hasErrorMessage
    ? Colors.inputTextErrorMessage
    : Colors.separator
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.label}>{props.label}</Text>
        <View style={styles.input}>{props.children}</View>
      </View>
      <View style={[styles.separator, { backgroundColor: borderColor }]} />
      {hasErrorMessage ? (
        <Text style={styles.errorMessage}>{props.errorMessage}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.unit,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    color: Colors.darkText,
  },
  input: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.separatorHeight,
    marginTop: Spacing.unit,
    backgroundColor: Colors.separator,
  },
  errorMessage: {
    ...Typography.errorMessage,
    marginTop: Spacing.small,
  },
})

export default LabelInputContainer
