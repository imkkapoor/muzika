import { StyleSheet, Text, SafeAreaView, View, Image } from "react-native";
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
                <View style={styles.personalInfoContainer}>
                    <Image
                        source={{ uri: userProfile?.images[1].url }}
                        style={styles.profilePicture}
                    />
                    <View style={styles.nameAndEmailContainer}>
                        <Text style={styles.name}>
                            {userProfile?.display_name}
                        </Text>
                        <Text style={styles.email}>{userProfile?.email}</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    profilePicture: {
        height: 120,
        width: 120,
        borderRadius: 60,
    },
    name: {
        color: "white",
        fontSize: 20,
        fontFamily: "Inter-Bold",
        paddingBottom: 2,
    },
    email: { color: "#CCCCCC", fontSize: 14, fontFamily: "Inter-SemiBold" },
    personalInfoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    nameAndEmailContainer: {
        marginLeft: 23,
    },
});
