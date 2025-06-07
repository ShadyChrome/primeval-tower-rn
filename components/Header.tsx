import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, ProgressBar, Surface } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HeaderProps {
  playerName: string
  playerLevel: number
  currentXP: number
  maxXP: number
  gems: number
}

export default function Header({ 
  playerName, 
  playerLevel, 
  currentXP, 
  maxXP, 
  gems 
}: HeaderProps) {
  const insets = useSafeAreaInsets()
  const [showXP, setShowXP] = useState(false)
  
  const toggleXPDisplay = () => {
    setShowXP(!showXP)
  }
  
  return (
    <Surface style={[styles.container, { paddingTop: insets.top }]} elevation={2}>
      <View style={styles.content}>
        {/* Main row with player info and resources */}
        <View style={styles.mainRow}>
          <TouchableOpacity onPress={toggleXPDisplay} style={styles.playerInfo}>
            <Text variant="titleMedium" style={styles.playerName}>
              {playerName}
            </Text>
            <Text variant="bodySmall" style={styles.levelText}>
              Level {playerLevel}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.resourcesContainer}>
            <View style={styles.gemContainer}>
              <Text variant="bodySmall" style={styles.gemIcon}>💎</Text>
              <Text variant="bodyMedium" style={styles.gemCount}>
                {gems.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
        
        {/* XP bar - only shown when toggled */}
        {showXP && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={currentXP / maxXP} 
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.xpText}>
              {currentXP}/{maxXP} XP
            </Text>
          </View>
        )}
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7EFE5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: '#333333',
  },
  levelText: {
    color: '#666666',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  xpText: {
    textAlign: 'center',
    marginTop: 4,
    color: '#666666',
  },
  resourcesContainer: {
    alignItems: 'flex-end',
  },
  gemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A0C49D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gemIcon: {
    marginRight: 4,
  },
  gemCount: {
    color: 'white',
    fontWeight: '600',
  },
}) 