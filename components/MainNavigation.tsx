import React from 'react'
import { View, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './Header'
import HomeScreen from '../src/screens/HomeScreen'
import HatchingScreen from '../src/screens/HatchingScreen'
import PrimesScreen from '../src/screens/PrimesScreen'
import BagScreen from '../src/screens/BagScreen'
import ShopScreen from '../src/screens/ShopScreen'
import { PlayerData } from '../lib/playerManager'

const Tab = createBottomTabNavigator()

interface MainNavigationProps {
  onLogout?: () => void
  playerData: PlayerData
  onRefreshPlayerData: () => Promise<void>
}

export default function MainNavigation({ 
  onLogout, 
  playerData, 
  onRefreshPlayerData 
}: MainNavigationProps) {
  const { player } = playerData

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Header 
          playerName={player.player_name}
          playerLevel={player.level || 1}
          currentXP={player.current_xp || 0}
          maxXP={player.max_xp || 100}
          gems={player.gems || 0}
        />
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#A0C49D',
            tabBarInactiveTintColor: '#666666',
            tabBarStyle: {
              backgroundColor: 'white',
              borderTopColor: '#E0E0E0',
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 70,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
            tabBarIconStyle: {
              marginBottom: 2,
            }
          }}
        >
          <Tab.Screen 
            name="Hatching" 
            component={HatchingScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="egg" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Primes" 
            component={PrimesScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="pokemon-go" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Home"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="castle" color={color} size={size} />
              ),
            }}
          >
            {() => <HomeScreen onLogout={onLogout} />}
          </Tab.Screen>
          <Tab.Screen 
            name="Bag" 
            component={BagScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="bag-personal" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Shop" 
            component={ShopScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="store" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
}) 