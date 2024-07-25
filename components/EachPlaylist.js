import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

const EachPlaylist = ({ item }) => {
    return (
        <View style={styles.eachPlaylistContainer}>
            {item.images && item.images.length > 0 && (
                <Image
                    source={{ uri: item.images[0].url }}
                    style={styles.playlistImage}
                />
            )}
            <Text style={styles.playlistName}>{item.name}</Text>
        </View>
    );
};

export default EachPlaylist;

const styles = StyleSheet.create({
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
