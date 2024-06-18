import { StyleSheet, Text, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userProfileString = await AsyncStorage.getItem(
                    "userProfile"
                );

                if (userProfileString) {
                    const userProfile = JSON.parse(userProfileString);
                    setUserProfile(userProfile);
                }
            } catch (error) {
                console.error("Error parsing JSON string:", error);
            }
        };

        fetchData();
    }, []);
    
    return (
        <SafeAreaView>
            <Text>ProfileScreen</Text>
            <Text>{userProfile?.display_name}</Text>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
