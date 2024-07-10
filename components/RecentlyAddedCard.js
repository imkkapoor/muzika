import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Marquee } from "@animatereactnative/marquee";

const RecentlyAddedCard = ({ item, maxNameLength, maxArtistNameLength }) => {
    return (
        <View key={item.id} style={styles.recentlyAddedCard}>
            <Image
                source={{ uri: item.album.images[0].url }}
                style={styles.albumCover}
            />
            {item.name.length > maxNameLength ? (
                <Marquee speed={0.3} spacing={20}>
                    <Text style={styles.songTitle}>{item.name}</Text>
                </Marquee>
            ) : (
                <Text style={styles.songTitle}>{item.name}</Text>
            )}
            {item.artists.map((artist) => artist.name).join(", ").length >
            maxArtistNameLength ? (
                <Marquee speed={0.3} spacing={20}>
                    <Text style={styles.artist}>
                        {item.artists.map((artist) => artist.name).join(", ")}
                    </Text>
                </Marquee>
            ) : (
                <Text style={styles.artist}>
                    {item.artists.map((artist) => artist.name).join(", ")}
                </Text>
            )}
        </View>
    );
};

export default RecentlyAddedCard;

const styles = StyleSheet.create({
    recentlyAddedCard: {
        height: 182,
        width: 125,
        display: "flex",
        alignItems: "center",
        backgroundColor: "#0c0c0c",
        padding: 15,
        borderRadius: 20,
        margin: 12,
    },

    albumCover: {
        width: 100,
        height: 100,
        resizeMode: "cover",
        borderRadius: 10,
    },
    songTitle: {
        fontSize: 16,
        color: "white",
        fontFamily: "Inter-SemiBold",
        marginTop: 14,
        alignSelf: "flex-start",
    },
    artist: {
        fontSize: 13,
        fontFamily: "Inter-Regular",
        color: "#CCCCCC",
        width: "100%",
        paddingTop: 5,
    },
});
