import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import React, { useContext, useRef } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { MinusCircle, PaperPlaneTilt } from "phosphor-react-native";
import { User } from "../UserContext";
import { addSongIdToNotInterested } from "../functions/dbFunctions";

const ShareBottomSheet = ({ isVisible, onClose, url, name, itemId }) => {
    const { currentUser } = useContext(User);
    const sheetRef = useRef(null);
    const snapPoints = ["38%"];
    const shareSong = async (url) => {
        try {
            await Share.share({
                message: `Check out ${name}, here ${url}`,
            });
        } catch (error) {
            console.error("Error in sharing song:", error);
        }
    };

    return (
        <BottomSheet
            ref={sheetRef}
            index={isVisible ? 0 : -1}
            snapPoints={snapPoints}
            onClose={onClose}
            enablePanDownToClose={true}
            style={styles.box}
            backgroundStyle={{ backgroundColor: "#262626" }}
            handleIndicatorStyle={{
                backgroundColor: "#979797",
                height: 5,
                width: 55,
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Pressable
                    onPress={() => shareSong(url)}
                    style={{
                        margin: 15,
                        padding: 10,
                        width: "90%",
                    }}
                >
                    <View style={styles.optionContainer}>
                        <View style={styles.eachOption}>
                            <PaperPlaneTilt
                                weight="fill"
                                color="white"
                                size={24}
                            />
                            <Text style={styles.button}>Share</Text>
                        </View>
                    </View>
                </Pressable>
                <Pressable
                    onPress={() => {
                        addSongIdToNotInterested({itemId, currentUser});
                    }}
                    style={{
                        margin: 15,
                        padding: 10,
                        width: "90%",
                        marginTop: 0,
                    }}
                >
                    <View style={styles.optionContainer}>
                        <View style={styles.eachOption}>
                            <MinusCircle
                                weight="fill"
                                color="white"
                                size={26}
                            />
                            <Text style={styles.button}>Not interested</Text>
                        </View>
                    </View>
                </Pressable>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default ShareBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    box: { backgroundColor: "black" },
    button: {
        color: "white",
        fontSize: 16,
        paddingLeft: 25,
    },
    optionContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    },
    eachOption: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
});
