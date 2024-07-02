import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Audio } from "expo-av";
import { Marquee } from "@animatereactnative/marquee";
import { Play, DotsThree, PlusCircle } from "phosphor-react-native";
import { useFocusEffect } from "@react-navigation/native";

const MusicCard = ({ item, activeSongId, setIsBottomSheetVisible }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const artistNames = item.artists.map((artist) => artist.name).join(", ");
    const maxTitleLength = 17;
    const maxArtistNameLength = 32;

    useEffect(() => {
        if (activeSongId === item.id) {
            if (sound === null) {
                loadAndPlaySound();
            } else {
                playSound();
            }
            setIsPlaying(true);
        } else {
            if (sound !== null) {
                pauseSound();
            }
            setIsPlaying(false);
        }
    }, [activeSongId]);

    useEffect(() => {
        if (sound) {
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    // If the sound finished playing, restart it
                    sound.stopAsync().then(() => {
                        sound.setPositionAsync(0);
                        playSound();
                    });
                }
            });
        }
    }, [sound]);

    useFocusEffect(
        useCallback(() => {
            if (activeSongId === item.id && sound) {
                playSound(); // Resume playing when screen comes into focus
                setIsPlaying(true);
            }
            return () => {
                if (sound) {
                    pauseSound(); // Pause when screen loses focus
                }
            };
        }, [activeSongId, sound])
    );

    const loadAndPlaySound = async () => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync({
                uri: item.preview_url,
            });
            setSound(newSound);
            await newSound.playAsync();
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    const playSound = async () => {
        try {
            if (sound !== null) {
                await sound.playAsync();
            }
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    const pauseSound = async () => {
        try {
            if (sound !== null) {
                await sound.pauseAsync();
            }
        } catch (error) {
            console.error("Error pausing sound:", error);
        }
    };

    const togglePlayAndPause = async () => {
        try {
            if (!isPlaying) {
                playSound();
                setIsPlaying(true);
            } else {
                pauseSound();
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Error toggling play and pausing:", error);
        }
    };

    const handleBottomSheetVisible = useCallback(() => {
        setIsBottomSheetVisible(true);
    }, [setIsBottomSheetVisible]);

    const addToPlaylist = async () => {
        return;
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={togglePlayAndPause}>
                <View style={styles.artworkContainer}>
                    <Image
                        style={styles.albumCover}
                        source={{ uri: item.album.images[0].url }}
                    />
                    <View style={styles.iconContainer}>
                        {!isPlaying && activeSongId === item.id && (
                            <View style={styles.playButtonBackground}>
                                <Play weight="fill" color="white" size={36} />
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
            <View style={styles.infoContainer}>
                {item.name.length > maxTitleLength ? (
                    <Marquee speed={0.3} spacing={25} style={{ width: 260 }}>
                        <Text style={styles.title}>{item.name}</Text>
                    </Marquee>
                ) : (
                    <Text style={styles.title}>{item.name}</Text>
                )}
                {artistNames.length > maxArtistNameLength ? (
                    <View style={styles.shareAndArtist}>
                        <Marquee
                            speed={0.3}
                            spacing={20}
                            style={{ width: 240, marginRight: 60 }}
                        >
                            <Text style={styles.artist}>{artistNames}</Text>
                        </Marquee>
                        <Pressable onPress={handleBottomSheetVisible}>
                            <DotsThree weight="bold" color="white" size={36} />
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.shareAndArtist}>
                        <Text style={styles.artist}>{artistNames}</Text>
                        <Pressable onPress={handleBottomSheetVisible}>
                            <DotsThree weight="bold" color="white" size={36} />
                        </Pressable>
                    </View>
                )}
            </View>
            <View style={styles.commentsAndAdd}>
                <View style={styles.commentPreview}>
                    <Text style={styles.comment}>Comments</Text>
                </View>
                <Pressable onPress={addToPlaylist}>
                    <PlusCircle color="white" size={37} />
                </Pressable>
            </View>
        </View>
    );
};

export default MusicCard;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: 603,
        width: "100%",
        borderRadius: 20,
        backgroundColor: "#0c0c0c",
    },
    albumCover: {
        width: 350,
        height: 350,
        resizeMode: "cover",
        borderRadius: 10,
        marginTop: 25.5,
    },
    infoContainer: {
        marginTop: 55,
        width: 340,
    },
    title: {
        fontSize: 28,
        color: "white",
        fontFamily: "Inter-Bold",
    },
    artist: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
        color: "#CCCCCC",
        width: "100%",
        paddingTop: 5,
    },
    commentPreview: {
        width: 107,
        height: 37,
        backgroundColor: "rgba(217,217,217,0.2)",
        borderRadius: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    comment: {
        color: "white",
    },
    artworkContainer: {
        position: "relative",
    },
    iconContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -18 }, { translateY: -36 }],
    },

    shareAndArtist: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: 300,
        alignContent: "center",
    },
    commentsAndAdd: {
        marginTop: 7,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: 332,
        alignContent: "center",
    },
    playButtonBackground: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: [{ translateX: -18 }],
        height: 78,
        width: 78,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 50,
    },
});
