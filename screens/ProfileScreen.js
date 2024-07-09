import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    Image,
    Pressable,
    FlatList,
    ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CaretLeft } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import getUserProfile from "../functions/getUserProfile";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTracks } from "../functions/spotify";
import { Marquee } from "@animatereactnative/marquee";

const ProfileScreen = () => {
    const maxNameLength = 12;
    const maxArtistNameLength = 14;
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState(null);
    const [recentlyAddedTracks, setRecentlyAddedTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserProfile = async () => {
            const profile = await getUserProfile();
            if (profile) {
                setUserProfile(profile);
            }
        };

        loadUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile) {
            getRecentAdds();
        }
    }, [userProfile]);

    const getRecentAdds = async () => {
        setLoading(true);
        try {
            const userDocRef = doc(db, "users", userProfile.id);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                let recentAdds = userData.recentAdds || [];
                const recentlyAddedTracks = await getTracks(recentAdds);
                setRecentlyAddedTracks(recentlyAddedTracks);
            } else {
                console.log("No such user document!");
            }
        } catch (err) {
            console.error("Error in fetching recent adds:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = useCallback(
        ({ item }) => (
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
                            {item.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                        </Text>
                    </Marquee>
                ) : (
                    <Text style={styles.artist}>
                        {item.artists.map((artist) => artist.name).join(", ")}
                    </Text>
                )}
            </View>
        ),
        [recentlyAddedTracks]
    );

    return (
        <View
            style={{
                backgroundColor: "black",
                height: "100%",
            }}
        >
            <SafeAreaView>
                <View style={styles.titleBar}>
                    <Pressable
                        onPress={() => {
                            navigation.navigate("Main");
                        }}
                    >
                        <CaretLeft size={24} color="white" />
                    </Pressable>
                    <Text style={styles.title}>Profile</Text>
                </View>
                <View style={styles.personalInfoContainer}>
                    <Image
                        source={{ uri: userProfile?.images[1].url }}
                        style={styles.profilePicture}
                    />
                    <View style={styles.nameAndEmailContainer}>
                        <Text style={styles.name}>
                            {userProfile?.display_name}
                        </Text>
                        <Text style={styles.email}>{userProfile?.email}</Text>
                    </View>
                </View>

                <View style={styles.recentlyAddedContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <FlatList
                            data={recentlyAddedTracks}
                            renderItem={renderItem}
                            horizontal={true}
                            snapToInterval={149}
                            snapToAlignment="start"
                            decelerationRate="fast"
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    titleBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 30,
        marginTop: 10,
        width: "90%",
        alignSelf: "center",
    },
    title: {
        color: "white",
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        alignSelf: "center",
        margin: "auto",
    },
    profilePicture: {
        height: 120,
        width: 120,
        borderRadius: 60,
    },
    name: {
        color: "white",
        fontSize: 20,
        fontFamily: "Inter-Bold",
        paddingBottom: 2,
    },
    email: { color: "#CCCCCC", fontSize: 14, fontFamily: "Inter-SemiBold" },
    personalInfoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    nameAndEmailContainer: {
        marginLeft: 23,
    },

    recentlyAddedContainer: {
        marginTop: 50,
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        height: 194,
    },
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
