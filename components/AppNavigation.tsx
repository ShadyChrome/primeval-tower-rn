import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MainNavigation from './MainNavigation'
import PrimeDetailsScreen from '../src/screens/PrimeDetailsScreen'
import { PlayerData } from '../lib/playerManager'

const Stack = createNativeStackNavigator()

interface AppNavigationProps {
  onLogout?: () => void
  playerData: PlayerData
  onRefreshPlayerData: () => Promise<void>
}

export default function AppNavigation({ 
  onLogout, 
  playerData, 
  onRefreshPlayerData 
}: AppNavigationProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          options={{ headerShown: false }}
        >
          {() => (
            <MainNavigation 
              onLogout={onLogout} 
              playerData={playerData}
              onRefreshPlayerData={onRefreshPlayerData}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen 
          name="PrimeDetails" 
          component={PrimeDetailsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
} 