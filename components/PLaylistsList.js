import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import EachPlaylist from "./EachPlaylist";
import { User } from "../UserContext";
import { getPlaylistId } from "../functions/dbFunctions";

const PLaylistsList = ({
    playlists,
    selectPlaylist,
    isLoading,
    playlistChangeTrigger,
}) => {
    const { currentUser } = useContext(User);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [isSelectedPlaylistLoading, setIsSelectedPlaylistLoading] =
        useState(true);
    useEffect(() => {
        const getAndSetSelectedPlaylistId = async () => {
            const selectedPlaylistId = await getPlaylistId(currentUser);
            setSelectedPlaylistId(selectedPlaylistId);
            setIsSelectedPlaylistLoading(false);
        };
        getAndSetSelectedPlaylistId();
    }, [currentUser, playlistChangeTrigger]);

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => selectPlaylist(item)}
            >
                <EachPlaylist
                    item={item}
                    selectedPlaylistId={selectedPlaylistId}
                />
            </TouchableOpacity>
        ),
        [playlists, selectedPlaylistId]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    const itemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 12 }}></View>;
    });

    return (
        <>
            {isLoading || isSelectedPlaylistLoading ? (
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
        </>
    );
};

export default PLaylistsList;

const styles = StyleSheet.create({
    loading: {
        backgroundColor: "black",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: 300,
    },
});
