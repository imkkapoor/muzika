import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StyleSheet,
    Button,
    Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";

const ChoosePlaylistScreen = () => {
    const navigation = useNavigation();
    const [playlists, setPlaylists] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        const accessToken = await AsyncStorage.getItem("token");

        try {
            const user = await loadUserProfile();
            const response = await fetch(
                "https://api.spotify.com/v1/me/playlists",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const data = await response.json();
            const ownedPlaylists = data.items.filter(
                (playlist) => playlist.owner.id === user.id
            );
            setPlaylists(ownedPlaylists);
        } catch (error) {
            console.error(error);
        }
    };

    const loadUserProfile = async () => {
        try {
            const userProfileString = await AsyncStorage.getItem("userProfile");
            if (userProfileString) {
                const userProfile = JSON.parse(userProfileString);
                setUserProfile(userProfile);
                return userProfile;
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        }
    };

    const storeUserDataInFirestore = async (
        userProfile,
        playlistName,
        selectedPlaylistId
    ) => {
        try {
            const userDocRef = doc(db, "users", userProfile.id);
            await setDoc(userDocRef, {
                email: userProfile.email,
                name: userProfile.display_name,
                playlistId: selectedPlaylistId,
                playlistName: playlistName,
            });
        } catch (err) {
            console.error("Error storing user data in Firestore:", err);
        }
    };

    const selectPlaylist = async (selectedPlaylistId, playlistName) => {
        try {
            await AsyncStorage.setItem(
                "selectedPlaylistId",
                selectedPlaylistId
            );
            console.log("Saved Playlist ID:", selectedPlaylistId);
            if (userProfile) {
                await storeUserDataInFirestore(
                    userProfile,
                    playlistName,
                    selectedPlaylistId
                );
            } else {
                console.log("User profile is null");
            }
            navigation.replace("Main");
        } catch (err) {
            console.log("Error in playlist selection:", err);
        }
    };

    const handleCreateNewPlaylist = () => {
        console.log("creation of new playlist is requested");
    };

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity onPress={() => selectPlaylist(item.id, item.name)}>
            <View style={styles.eachPlaylistContainer}>
                {item.images && item.images.length > 0 && (
                    <Image
                        source={{ uri: item.images[0].url }}
                        style={styles.playlistImage}
                    />
                )}
                <Text style={styles.playlistName}>{item.name}</Text>
            </View>
            </TouchableOpacity>
        ),
        [playlists]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    const itemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 12 }}></View>;
    });

    return (
        <View style={{ backgroundColor: "black", height: "100%" }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.textBox}>
                    <Text style={styles.pageTitle}>
                        Let's get you setup now!
                    </Text>
                    <Text style={styles.description}>
                        Choose a playlist for new songs to be added!
                    </Text>
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.optionOne}>
                        Want to create a new playlist?
                    </Text>
                    <Pressable style={styles.newPlaylistButtonContainer}>
                        <Text
                            style={styles.newPlaylistButtonText}
                            onPress={handleCreateNewPlaylist}
                        >
                            Tap right here!
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.optionTwo}>
                        Or choose from an existing playlist
                    </Text>
                </View>

                <FlatList
                    data={playlists}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        display: "flex",
                        alignContent: "center",
                        justifyContent: "center",
                    }}
                    ItemSeparatorComponent={itemSeparatorComponent}
                />
            </SafeAreaView>
        </View>
    );
};

export default ChoosePlaylistScreen;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    pageTitle: {
        color: "white",
        fontSize: 24,
        fontFamily: "Inter-SemiBold",
        marginTop: 28,
    },
    description: {
        fontSize: 15,
        fontFamily: "Inter",
        color: "white",
        marginTop: 12,
    },
    textBox: {
        width: "90%",
    },
    optionOne: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "white",
        marginTop: 44,
    },
    optionTwo: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "white",
        marginTop: 28,
        marginBottom: 32,
    },
    newPlaylistButtonText: {
        color: "white",
        fontSize: 17,
        fontFamily: "Inter-SemiBold",
    },
    newPlaylistButtonContainer: {
        backgroundColor: "#191414",
        borderRadius: 10,
        width: 157,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 47,
        marginTop: 15,
        alignSelf: "center",
    },
    eachPlaylistContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#191414",
        borderRadius: 10,
        width: 345,
        overflow: "hidden",
    },
    playlistImage: { width: 40, height: 40, marginRight: 10, borderRadius: 12 },
    playlistName: {
        color: "white",
        fontFamily: "Inter-Medium",
        fontSize: 15,
        width: 262,
    },
});
