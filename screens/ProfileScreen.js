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
import React, { useCallback, useContext, useEffect, useState } from "react";
import { CaretLeft } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTracks } from "../functions/spotify";
import RecentlyAddedCard from "../components/RecentlyAddedCard";
import { User } from "../UserContext";

const ProfileScreen = () => {
    const maxNameLength = 12;
    const maxArtistNameLength = 14;
    const navigation = useNavigation();
    const [recentlyAddedTracks, setRecentlyAddedTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(User);

    useEffect(() => {
        if (currentUser) {
            getRecentAdds();
        }
    }, [currentUser]);

    const getRecentAdds = async () => {
        setLoading(true);
        try {
            const userDocRef = doc(db, "users", currentUser.id);
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
            <RecentlyAddedCard
                item={item}
                maxArtistNameLength={maxArtistNameLength}
                maxNameLength={maxNameLength}
            />
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
                        source={{ uri: currentUser?.images[1].url }}
                        style={styles.profilePicture}
                    />
                    <View style={styles.nameAndEmailContainer}>
                        <Text style={styles.name}>
                            {currentUser?.display_name}
                        </Text>
                        <Text style={styles.email}>{currentUser?.email}</Text>
                    </View>
                </View>
                <View style={styles.recentlyAddedBox}>
                    <Text style={styles.recentAddText}>Your recent adds</Text>
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
    recentlyAddedBox: {
        marginTop: 50,
    },
    recentlyAddedContainer: {
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        height: 194,
        marginTop: 5,
    },
    recentAddText: {
        marginLeft: 30,
        color: "white",
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
    },
});
