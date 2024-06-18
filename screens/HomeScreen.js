import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    Image,
    Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState();
    
    const getProfile = async () => {
        const accessToken = await AsyncStorage.getItem("token");
        if (!(await AsyncStorage.getItem("userProfile"))) {
            try {
                const response = await fetch("https://api.spotify.com/v1/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setUserProfile(data);
                await AsyncStorage.setItem("userProfile", JSON.stringify(data));
            } catch (err) {
                console.log(err.message);
            }
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    return (
        <SafeAreaView>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <Text>Spreel</Text>
                <Pressable
                    onPress={() => {
                        navigation.navigate("Profile");
                    }}
                >
                    <Text>Profile</Text>
                </Pressable>
            </View>

            <View>
                <Image
                    style={{ width: 64, height: 64, resizeMode: "cover" }}
                    source={{ uri: userProfile?.images[1].url }}
                />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({});
