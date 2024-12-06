import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

const EmployeeStack = createStackNavigator();

function EmployeeNavigator() {
  return (
      <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
    </EmployeeStack.Navigator>
  );
}

export default EmployeeNavigator;
