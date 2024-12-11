import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * GuestViolation component displays violations for a guest's beneficiaries. 
 * The component allows filtering violations based on a date range and student status.
 * It also handles session management, fetching violations, and navigating to related screens.
 */
const GuestViolation = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [studentStatus, setStudentStatus] = useState('all');
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [role, setRole] = useState('');
  const [guestId, setGuestId] = useState(null);
  const navigation = useNavigation();

  /**
   * Initializes the component by checking the token, role, and guestId in AsyncStorage.
   * If valid, it fetches violations for the given guestId.
   * If any of these values are missing or invalid, it logs out the user.
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        const storedGuestId = await AsyncStorage.getItem('guestId');

        if (!token || !storedRole || !storedGuestId) {
          Alert.alert('Error', 'Session expired. Please log in again.');
          handleLogout();
          return;
        }

        let decodedPayload = {};
        try {
          const base64Payload = token.split('.')[1];
          decodedPayload = JSON.parse(atob(base64Payload));
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          Alert.alert('Error', 'Invalid session. Please log in again.');
          handleLogout();
          return;
        }
  
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          handleLogout();
          return;
        }
  
        if (storedRole !== 'ROLE_ROLE_GUEST') {
          Alert.alert('Unauthorized Access', 'You do not have permission to access this page.');
          handleLogout();
          return;
        }
  
        setRole(storedRole);
        setGuestId(storedGuestId);
        fetchViolations(storedGuestId, token);
      } catch (err) {
        console.error('Initialization error:', err);
        Alert.alert('Error', 'An error occurred during initialization. Please log in again.');
        handleLogout();
      }
    };

    initialize();
  }, []);

  /**
   * Fetches violations for the guest's beneficiaries and their students.
   * It makes multiple API requests to gather violation data for each student and stores them in the state.
   * 
   * @param {string} guestId - The guest ID used to fetch beneficiaries and their violations.
   * 
   * 
   * Note: Change the IP address in the axios URL to match your backend server's IP address and port.
   */
  const fetchViolations = async (guestId) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.8:8080/guest/${guestId}/Beneficiaries`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseBody = await response.text();
      const beneficiariesData = JSON.parse(responseBody);

      if (!Array.isArray(beneficiariesData)) {
        throw new Error('The response is not an array. Check the API response.');
      }

      const fetchedViolations = beneficiariesData.flatMap((beneficiary) =>
          beneficiary.beneficiary.map(async (student) => {
              const { studentNumber, firstName, lastName } = student;
              const violationResponse = await fetch(
                `http://192.168.1.8:8080/violation/studentNumber/${studentNumber}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const violationsData = await violationResponse.json();
                return {
                  studentName: `${firstName} ${lastName}`,
                  studentNumber,
                  violations: violationsData,
                };
              })
            );

            const allViolations = await Promise.all(fetchedViolations);

              setViolations(allViolations.flat());

           } catch (error) {
      console.error('Error fetching data:', error.message);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Auth', { screen: 'Login' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  /**
   * Filters the violations based on the selected date range ('from' and 'to' dates).
   * 
   * @returns {Array} - A list of filtered violations.
   */
  const filterViolationsByDate = () => {
    return violations.flatMap((violationData) =>
      violationData.violations.filter((violation) => {
        const noticeDate = new Date(violation.dateOfNotice);
        return noticeDate >= fromDate && noticeDate <= toDate;
      }).map((violation) => ({ ...violation, studentName: violationData.studentName })));
  };

  /**
   * Filters violations based on the selected student status ('all' or specific student).
   * 
   * @param {Array} violations - The list of violations to filter.
   * @returns {Array} - The filtered violations list.
   */
  const filterByStudentStatus = (violations) => {
    if (studentStatus === 'all') {
      return violations;
    } else {
      return violations.filter(violationData => violationData.studentName === studentStatus);
    }
  };

  /**
   * Handles the change in the 'From' date picker.
   * 
   * @param {Event} event - The event object from the date picker.
   * @param {Date} selectedDate - The selected 'From' date.
   */
  const onChangeFrom = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatePicker(false);
    setFromDate(currentDate);
  };

  /**
   * Handles the change in the 'To' date picker.
   * 
   * @param {Event} event - The event object from the date picker.
   * @param {Date} selectedDate - The selected 'To' date.
   */
  const onChangeTo = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDatePicker(false);
    setToDate(currentDate);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    if (dropdownVisible) setDropdownVisible(false);
  };

  const navigateToCSslips = () => {
    setDropdownVisible(false);
    navigation.navigate('GuestCsSlip');
  };

  const navigateToViolations = () => {
    setDropdownVisible(false);
    navigation.navigate('GuestViolation');
  };

  const filteredViolations = filterByStudentStatus(filterViolationsByDate());

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View style={styles.outerContainer}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/loge-new-1.png')} style={styles.logo} />
          <TouchableOpacity onPress={toggleDropdown}>
            <Image source={require('../../assets/images/menu.png')} style={styles.menuIcon} />
          </TouchableOpacity>
        </View>

        {dropdownVisible && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToViolations}>
              <Image source={require('../../assets/images/violation.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Violations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={navigateToCSslips}>
              <Image source={require('../../assets/images/slip.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>CS Slips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Image source={require('../../assets/images/logout.png')} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

          <View style={styles.container}>
            <Text style={styles.screenTitle}>Violations</Text>
            <View style={styles.breakLine} />

            <View style={styles.datePickerSection}>
              <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.datePickerContainer}>
                <Text style={styles.dateText}>{fromDate.toDateString()}</Text>
                <Image source={require('../../assets/images/calendar-1.png')} style={styles.icon} />
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={onChangeFrom}
                />
              )}

              <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.datePickerContainer}>
                <Text style={styles.dateText}>{toDate.toDateString()}</Text>
                <Image source={require('../../assets/images/calendar-11.png')} style={styles.icon} />
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={onChangeTo}
                />
              )}
            </View>


          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={studentStatus}
              style={styles.picker}
              onValueChange={(itemValue) => setStudentStatus(itemValue)}
            >
              <Picker.Item label="All Students" value="all" />
              {violations.map((violationData, index) => (
                <Picker.Item key={index} label={violationData.studentName} value={violationData.studentName} />
              ))}
            </Picker>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Student</Text>
              <Text style={styles.tableHeader}>Offense</Text>
              <Text style={styles.tableHeader}>Date of Notice</Text>
              <Text style={styles.tableHeader}>CS Hours</Text>
            </View>
            <ScrollView style={styles.tableContent}>
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : error ? (
                <Text style={styles.errorText}>Error fetching data: {error}</Text>
              ) : filteredViolations.length > 0 ? (
                filteredViolations.map((violation, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{violation.studentName}</Text>
                    <Text style={styles.tableCell}>{violation.offense?.description || 'N/A'}</Text>
                    <Text style={styles.tableCell}>{new Date(violation.dateOfNotice).toDateString()}</Text>
                    <Text style={styles.tableCell}>{violation.csHours || 'N/A'}</Text>
                  </View>
                ))
              ) : (
                <Text>No violations found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#D3D3D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: '#0072BB',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 35,
    right: 20,
    width: 150,
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    zIndex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 10,
    marginLeft: 20,
  },
  breakLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 2,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  datePickerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    flex: 1,
    marginBottom: 10,
  },
  dateText: {
    flex: 1,
    textAlign: 'left',
  },
  icon: {
    width: 20,
    height: 20,
  },
  pickerContainer: {
    marginLeft: 10,
    marginBottom: 10,
    height: 40,
    width: '60%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  picker: {
    width: '100%',
    color: '#000000',
  },
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#F0F0F0',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#E8E8E8',
    paddingVertical: 8,
    borderBottomWidth: 0, 
  },
  tableContent: {
    maxHeight: 400,
  },
});

export default GuestViolation;
