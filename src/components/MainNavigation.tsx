import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import Header from './Header'
import HomeScreen from '../screens/HomeScreen'
import HatchingScreen from '../screens/HatchingScreen'
import PrimesScreen from '../screens/PrimesScreen'
import BagScreen from '../screens/BagScreen'
import ShopScreen from '../screens/ShopScreen'
import { PlayerData } from '../../lib/playerManager'

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
              tabBarIcon: ({ focused, color, size }) => (
                <MaterialCommunityIcons
                  name={focused ? 'egg' : 'egg-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Primes" 
            component={PrimesScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="paw" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Home"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={size} />
              ),
            }}
          >
            {() => (
              <HomeScreen 
                onLogout={onLogout} 
                playerData={playerData}
                onRefreshPlayerData={onRefreshPlayerData}
              />
            )}
          </Tab.Screen>
          <Tab.Screen 
            name="Bag" 
            component={BagScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'bag-personal' : 'bag-personal-outline'} 
                  color={color} 
                  size={size} 
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Shop" 
            component={ShopScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'shopping' : 'shopping-outline'} 
                  color={color} 
                  size={size} 
                />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
}) 