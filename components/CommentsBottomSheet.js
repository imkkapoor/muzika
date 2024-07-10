import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { PaperPlaneTilt } from "phosphor-react-native";

const CommentsBottomSheet = ({ isVisible, onClose }) => {
    const sheetRef = useRef(null);

    const snapPoints = ["50%"];

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
                <Text style={{ color: "white", marginTop: 10, fontSize: 14 }}>
                    Comments
                </Text>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default CommentsBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    box: { backgroundColor: "black" },
});
