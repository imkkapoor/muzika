import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import genres from "../static/data";
import { ArrowCircleRight, Plus, X } from "phosphor-react-native";
import { db } from "../firebase";
import { User } from "../UserContext";

const ChooseGenresScreen = () => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const navigation = useNavigation();
    const {currentUser} = useContext(User)

    const handleGenrePress = (genre) => {
        if (selectedGenres.includes(genre.name)) {
            setSelectedGenres(
                selectedGenres.filter((name) => name !== genre.name)
            );
        } else if (selectedGenres.length < 5) {
            setSelectedGenres([...selectedGenres, genre.name]);
            console.log(genre.name);
            console.log(selectedGenres);
        }
    };

    const handleGenreStorage = async () => {
        try {
            await AsyncStorage.setItem(
                "selectedGenreList",
                JSON.stringify(selectedGenres)
            );
            console.log("selectedGenre:", selectedGenres);

            if (currentUser) {
                await storeGenreInFirestore(currentUser, selectedGenres);
            } else {
                console.log("User profile is null");
            }
            navigation.replace("Main");
        } catch (err) {
            console.log("Error in playlist selection:", err);
        }
    };

    const storeGenreInFirestore = async (userProfile, selectedGenres) => {
        try {
            const userDocRef = doc(db, "users", userProfile.id);
            await updateDoc(userDocRef, {
                "preferences.genre": selectedGenres,
            });
        } catch (err) {
            console.error("Error storing user data in Firestore:", err);
        }
    };

    return (
        <View style={{ backgroundColor: "black", height: "100%" }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.textBox}>
                    <Text style={styles.pageTitle}>
                        Help us understand you!
                    </Text>
                    <Text style={styles.description}>
                        Select your favorite genres, you can always change this
                        later!
                    </Text>
                </View>
                <View style={styles.genreGrid}>
                    {genres.map((genre) => (
                        <TouchableOpacity
                            key={genre.id}
                            style={[
                                styles.genreItem,
                                selectedGenres.includes(genre.name) &&
                                    styles.selectedGenreItem,
                            ]}
                            onPress={() => handleGenrePress(genre)}
                        >
                            {selectedGenres.includes(genre.name) ? (
                                <X size={15} weight="bold" color="black" />
                            ) : (
                                <Plus size={15} weight="bold" color="white" />
                            )}
                            <Text
                                style={[
                                    styles.genreText,
                                    selectedGenres.includes(genre.name) &&
                                        styles.selectedGenreText,
                                ]}
                            >
                                {genre.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View>
                    {selectedGenres.length > 0 ? (
                        <Pressable
                            style={styles.continueBox}
                            onPress={handleGenreStorage}
                        >
                            <Text style={styles.continue}>Continue</Text>
                            <ArrowCircleRight
                                size={17}
                                color="white"
                                weight="bold"
                            />
                        </Pressable>
                    ) : (
                        <Pressable
                            style={styles.continueBox}
                            onPress={() => {
                                navigation.replace("Main");
                            }}
                        >
                            <Text style={styles.continue}>
                                Skip and Continue
                            </Text>
                            <ArrowCircleRight
                                size={17}
                                color="white"
                                weight="bold"
                            />
                        </Pressable>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

export default ChooseGenresScreen;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    pageTitle: {
        color: "white",
        fontSize: 24,
        fontFamily: "Inter-SemiBold",
        marginTop: 28,
        width: "100%",
    },
    description: {
        fontSize: 15,
        fontFamily: "Inter",
        color: "white",
        marginTop: 12,
        width: 340,
    },
    genreText: {
        color: "white",
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        marginLeft: 8,
    },
    selectedGenreText: { color: "black" },
    genreGrid: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    genreItem: {
        display: "flex",
        margin: 10,
        padding: 10,
        paddingRight: 18,
        borderRadius: 30,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#191414",
    },
    selectedGenreItem: {
        backgroundColor: "#1ED760",
    },
    continue: {
        color: "white",
        marginRight: 5,
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
    },
    continueBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 65,
        backgroundColor: "#191414",
        padding: 12,
        borderRadius: 10,
    },
});
