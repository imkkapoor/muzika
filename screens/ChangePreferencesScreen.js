import {
    Alert,
    FlatListComponent,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import PLaylistsList from "../components/PLaylistsList";
import { getPlaylists } from "../functions/spotify";
import { User } from "../UserContext";
import {
    pushSelectedPlaylist,
    storeGenreInFirestore,
} from "../functions/dbFunctions";
import LoadingFullScreen from "../loaders/LoadingFullScreen";
import NavigationBar from "../components/NavigationBar";
import { CheckCircle, Plus, X } from "phosphor-react-native";
import {
    getSelectedGenreList,
    setSelectedGenreList,
} from "../functions/localStorageFunctions";
import genres from "../static/data";

const ChangeSelectedPlaylist = () => {
    const [playlists, setPlaylists] = useState([]);
    const { currentUser } = useContext(User);
    const [isLoading, setIsLoading] = useState(true);
    const [waitingPlaylistAddition, setWaitingPlaylistAddition] =
        useState(false);
    const [playlistChangeTrigger, setPlaylistChangeTrigger] = useState(0);

    useEffect(() => {
        getPlaylists({ currentUser, setPlaylists, setIsLoading });
    }, [currentUser]);
    const selectPlaylist = async (item) => {
        const response = await pushSelectedPlaylist({
            selectedPlaylistId: item.id,
            playlistName: item.name,
            setWaitingPlaylistAddition: setWaitingPlaylistAddition,
            currentUser: currentUser,
        });
        if (response === true) {
            setPlaylistChangeTrigger((prev) => prev + 1);
            Alert.alert(`Your Playlist has been changed to ${item.name} `);
        }
    };

    return (
        <View style={{ backgroundColor: "black" }}>
            <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
                <NavigationBar title={"/múzika/playlists"} />
                <View style={styles.container}>
                    <Text
                        style={[
                            styles.changeSelectedText,
                            { marginBottom: 30 },
                        ]}
                    >
                        Just tap on the playlist you want to switch to!
                    </Text>

                    <PLaylistsList
                        playlists={playlists}
                        selectPlaylist={selectPlaylist}
                        isLoading={isLoading}
                        playlistChangeTrigger={playlistChangeTrigger}
                    />
                </View>
            </SafeAreaView>
            {waitingPlaylistAddition && <LoadingFullScreen />}
        </View>
    );
};

const ChangeSelectedGenre = () => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [waitingGenreAddition, setWaitingGenreAddition] = useState(false);
    const { currentUser } = useContext(User);

    useEffect(() => {
        const fetch = async () => {
            const list = await getSelectedGenreList();
            setSelectedGenres(list);
        };

        fetch();
    }, []);

    const handleGenrePress = (genre) => {
        if (selectedGenres.includes(genre.name)) {
            setSelectedGenres(
                selectedGenres.filter((name) => name !== genre.name)
            );
        } else if (selectedGenres.length < 5) {
            setSelectedGenres([...selectedGenres, genre.name]);
            console.log(genre.name);
            console.log(selectedGenres);
        }
    };

    const handleGenreStorage = async () => {
        setWaitingGenreAddition(true);
        try {
            setSelectedGenreList(selectedGenres);
            console.log("selectedGenre:", selectedGenres);

            if (currentUser) {
                await storeGenreInFirestore(currentUser, selectedGenres);
            } else {
                console.log("User profile is null");
            }
        } catch (err) {
            console.log("Error in playlist selection:", err);
        } finally {
            setWaitingGenreAddition(false);
        }
    };

    return (
        <View style={{ backgroundColor: "black", height: "100%" }}>
            <SafeAreaView style={styles.container}>
                <NavigationBar title={"/múzika/genres"} />
                <Text style={styles.changeSelectedText}>
                    Choose your favourite genres by tapping on them!
                </Text>
                <Text
                    style={{
                        color: "white",
                        marginBottom: 30,
                        fontFamily: "Inter-Medium",
                        fontSize: 14,
                        marginTop: 10,
                    }}
                >
                    Maximum five options are allowed
                </Text>
                <View style={styles.genreGrid}>
                    {genres.map((genre) => (
                        <TouchableOpacity
                            key={genre.id}
                            style={[
                                styles.genreItem,
                                selectedGenres.includes(genre.name) &&
                                    styles.selectedGenreItem,
                            ]}
                            onPress={() => handleGenrePress(genre)}
                        >
                            {selectedGenres.includes(genre.name) ? (
                                <X size={15} weight="bold" color="black" />
                            ) : (
                                <Plus size={15} weight="bold" color="white" />
                            )}
                            <Text
                                style={[
                                    styles.genreText,
                                    selectedGenres.includes(genre.name) &&
                                        styles.selectedGenreText,
                                ]}
                            >
                                {genre.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={styles.continueBox}
                        onPress={handleGenreStorage}
                    >
                        <Text style={styles.continue}>Done</Text>
                        <CheckCircle size={17} color="white" weight="bold" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            {waitingGenreAddition && <LoadingFullScreen />}
        </View>
    );
};

export { ChangeSelectedPlaylist, ChangeSelectedGenre };

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    changeSelectedText: {
        textAlign: "center",
        color: "white",
        fontSize: 18,
        fontFamily: "Inter-SemiBold",
        margin: 12,
        width: 300,
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
        width: "100%",
    },
    description: {
        fontSize: 15,
        fontFamily: "Inter",
        color: "white",
        marginTop: 12,
        width: 340,
    },
    genreText: {
        color: "white",
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        marginLeft: 8,
    },
    selectedGenreText: { color: "black" },
    genreGrid: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -10,
    },
    genreItem: {
        display: "flex",
        margin: 10,
        padding: 10,
        paddingRight: 18,
        borderRadius: 30,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#191414",
    },
    selectedGenreItem: {
        backgroundColor: "#1ED760",
    },
    continue: {
        color: "white",
        marginRight: 5,
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
    },
    continueBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 65,
        backgroundColor: "#191414",
        padding: 12,
        borderRadius: 10,
    },
});
