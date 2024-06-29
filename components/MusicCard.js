import {
    Button,
    Image,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";

const MusicCard = ({ item, activeSongId }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [isMuted, setIsMuted] = useState(false);

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
    const toggleMute = async () => {
        try {
            if (sound !== null) {
                await sound.setVolumeAsync(isMuted ? 1.0 : 0.0);
                setIsMuted(!isMuted);
            }
        } catch (error) {
            console.error("Error toggling mute:", error);
        }
    };

    const shareSong = async (url) => {
        try {
            await Share.share({
                message: `Check out this song: ${url}`,
            });
        } catch (error) {
            console.error("Error in sharing song:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.albumCover}
                source={{ uri: item.album.images[0].url }}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.artist}>
                    {item.artists.map((artist) => artist.name).join(", ")}
                </Text>
            </View>
            <View style={styles.commentPreview}>
                <Text style={styles.comment}>Comments</Text>
            </View>
            <View>
                <Button
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    onPress={toggleMute}
                />
            </View>
            <Pressable
                onPress={() => shareSong(item.external_urls.spotify)}
                style={{
                    padding: 10,
                    backgroundColor: "white",
                    borderRadius: 5,
                }}
            >
                <Text>Share</Text>
            </Pressable>
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
        marginBottom: 20,
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
        marginTop: 20,
        width: 107,
        height: 37,
        backgroundColor: "rgba(217,217,217,0.2)",
        borderRadius: 50,
        alignSelf: "flex-start",
        marginLeft: 25,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    comment: {
        color: "white",
    },
});
