import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import React, { useContext, useState } from 'react';
import { profile_data } from '../../components/Data/Data';
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { SourceSansPro_400Regular } from '@expo-google-fonts/source-sans-pro';

const Profile_section3 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const edit = () => {
        router.push('edit_restaurant');
    };

    return (
        <View style={styles.container}>
            <View style={styles.profile_data_container}>
                {profile_data.map((d) => (
                    <View key={d.id}>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => {
                                if (d.name === 'Edit Restaurant') {
                                    edit();
                                }
                            }}
                        >
                            <View style={styles.row_left}>
                                {darkMode ? d.dark_icon : d.icon}
                                <View style={styles.profile_column}>
                                <Text style={[styles.row_text, { color: theme.color3 }]}>{d.name}</Text>
                                </View>
                            </View>
                            {d.name === 'Dark Mode' && (
                                <Switch
                                    trackColor={{ false: "#767577", true: "#FF6DB5" }}
                                    thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
                                    onValueChange={toggleTheme}
                                    value={darkMode}
                                    style={styles.switch}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default Profile_section3;

const styles = StyleSheet.create({
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    profile_data_container: {
        gap: 8,
        marginVertical: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    row_left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row_text: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'Montserrat_500Medium',
        color: '#000000',
        textTransform: 'capitalize',
        marginLeft: 10, 
    },
    switch: {
        width: 50,
    },
});
