import { StyleSheet, Text, SafeAreaView, Pressable } from "react-native";
import React, { useEffect } from "react";
import {
    ResponseType,
    makeRedirectUri,
    useAuthRequest,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { CLIENT_ID, REDIRECT_URI } from "@env";

const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const LoginScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const checkTokenValidity = async () => {
            const accessToken = await AsyncStorage.getItem("token");
            const expirationDate = await AsyncStorage.getItem("expirationDate");

            if (accessToken && expirationDate) {
                const currentTime = Date.now();

                if (currentTime < parseInt(expirationDate)) {
                    //token is still valid
                    navigation.replace("Main");
                } else {
                    // token is expired
                    AsyncStorage.removeItem("token");
                    AsyncStorage.removeItem("expirationDate");
                }
            }
        };
        checkTokenValidity();
    }, []);

    const [request, response, promptAsync] = useAuthRequest(
        {
            responseType: ResponseType.Token,
            clientId: CLIENT_ID,
            scopes: ["user-top-read", "user-read-email"],
            usePKCE: false,
            redirectUri: makeRedirectUri({
                scheme: REDIRECT_URI,
            }),
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            console.log(response);
            const accessToken = response.authentication.accessToken;

            const currentTime = new Date();
            const expirationDate = currentTime.getTime() + 3600 * 1000;
            AsyncStorage.setItem("token", accessToken);
            AsyncStorage.setItem("expirationDate", expirationDate.toString());
            navigation.navigate("Main");
        }
    }, [response]);

    return (
        <SafeAreaView>
            <Text>LoginScreen</Text>
            <Pressable
                onPress={() => promptAsync()}
                style={{
                    padding: 20,
                    margin: "auto",
                }}
            >
                <Text>Sign in with spotify</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({});
