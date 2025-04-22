import { StyleSheet, Text, View, TouchableOpacity, Modal, Platform } from 'react-native';
import React, { useState, useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import Icon from "../../assets/images/Calendar.svg";
import { Picker } from '@react-native-picker/picker';

const DateInput = ({
  label,
  placeholder,
  borderRadius,
  borderColor,
  onDateChange
}) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  // Generate arrays for day, month, and year options
  const generateDays = () => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - i);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleConfirm = () => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}/${month}/${year}`;
    setFormattedDate(formatted);
    
    if (onDateChange) {
      onDateChange(date, formatted);
    }
    
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  const handleDayChange = (day) => {
    const newDate = new Date(date);
    newDate.setDate(day);
    setDate(newDate);
  };
  
  const handleMonthChange = (monthIndex) => {
    const newDate = new Date(date);
    newDate.setMonth(monthIndex);
    
    // Adjust day if it exceeds the days in the selected month
    const daysInNewMonth = new Date(newDate.getFullYear(), monthIndex + 1, 0).getDate();
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    
    setDate(newDate);
  };
  
  const handleYearChange = (year) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    
    // Handle February 29 in leap years
    if (newDate.getMonth() === 1 && newDate.getDate() === 29) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (!isLeapYear) {
        newDate.setDate(28);
      }
    }
    
    setDate(newDate);
  };

  return (
    <View>
      <View style={styles.inputBox}>
        {label && <Text style={[styles.label, { color: theme.color }]}>{label}</Text>}
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={[
              styles.input,
              {
                borderRadius: borderRadius || 6,
                backgroundColor: theme.cardbg2,
                borderColor: borderColor || 'transparent',
              },
            ]}
            onPress={showDatepicker}
          >
            <Text style={{ color: formattedDate ? theme.color : (darkMode ? '#ffffff80' : '#80808080') }}>
              {formattedDate || placeholder}
            </Text>
            <Icon />
          </TouchableOpacity>
          
          {show && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={show}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
                  <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>
                    Select Date of Birth
                  </Text>
                  
                  <View style={styles.pickerContainer}>
                    {/* Day Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={[styles.pickerHeader, { color: darkMode ? '#fff' : '#333' }]}>Day</Text>
                      <Picker
                        selectedValue={date.getDate()}
                        onValueChange={handleDayChange}
                        style={[styles.picker, { color: darkMode ? '#fff' : '#333' }]}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={darkMode ? '#fff' : '#333'}
                      >
                        {generateDays().map((day) => (
                          <Picker.Item 
                            key={`day-${day}`} 
                            label={day.toString().padStart(2, '0')} 
                            value={day} 
                          />
                        ))}
                      </Picker>
                    </View>
                    
                    {/* Month Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={[styles.pickerHeader, { color: darkMode ? '#fff' : '#333' }]}>Month</Text>
                      <Picker
                        selectedValue={date.getMonth()}
                        onValueChange={handleMonthChange}
                        style={[styles.picker, { color: darkMode ? '#fff' : '#333' }]}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={darkMode ? '#fff' : '#333'}
                      >
                        {months.map((month, index) => (
                          <Picker.Item 
                            key={`month-${index}`} 
                            label={month.substring(0, 3)} 
                            value={index} 
                          />
                        ))}
                      </Picker>
                    </View>
                    
                    {/* Year Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={[styles.pickerHeader, { color: darkMode ? '#fff' : '#333' }]}>Year</Text>
                      <Picker
                        selectedValue={date.getFullYear()}
                        onValueChange={handleYearChange}
                        style={[styles.picker, { color: darkMode ? '#fff' : '#333' }]}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={darkMode ? '#fff' : '#333'}
                      >
                        {generateYears().map((year) => (
                          <Picker.Item 
                            key={`year-${year}`} 
                            label={year.toString()} 
                            value={year} 
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={[styles.button, styles.cancelButton, { backgroundColor: darkMode ? '#555' : '#f0f0f0' }]} 
                      onPress={handleCancel}
                    >
                      <Text style={[styles.buttonText, { color: darkMode ? '#fff' : '#333' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.confirmButton]} 
                      onPress={handleConfirm}
                    >
                      <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </View>
    </View>
  );
};

export default DateInput;

const styles = StyleSheet.create({
  inputBox: {
    gap: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'SourceSansPro_700Bold',
    color: '#121212',
    textTransform: 'capitalize',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    paddingVertical: 14,
    paddingLeft: 35,
    paddingRight: 20,
    borderWidth: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? 200 : 120,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 120,
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#006AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    color: '#fff',
  },
});
