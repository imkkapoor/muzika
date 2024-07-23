import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { CaretLeft } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTracks } from "../functions/spotify";
import RecentlyAddedCard from "../components/RecentlyAddedCard";
import { User } from "../UserContext";
import { logout } from "../functions/localStorageFunctions";

const ProfileScreen = () => {
    const maxNameLength = 10;
    const maxArtistNameLength = 13;
    const navigation = useNavigation();
    const [recentlyAddedTracks, setRecentlyAddedTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(User);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
                console.error("No such user document!");
            }
        } catch (err) {
            console.error("Error in fetching recent adds:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsModalVisible(false);
        await logout();
        navigation.replace("Login");
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
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                            navigation.navigate("Main");
                        }}
                    >
                        <CaretLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>/múzika/profile</Text>
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
                <View
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: 20,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            setIsModalVisible(true);
                        }}
                        style={{
                            backgroundColor: "#0c0c0c",
                            padding: 10,
                            borderRadius: 10,
                        }}
                    >
                        <Text style={{ color: "white" }}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                Are you sure you want to logout?
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => setIsModalVisible(false)}
                                    style={[
                                        styles.buttonBox,
                                        styles.firstButtonBox,
                                    ]}
                                >
                                    <Text style={styles.buttonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={handleLogout}
                                    style={styles.buttonBox}
                                >
                                    <Text style={styles.buttonText}>
                                        Submit
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: 240,
        paddingTop: 20,
        backgroundColor: "rgba(33,33,35,1)",
        borderRadius: 20,
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 17,
        fontFamily: "Inter-Medium",
        marginBottom: 15,
        padding: 10,
        color: "white",
        textAlign: "center",
    },

    buttonContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    buttonBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        borderTopWidth: 1,
        paddingTop: 15,
        paddingBottom: 15,
        borderColor: "#2a292b",
    },
    buttonText: {
        color: "#0a84ff",
        fontSize: 16,
    },
    firstButtonBox: {
        borderRightWidth: 1,
    },
});
