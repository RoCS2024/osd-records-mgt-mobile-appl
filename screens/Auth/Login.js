import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LoginScreen component handles user login functionality.
 * Allows users to input username and password, toggle password visibility,
 * and submit the form to authenticate with the backend server.
 */
const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Toggles the visibility of the password field.
   */
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  /**
   * Handles the login process by sending a POST request to the backend server.
   * Upon successful authentication, navigates to the appropriate screen based on the user's role.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const handleLogin = async () => {
    setErrorMessage('');
    const userData = { username, password };
  
    try {
      const response = await axios.post('https://amused-gnu-legally.ngrok-free.app/user/login', userData, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status === 200) {
        let studentNumber = response.data;
  
        if (!studentNumber) {
          setErrorMessage('Student number not received from server.');
          return;
        }
  
        if (typeof studentNumber === 'number') {
          studentNumber = studentNumber.toString();
        }
  
        const token = response.headers['jwt-token'];
  
        if (!token) {
          setErrorMessage('Token not received from server.');
          return;
        }
  
        const decodedToken = jwtDecode(token);
  
        const roles = decodedToken.authorities || [];
        const userRole = roles.find((role) => role.includes('ROLE_'));
  
        if (!userRole) {
          Alert.alert('Error', 'Unauthorized role. Please try again.');
          return;
        }
  
        await AsyncStorage.setItem('role', userRole);
        await AsyncStorage.setItem('token', token);
  
        if (userRole.includes('ROLE_GUEST')) {
          await AsyncStorage.setItem('guestId', studentNumber);
  
          navigation.replace('Main', {
            screen: 'Guests',
            params: { screen: 'GuestViolation' },
          });
        } else if (userRole.includes('ROLE_EMPLOYEE')) {
          await AsyncStorage.setItem('employeeNumber', studentNumber);
  
          navigation.replace('Main', {
            screen: 'Employees',
            params: { screen: 'EmployeeReport' },
          });
        } else {
          await AsyncStorage.setItem('studentNumber', studentNumber);
          navigation.replace('Main', {
            screen: 'Students',
            params: { screen: 'StudentViolation', studentNumber },
          });
        }
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('Incorrect username or password. Please try again.');
      } else if (error.response) {
        const serverMessage = error.response.data?.message || 'Invalid request. Please check your input.';
        setErrorMessage(serverMessage);
        Alert.alert('Login Error', serverMessage);
      } else if (error.request) {
        setErrorMessage('No response from server. Check network or server status.');
        Alert.alert('Login Error', 'No response from server. Check network or server status.');
      } else {
        setErrorMessage('Request error. Please try again.');
        Alert.alert('Login Error', 'Request error. Please try again.');
      }
    }
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    setErrorMessage('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setErrorMessage('');
  };
  

  return (
    <ImageBackground source={require('../../assets/images/img3-1.png')} style={styles.background}>
      <View style={styles.overlayContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.headerText}>Login</Text>

        <View style={[styles.inputGroup, styles.usernameField]}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
          />
          <Image source={require('../../assets/images/user-1.png')} style={styles.icon} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
            <Image source={passwordVisible ? require('../../assets/images/eye.png') : require('../../assets/images/eye1.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>Don't have an Account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
          <Text style={styles.clickHereText}>Click here.</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoContainer: {
    marginVertical: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  usernameField: {
    marginBottom: 25,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: 40,
    backgroundColor: 'white',
    marginLeft: 0,
  },
  inputLabel: {
    position: 'absolute',
    top: -20,
    left: 1,
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#555',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    right: 5,
  },
  iconButton: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 20,
  },
  forgotUsernameButton: {
    alignSelf: 'flex-end',
    bottom: 10,
    marginBottom: 10,
  },
  forgotUsernameText: {
    color: '#0174BE',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    bottom: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0174BE',
  },
  loginButton: {
    backgroundColor: '#0072BB',
    width: '70%',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
  registerText: {
    color: '#0174BE',
    marginBottom: 5,
  },
  clickHereText: {
    color: '#0174BE',
  }
});

export default Login;