import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import Screens
import Login from '../screens/Auth/Login';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ForgotUsername from '../screens/Auth/ForgotUsername';
import CreateAccount from '../screens/Auth/CreateAccount';
import VerifyOtp from '../screens/Auth/VerifyOtp';
import AddGuest from '../screens/Auth/AddGuest';
import AddGuestNext from '../screens/Auth/AddGuestNext';
import GuestViolation from '../screens/Guest/GuestViolation';
import StudentViolation from '../screens/Student/StudentViolation';

// Stack Navigators
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const GuestStack = createStackNavigator();
const StudentStack = createStackNavigator();
const EmployeeStack = createStackNavigator();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />\
      <AuthStack.Screen name="ForgotUsername" component={ForgotUsername} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccount} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtp} />
      <AuthStack.Screen name="AddGuest" component={AddGuest} />
      <AuthStack.Screen name="AddGuestNext" component={AddGuestNext} />
    </AuthStack.Navigator>
  );
}

// Guest Navigator
function GuestNavigator() {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
      <GuestStack.Screen name="GuestViolation" component={GuestViolation} />
    </GuestStack.Navigator>
  );
}

// Student Navigator
function StudentNavigator() {
  return (
    <StudentStack.Navigator screenOptions={{ headerShown: false }}>
      <StudentStack.Screen name="StudentViolation" component={StudentViolation} />
    </StudentStack.Navigator>
  );
}

// Employee Navigator
function EmployeeNavigator() {
  return (
    <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
    </EmployeeStack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
