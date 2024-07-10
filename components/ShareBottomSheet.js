import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { PaperPlaneTilt } from "phosphor-react-native";

const ShareBottomSheet = ({ isVisible, onClose, url, name }) => {
    const sheetRef = useRef(null);

    const snapPoints = ["35%"];

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
                            <PaperPlaneTilt weight="fill" color="white" />
                            <Text style={styles.shareButton}>Share</Text>
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
    shareButton: {
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
