import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Audio } from "expo-av";
import { Marquee } from "@animatereactnative/marquee";
import {
    Play,
    DotsThree,
    PlusCircle,
    CheckCircle,
} from "phosphor-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPlaylistId } from "../functions/dbFunctions";

const MusicCard = ({
    item,
    activeSongId,
    setIsBottomSheetVisible,
    setWaitingPlaylistAddition,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const artistNames = item.artists.map((artist) => artist.name).join(", ");

    const [isAdded, setIsAdded] = useState(false);
    const maxTitleLength = 17;
    const maxArtistNameLength = 32;
    const [positionMillis, setPositionMillis] = useState(0);

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
                if (status.isLoaded) {
                    setPositionMillis(status.positionMillis);
                }
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

    // for stoping when the thing goes out of focus
    useFocusEffect(
        useCallback(() => {
            if (activeSongId === item.id && sound) {
                playSound();
                setIsPlaying(true);
            }
            return () => {
                if (sound) {
                    pauseSound();
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

    // const getPlaylistId = async (userProfile) => {
    //     spotifyUserId = userProfile.id;
    //     const userDocRef = doc(db, "users", spotifyUserId);
    //     try {
    //         const userDoc = await getDoc(userDocRef);
    //         if (userDoc.exists()) {
    //             const playlistId = userDoc.data().playlistId;
    //             return playlistId;
    //         } else {
    //             return null;
    //         }
    //     } catch (error) {
    //         console.error("Error getting playlist ID:", error);
    //         return false;
    //     }
    // };

    const addSongToRecentAdds = async (userProfile) => {
        try {
            const userDocRef = doc(db, "users", userProfile.id);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                let recentAdds = userData.recentAdds || [];
                if (recentAdds.length != 0) {
                    recentAdds = recentAdds.filter(
                        (recentItem) => recentItem.itemId !== item.id
                    );
                }

                recentAdds.unshift({
                    itemId: item.id,
                });

                if (recentAdds.length > 5) {
                    recentAdds.pop();
                }

                await updateDoc(userDocRef, {
                    recentAdds: recentAdds,
                });
            } else {
                console.log("No such user document!");
            }
        } catch (err) {
            console.error("Error in adding to recent adds:", err);
        }
    };

    const addToPlaylist = async () => {
        setWaitingPlaylistAddition(true);
        const userProfileString = await AsyncStorage.getItem("userProfile");
        const userProfile = JSON.parse(userProfileString);
        const playlistId = await getPlaylistId(userProfile);
        const accessToken = await AsyncStorage.getItem("token");

        if (!accessToken) {
            console.error("No access token found");
            return;
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uris: [item.uri],
                    }),
                }
            );
            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to add track to playlist");
            }

            const data = await response.json();
            console.log("Track added to playlist:", data);
            addSongToRecentAdds(userProfile);
            setIsAdded(true);
        } catch (error) {
            console.error("Error adding track to the playlist:", error);
            Alert.alert("Please try again!");
        } finally {
            setWaitingPlaylistAddition(false);
        }
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
                {isAdded ? (
                    <CheckCircle color="#1ED760" size={37} weight="fill" />
                ) : (
                    <Pressable onPress={addToPlaylist}>
                        <PlusCircle color="white" size={37} />
                    </Pressable>
                )}
            </View>
            <View style={styles.progressBar}>
                <View
                    style={[
                        {
                            width: `${((positionMillis / 30000) * 100).toFixed(
                                2
                            )}%`, // 30000 milliseconds = 30 seconds
                        },
                        styles.progressMade,
                    ]}
                />
            </View>
            <View style={styles.durationContainer}>
                <Text style={styles.duration}>
                    {`0:${
                        Math.ceil(positionMillis / 1000) < 10 ? "0" : ""
                    }${Math.ceil(positionMillis / 1000)}`}
                </Text>
                <Text style={styles.duration}>0:30</Text>
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
        marginTop: 51,
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
    progressBar: {
        width: 345,
        height: 2,
        backgroundColor: "#979797",
        borderRadius: 5,
        marginTop: 26,
        position: "relative",
    },
    progressMade: {
        backgroundColor: "#ffffff",
        height: 2,
        borderRadius: 5,
        position: "absolute",
        top: 0,
        left: 0,
    },
    durationContainer: {
        width: 345,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    duration: {
        marginTop: 5,
        color: "white",
        fontSize: 11,
        fontFamily: "Inter-ExtraLight",
    },
});
