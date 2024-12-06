import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentViolation from '../screens/Student/StudentViolation';

const StudentStack = createStackNavigator();

function StudentNavigator() {
  return (
      <StudentStack.Navigator screenOptions={{ headerShown: false }}>
      <StudentStack.Screen name="StudentViolation" component={StudentViolation} />
    </StudentStack.Navigator>
  );
}

export default StudentNavigator;
