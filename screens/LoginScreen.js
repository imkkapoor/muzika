import { Text, SafeAreaView, Pressable, View } from "react-native";
import React, { useEffect } from "react";
import {
    ResponseType,
    makeRedirectUri,
    useAuthRequest,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { CLIENT_ID, REDIRECT_URI } from "@env";
import { Entypo } from "@expo/vector-icons";

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
                    AsyncStorage.removeItem("userProfile");
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
            const accessToken = response.authentication.accessToken;
            const currentTime = new Date();
            const expirationDate = currentTime.getTime() + 3600 * 1000;
            AsyncStorage.setItem("token", accessToken);
            AsyncStorage.setItem("expirationDate", expirationDate.toString());
            navigation.navigate("Main");
        }
    }, [response]);

    return (
        <View style={{ backgroundColor: "black" }}>
            <SafeAreaView style={{ height: "100%" }}>
                <Pressable
                    onPress={() => promptAsync()}
                    style={{
                        margin: "auto",
                        backgroundColor: "#1ED760",
                        borderRadius: 50,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 215,
                        height: 66,
                    }}
                >
                    <Entypo name="spotify" size={39} color="black" />
                    <Text
                        style={{
                            color: "black",
                            fontSize: "14px",
                            fontFamily: "Inter-SemiBold",
                            paddingLeft: 7,
                        }}
                    >
                        Sign in with Spotify
                    </Text>
                </Pressable>
            </SafeAreaView>
        </View>
    );
};

export default LoginScreen;
