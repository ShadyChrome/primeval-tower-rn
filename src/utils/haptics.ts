import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export class HapticManager {
  private static isEnabled = true

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  static getEnabled(): boolean {
    return this.isEnabled && Platform.OS !== 'web'
  }

  // Light feedback for subtle interactions
  static light() {
    if (this.getEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  // Medium feedback for standard interactions
  static medium() {
    if (this.getEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  // Heavy feedback for important actions
  static heavy() {
    if (this.getEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  }

  // Success feedback
  static success() {
    if (this.getEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  // Warning feedback
  static warning() {
    if (this.getEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  }

  // Error feedback
  static error() {
    if (this.getEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  // Selection feedback (for pickers, tabs, etc.)
  static selection() {
    if (this.getEnabled()) {
      Haptics.selectionAsync()
    }
  }

  // Custom patterns for specific actions
  static tabSwitch() {
    this.light()
  }

  static runeEquip() {
    this.medium()
  }

  static runeUnequip() {
    this.light()
  }

  static primeNavigate() {
    this.selection()
  }

  static upgradeSuccess() {
    this.success()
  }

  static upgradeFailure() {
    this.error()
  }

  static modalOpen() {
    this.light()
  }

  static modalClose() {
    this.light()
  }

  static buttonPress() {
    this.light()
  }

  static longPress() {
    this.medium()
  }
} 