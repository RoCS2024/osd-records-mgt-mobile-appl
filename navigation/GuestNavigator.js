import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuestViolation from '../screens/Guest/GuestViolation';

const GuestStack = createStackNavigator();

function GuestNavigator() {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
      <GuestStack.Screen name="GuestViolation" component={GuestViolation} />
    </GuestStack.Navigator>
  );
}

export default GuestNavigator;
