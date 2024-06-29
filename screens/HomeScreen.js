import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    Pressable,
    ActivityIndicator,
    FlatList,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import MusicCard from "../components/MusicCard";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState();
    const [topSongs, setTopSongs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);
    const [activeSongId, setActiveSongId] = useState(null);

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
        } else {
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
        }
    };

    const getTopSongs = async () => {
        accessToken = await AsyncStorage.getItem("token");
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/top/tracks?limit=5`,
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
            // await AsyncStorage.setItem(
            //     "sampleSongs",
            //     JSON.stringify(data.items)
            // );
        } catch (err) {
            console.log(err);

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
                    console.log(response);
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                const playableTracks = data.tracks.filter(
                    (track) => track.preview_url
                );
                setActiveSongId(playableTracks[0].id);
                setRecommendations(playableTracks);
            } catch (err) {
                console.log(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // delete after
    const sample = async () => {
        const data = await AsyncStorage.getItem("sampleSongs");

        if (data) {
            const sampleSongs = JSON.parse(data);
            setRecommendations(sampleSongs);
        }
    };

    useEffect(() => {
        getProfile(); //edit afterwards
        getTopSongs();
        // sample();
        // setRecommendations(topSongs);
        // setLoading(false);
    }, []);

    useEffect(() => {
        if (topSongs.length > 0) {
            //edit after
            getRecommendations(topSongs);
        }
    }, [topSongs]);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].isViewable) {
            setActiveSongId(viewableItems[0].item.id);
        }
    }, []);

    if (loading) {
        return (
            <View style={styles.loading}>
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
                        height: 69,
                    }}
                >
                    <Text style={{ color: "white" }}>Spreel</Text>
                    <Pressable
                        onPress={() => {
                            navigation.navigate("ChoosePlaylist");
                        }}
                    >
                        <Text style={{ color: "white" }}>Choose Playlist</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            navigation.navigate("Profile");
                        }}
                    >
                        <Text style={{ color: "white" }}>Profile</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={recommendations}
                    keyExtractor={(item) => item.id}
                    ref={flatListRef}
                    onViewableItemsChanged={onViewableItemsChanged}
                    showsVerticalScrollIndicator={false}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 70,
                    }}
                    renderItem={({ item }) => (
                        <MusicCard item={item} activeSongId={activeSongId} />
                    )}
                />
            </SafeAreaView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    loading: {
        backgroundColor: "black",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: "100%",
    },
});
