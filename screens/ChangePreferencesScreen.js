import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import PLaylistsList from "../components/PLaylistsList";
import { getPlaylists } from "../functions/spotify";
import { User } from "../UserContext";
import { pushSelectedPlaylist } from "../functions/dbFunctions";
import LoadingFullScreen from "../components/LoadingFullScreen";
import NavigationBar from "../components/NavigationBar";

const ChangePreferencesScreen = () => {
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
                <NavigationBar title={"/múzika/preferences"} />
                <View style={styles.container}>
                    <Text style={styles.changeSelectedPlaylistText}>
                        Change Selected Playlist
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

export default ChangePreferencesScreen;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    changeSelectedPlaylistText: {
        color: "white",
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        margin: 12,
    },
});
