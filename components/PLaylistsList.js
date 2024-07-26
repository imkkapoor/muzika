import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useCallback } from "react";
import EachPlaylist from "./EachPlaylist";

const PLaylistsList = ({
    playlists,
    currentUser,
    setWaitingPlaylistAddition,
    selectPlaylist,
}) => {
    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => selectPlaylist(item)}
            >
                <EachPlaylist
                    item={item}
                    setWaitingPlaylistAddition={setWaitingPlaylistAddition}
                    currentUser={currentUser}
                />
            </TouchableOpacity>
        ),
        [playlists]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    const itemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 12 }}></View>;
    });

    return (
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
    );
};

export default PLaylistsList;

const styles = StyleSheet.create({});
