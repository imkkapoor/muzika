import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import LoadingFullScreen from "../components/LoadingFullScreen";
import { getAccessToken } from "../functions/localStorageFunctions";
import { User } from "../UserContext";

const ChoosePlaylistScreen = () => {
    const navigation = useNavigation();
    const [playlists, setPlaylists] = useState([]);
    const { currentUser } = useContext(User);
    const [isLoading, setIsLoading] = useState(true);
    const [waitingPlaylistAddition, setWaitingPlaylistAddition] =
        useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        const accessToken = await getAccessToken();

        try {
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
                (playlist) => playlist.owner.id === currentUser.id
            );
            setPlaylists(ownedPlaylists);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
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
        setWaitingPlaylistAddition(true);
        try {
            await AsyncStorage.setItem(
                "selectedPlaylistId",
                selectedPlaylistId
            );
            console.log("Saved Playlist ID:", selectedPlaylistId);
            if (currentUser) {
                await storeUserDataInFirestore(
                    currentUser,
                    playlistName,
                    selectedPlaylistId
                );
            } else {
                console.log("User profile is null");
            }
            navigation.replace("ChooseGenre");
        } catch (err) {
            console.log("Error in playlist selection:", err);
            Alert.alert("Please try again!");
        } finally {
            setWaitingPlaylistAddition(false);
        }
    };

    const handleCreateNewPlaylist = () => {
        console.log("creation of new playlist is requested");
        setIsModalVisible(true);
    };

    const handleModalSubmit = async () => {
        setIsModalVisible(false);
        setWaitingPlaylistAddition(true);
        console.log("New Playlist Name:", newPlaylistName);
        const newPlaylistId = await createNewPlaylist(newPlaylistName);
        setNewPlaylistName("");
        console.log(newPlaylistId);
        navigation.replace("ChooseGenre");
    };

    const createNewPlaylist = async (playlistName) => {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.error("No access token found");
            return;
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/users/${currentUser.id}/playlists`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: playlistName,
                        description: "",
                        public: false,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create playlist");
            }

            const data = await response.json();
            console.log("New playlist created:", data);
            await storeUserDataInFirestore(currentUser, playlistName, data.id);
            return data.id; // Extract and return the new playlist ID
        } catch (error) {
            console.error("Error creating playlist:", error);
            Alert.alert("Please try again!");
        } finally {
            setWaitingPlaylistAddition(false);
        }
    };

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => selectPlaylist(item.id, item.name)}
            >
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
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={styles.newPlaylistButtonContainer}
                    >
                        <Text
                            style={styles.newPlaylistButtonText}
                            onPress={handleCreateNewPlaylist}
                        >
                            Tap right here!
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.optionTwo}>
                        Or choose from an existing playlist
                    </Text>
                </View>
                {isLoading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="small" color="white" />
                    </View>
                ) : (
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
                )}

                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                Create New Playlist
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter playlist name"
                                placeholderTextColor="#888"
                                value={newPlaylistName}
                                onChangeText={setNewPlaylistName}
                            />
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => setIsModalVisible(false)}
                                    style={[
                                        styles.buttonBox,
                                        styles.firstButtonBox,
                                    ]}
                                >
                                    <Text style={styles.buttonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={handleModalSubmit}
                                    style={styles.buttonBox}
                                >
                                    <Text style={styles.buttonText}>
                                        Submit
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
            {waitingPlaylistAddition && <LoadingFullScreen />}
        </View>
    );
};

export default ChoosePlaylistScreen;

const styles = StyleSheet.create({
    loading: {
        backgroundColor: "black",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
    },
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
        width: 340,
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
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: 300,
        paddingTop: 20,
        backgroundColor: "rgba(33,33,35,1)",
        borderRadius: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 17,
        fontFamily: "Inter-SemiBold",
        marginBottom: 15,
        color: "white",
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#414043",
        borderRadius: 5,
        marginBottom: 20,
        fontFamily: "Inter",
        color: "white",
        width: "85%",
        fontSize: 15,
    },

    buttonContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    buttonBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        borderTopWidth: 1,
        paddingTop: 15,
        paddingBottom: 15,
        borderColor: "#2a292b",
    },
    buttonText: {
        color: "#0a84ff",
        fontSize: 16,
    },
    firstButtonBox: {
        borderRightWidth: 1,
    },
});
