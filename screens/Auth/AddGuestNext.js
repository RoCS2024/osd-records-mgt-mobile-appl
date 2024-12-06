import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

/**
 * AddGuestNext component allows for the input of guest's contact details such as email, phone number, and address.
 * It validates the form fields and submits the data to the backend server for guest registration.
 */
const AddGuestNext = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { personalDetails, guestNumber, username, password } = route.params;

  const [contactDetails, setContactDetails] = useState({
    email: '',
    contactNumber: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the change of form fields and clears the related error messages.
   * 
   * @param {string} field - The field to be updated (e.g., email, contactNumber, address).
   * @param {string} value - The new value to set for the field.
   */
  const handleInputChange = (field, value) => {
    setContactDetails(prevState => ({ ...prevState, [field]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
  };

  /**
   * Navigates back to the previous screen.
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Validates the email format.
   * 
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, otherwise false.
   */
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  /**
   * Validates the phone number format (must be 11 digits).
   * 
   * @param {string} phoneNumber - The phone number to validate.
   * @returns {boolean} - Returns true if the phone number is valid, otherwise false.
   */
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(phoneNumber);
  };

  /**
   * Validates the entire form by checking if the required fields are filled and valid.
   * 
   * @returns {boolean} - Returns true if all form fields are valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!contactDetails.email) {
      newErrors.email = 'Please enter an email';
    } else if (!validateEmail(contactDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!contactDetails.contactNumber) {
      newErrors.contactNumber = 'Please enter a contact number';
    } else if (!validatePhoneNumber(contactDetails.contactNumber)) {
      newErrors.contactNumber = 'Incorrect or incomplete contact number';
    }

    if (!contactDetails.address) {
      newErrors.address = 'Please enter an address';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission by validating the form and sending the guest data to the backend server.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      user: {
        username,
        password
      },
      guest: {
        guestNumber,
        ...personalDetails,
        ...contactDetails
      }
    };

  /**
  * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
  */
    try {
      const response = await axios.post('http://192.168.1.8:8080/user/register', payload);

      if (response.status === 200) {
        Alert.alert('Success', 'Guest has been successfully registered!');
        navigation.navigate('VerifyOtp', { username });
      } else {
        Alert.alert('Error', 'Unexpected response received.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred during registration.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the input for the contact number field, allowing only numeric values.
   * 
   * @param {string} text - The text input for the contact number.
   */
  const handleContactNumberInput = (text) => {
    const newText = text.replace(/[^0-9]/g, '');
    if (newText.length <= 11) {
      handleInputChange('contactNumber', newText);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.header}>Contact Details</Text>
        <View style={styles.breakLine} />

        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={text => handleInputChange('email', text)}
          value={contactDetails.email}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          onChangeText={handleContactNumberInput}
          value={contactDetails.contactNumber}
          keyboardType="phone-pad"
        />
        {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}

        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Address"
          onChangeText={text => handleInputChange('address', text)}
          value={contactDetails.address}
          multiline={true}
          numberOfLines={4}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.nextButton, isSubmitting && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breakLine: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addressInput: {
    height: 100,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007bff',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: '48%'
  },
  backButtonText: {
    color: '#007bff',
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  }
});

export default AddGuestNext;
