import {
    Text,
    SafeAreaView,
    Pressable,
    View,
    ImageBackground,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
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
import {
    exchangeCodeForToken,
    exchangeRefreshTokenForAccessToken,
    getProfile,
} from "../functions/spotify";
import {
    getAccessToken,
    getExpirationDate,
    getRefreshToken,
    setTokens,
} from "../functions/localStorageFunctions";
import { User } from "../UserContext";

const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const { setCurrentUser } = useContext(User);

    const [request, response, promptAsync] = useAuthRequest(
        {
            responseType: ResponseType.Code,
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
            setCurrentUser(data);
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
            const refreshToken = await getRefreshToken();

            if (accessToken && expirationDate) {
                const currentTime = Date.now();

                if (currentTime < parseInt(expirationDate)) {
                    //token is still valid
                    await getAndCheckUser();
                    // navigation.replace("Main");
                } else {
                    // token is expired
                    if (refreshToken) {
                        const refreshResponse =
                            await exchangeRefreshTokenForAccessToken(
                                refreshToken
                            );
                        if (!refreshResponse.accessToken) {
                            Alert.alert(
                                "Failed to refresh the token. Please try logging in again!"
                            );
                            // in case the refresh token request ever goes wrong
                            AsyncStorage.removeItem("accessToken");
                            AsyncStorage.removeItem("refreshToken");
                            AsyncStorage.removeItem("expirationDate");
                            return;
                        }
                        await setTokens(refreshResponse);
                        await getAndCheckUser();

                        return;
                    }
                }
            }
        };
        checkTokenValidity();
    }, []);

    useEffect(() => {
        const handleAuthResponse = async () => {
            if (response?.type === "success") {
                const { code } = response.params;
                const tokenResponse = await exchangeCodeForToken(code);
                await setTokens(tokenResponse);
                await getAndCheckUser();
            }
        };
        handleAuthResponse();
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
