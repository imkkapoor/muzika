import {
    ActivityIndicator,
    Alert,
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
import { pushSelectedPlaylist } from "../functions/dbFunctions";
import LoadingFullScreen from "../components/LoadingFullScreen";
import { useNavigation } from "@react-navigation/native";
import NavigationBar from "../components/NavigationBar";

const ChangePreferencesScreen = () => {
    const navigation = useNavigation();
    const [playlists, setPlaylists] = useState([]);
    const { currentUser } = useContext(User);
    const [isLoading, setIsLoading] = useState(true);
    const [waitingPlaylistAddition, setWaitingPlaylistAddition] =
        useState(false);
    useEffect(() => {
        getPlaylists({ currentUser, setPlaylists, setIsLoading });
    }, []);
    const selectPlaylist = async (item) => {
        const response = await pushSelectedPlaylist({
            selectedPlaylistId: item.id,
            playlistName: item.name,
            setWaitingPlaylistAddition: setWaitingPlaylistAddition,
            currentUser: currentUser,
        });
        if (response === true) {
            Alert.alert(`Your Playlist has been changed to ${item.name} `);
        }
    };
    return (
        <View style={{ backgroundColor: "black" }}>
            <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
                <NavigationBar title={"/múzika/preferences"}/>
                <View style={styles.container}>
                    {isLoading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    ) : (
                        <PLaylistsList
                            playlists={playlists}
                            currentUser={currentUser}
                            setWaitingPlaylistAddition={
                                setWaitingPlaylistAddition
                            }
                            selectPlaylist={selectPlaylist}
                        />
                    )}
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
});
