import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    Image,
    Pressable,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState();
    const [topSongs, setTopSongs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(null); // Track the currently playing song
    const [sound, setSound] = useState(null); // Audio.Sound instance
    const [isProcessing, setIsProcessing] = useState(false); // To manage debouncing

    const getProfile = async () => {
        accessToken = await AsyncStorage.getItem("token");
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

    const playPauseSound = async (url, id) => {
        if (isProcessing) {
            return;
        }
        setIsProcessing(true);

        try {
            if (isPlaying === id) {
                await sound.pauseAsync();
                setIsPlaying(null);
            } else {
                if (sound) {
                    await sound.unloadAsync();
                }
                const { sound: newSound } = await Audio.Sound.createAsync({
                    uri: url,
                });
                setSound(newSound);
                setIsPlaying(id);
                await newSound.playAsync();
            }
        } catch (error) {
            console.error("Error in playing sound:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getTopSongs = async () => {
        accessToken = await AsyncStorage.getItem("token");
        try {
            const response = await fetch(
                "https://api.spotify.com/v1/me/top/tracks?limit=5",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setTopSongs(data.items);
        } catch (err) {
            setError(err.message);
        }
    };

    const getRecommendations = async (tracks) => {
        accessToken = await AsyncStorage.getItem("token");

        if (tracks.length > 0) {
            const seedTracks = tracks.map((track) => track.id).join(",");
            const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks}&limit=50`;

            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                const playableTracks = data.tracks.filter(
                    (track) => track.preview_url
                );
                setRecommendations(playableTracks);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getProfile();
        getTopSongs();
        // Just an edge case for now, as it was going back to login page on swipping back, which should not be the case
        if (!userProfile) {
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
        }
    }, []);

    useEffect(() => {
        if (topSongs.length > 0) {
            getRecommendations(topSongs);
        }
    }, [topSongs]);

    if (loading) {
        return (
            <View
                style={{
                    backgroundColor: "black",
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    if (error) {
        return (
            <View
                style={{
                    backgroundColor: "black",
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <Text style={{ color: "white" }}>{error}</Text>;
            </View>
        );
    }

    return (
        <View
            style={{
                backgroundColor: "black",
                height: "100%",
            }}
        >
            <SafeAreaView>
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={{ color: "white" }}>Spreel</Text>
                    <Pressable
                        onPress={() => {
                            navigation.navigate("Profile");
                        }}
                    >
                        <Text style={{ color: "white" }}>Profile</Text>
                    </Pressable>
                </View>

                <View>
                    <Image
                        style={{
                            width: 64,
                            height: 64,
                            resizeMode: "cover",
                        }}
                        source={{ uri: userProfile?.images[1].url }}
                    />
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
                    <View>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                                color: "white",
                            }}
                        >
                            Recommendations:
                        </Text>
                        {recommendations.map((rec) => (
                            <View
                                key={rec.id}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <Image
                                    style={{
                                        width: 64,
                                        height: 64,
                                        resizeMode: "cover",
                                        marginRight: 10,
                                    }}
                                    source={{ uri: rec.album.images[0].url }}
                                />
                                <Text style={{ color: "white", flex: 1 }}>
                                    {rec.name}
                                </Text>
                                <Pressable
                                    onPress={() =>
                                        playPauseSound(rec.preview_url, rec.id)
                                    }
                                    style={{
                                        padding: 10,
                                        backgroundColor: "white",
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text>
                                        {isPlaying === rec.id
                                            ? "Pause"
                                            : "Play"}
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({});
