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

const Tab = createBottomTabNavigator()

interface MainNavigationProps {
  onLogout?: () => void
}

export default function MainNavigation({ onLogout }: MainNavigationProps) {
  // Mock player data - in a real app this would come from state management
  const playerData = {
    playerName: "Guest Player",
    playerLevel: 12,
    currentXP: 850,
    maxXP: 1000,
    gems: 1245
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Header {...playerData} />
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