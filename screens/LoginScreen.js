import {
    Text,
    SafeAreaView,
    Pressable,
    View,
    ImageBackground,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
    ResponseType,
    makeRedirectUri,
    useAuthRequest,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { CLIENT_ID, REDIRECT_URI } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { checkUserExists } from "../functions/dbFunctions";
import { getProfile } from "../functions/spotify";
import {
    getAccessToken,
    getExpirationDate,
} from "../functions/localStorageFunctions";

const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);

    const [request, response, promptAsync] = useAuthRequest(
        {
            responseType: ResponseType.Token,
            clientId: CLIENT_ID,
            scopes: [
                "user-top-read",
                "user-read-email",
                "playlist-read-private",
                "playlist-read-collaborative",
                "playlist-modify-private",
                "playlist-modify-public",
            ],
            usePKCE: false,
            redirectUri: makeRedirectUri({
                scheme: REDIRECT_URI,
            }),
        },
        discovery
    );

    const getAndCheckUser = async () => {
        try {
            const data = await getProfile();
            if (!(await checkUserExists(data.id))) {
                navigation.replace("ChoosePlaylist");
            } else navigation.replace("Main");
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        const checkTokenValidity = async () => {
            const accessToken = await getAccessToken();
            const expirationDate = await getExpirationDate();

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
                    AsyncStorage.removeItem("selectedPlaylistId");
                }
            }
        };
        checkTokenValidity();
    }, []);

    useEffect(() => {
        if (response?.type === "success") {
            const accessToken = response.authentication.accessToken;
            const currentTime = new Date();
            const expirationDate = currentTime.getTime() + 3600 * 1000;
            AsyncStorage.setItem("token", accessToken);
            AsyncStorage.setItem("expirationDate", expirationDate.toString());
            getAndCheckUser();
        }
    }, [response]);

    return (
        <ImageBackground
            source={require("../assets/background/login4x.png")}
            onLoadEnd={() => setIsLoading(false)}
        >
            {isLoading && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="white" />
                </View>
            )}
            {!isLoading && (
                <View>
                    <LinearGradient
                        colors={[
                            "rgba(0, 0, 0, 0)",
                            "rgba(0, 0, 0, 0.49)",
                            "rgba(0, 0, 0, 1)",
                        ]}
                        locations={[1, 0.74, 0.0]}
                        style={styles.gradientTop}
                    ></LinearGradient>
                    <SafeAreaView style={{ height: "100%" }}>
                        <LinearGradient
                            colors={[
                                "rgba(0, 0, 0, 0)",
                                "rgba(0, 0, 0, 0.68)",
                                "rgba(0, 0, 0, 0.94)",
                                "rgba(0, 0, 0, 1)",
                                "rgba(0, 0, 0, 1)",
                            ]}
                            locations={[0, 0.22, 0.4, 0.62, 1]}
                            style={styles.gradientBottom}
                        >
                            <Pressable
                                onPress={() => promptAsync()}
                                style={styles.button}
                            >
                                <Image
                                    source={require("../assets/background/Spotify_Primary_Logo_RGB_Green.png")}
                                    style={styles.icon}
                                />
                                <Text style={styles.buttonText}>
                                    Log in with Spotify
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </SafeAreaView>
                </View>
            )}
        </ImageBackground>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    button: {
        margin: "auto",
        backgroundColor: "#2d2d2d",
        borderRadius: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 185,
        height: 66,
    },
    buttonText: {
        color: "black",
        fontSize: 12,
        fontFamily: "Inter-SemiBold",
        paddingLeft: 11,
        color: "white",
    },
    icon: { height: 26, width: 26 },
    gradientBottom: {
        flex: 1,
        height: "40%",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    loading: {
        backgroundColor: "black",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: "100%",
    },
    gradientTop: {
        flex: 1,
        height: 60,
        position: "absolute",
        top: 0,
        width: "100%",
    },
});
