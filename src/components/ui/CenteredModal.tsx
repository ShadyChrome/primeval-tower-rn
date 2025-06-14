import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Portal, Modal } from 'react-native-paper'

interface CenteredModalProps {
  visible: boolean
  onDismiss: () => void
  children: React.ReactNode
  maxWidth?: number
  dismissible?: boolean
  backgroundColor?: string
}

export default function CenteredModal({
  visible,
  onDismiss,
  children,
  maxWidth = 400,
  dismissible = true,
  backgroundColor = 'rgba(0, 0, 0, 0.5)'
}: CenteredModalProps) {
  const { width } = Dimensions.get('window')
  const modalWidth = Math.min(width * 0.9, maxWidth)

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={dismissible ? onDismiss : undefined}
        dismissable={dismissible}
        contentContainerStyle={[
          styles.modalContainer,
          { 
            maxWidth: modalWidth,
            width: modalWidth
          }
        ]}
        style={[styles.modal, { backgroundColor }]}
      >
        {children}
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
}) 