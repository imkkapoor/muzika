import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { MaskHappy, Playlist } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";

const ChangePreferencesBottomSheet = ({
    isChangePreferencesBottomSheetVisible,
    onClose,
}) => {
    const sheetRef = useRef(null);
    const snapPoints = ["27%"];
    const navigation = useNavigation();

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={isChangePreferencesBottomSheetVisible ? 0 : -1}
            snapPoints={snapPoints}
            onClose={onClose}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: "#262626" }}
            handleIndicatorStyle={{
                backgroundColor: "#979797",
                height: 5,
                width: 55,
            }}
            backdropComponent={renderBackdrop}
        >
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    activeOpacity={0.6}
                    style={{
                        margin: 15,
                        padding: 10,
                        width: "90%",
                    }}
                    onPress={() => {
                        navigation.navigate("ChangeSelectedPlaylist");
                    }}
                >
                    <View style={styles.optionContainer}>
                        <View style={styles.eachOption}>
                            <Playlist weight="fill" color="white" size={26} />
                            <Text style={styles.button}>
                                Change selected Playlist
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.6}
                    style={{
                        margin: 15,
                        padding: 10,
                        width: "90%",
                        marginTop: 0,
                    }}
                    onPress={() => {
                        navigation.navigate("ChangeSelectedGenre");
                    }}
                >
                    <View style={styles.optionContainer}>
                        <View style={styles.eachOption}>
                            <MaskHappy weight="fill" color="white" size={26} />
                            <Text style={styles.button}>
                                Change selected genres
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
};

export default ChangePreferencesBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
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
