import { StyleSheet, Text, SafeAreaView, View } from "react-native";
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
        <View
            style={{
                backgroundColor: "black",
                height: "100%",
            }}
        >
            <SafeAreaView>
                <Text style={{ color: "white" }}>ProfileScreen</Text>
                <Text style={{ color: "white" }}>
                    {userProfile?.display_name}
                </Text>
            </SafeAreaView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
