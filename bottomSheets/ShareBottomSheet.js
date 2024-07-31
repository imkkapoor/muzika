import {
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { MinusCircle, PaperPlaneTilt } from "phosphor-react-native";
import { User } from "../UserContext";
import { addSongIdToNotInterested } from "../functions/dbFunctions";

const ShareBottomSheet = ({
    setIsBottomSheetVisible,
    isBottomSheetVisible,
    onClose,
    url,
    name,
    itemId,
}) => {
    const { currentUser } = useContext(User);
    const sheetRef = useRef(null);
    const snapPoints = ["27%"];

    const [isModalVisible, setIsModalVisible] = useState(false);

    const shareSong = async (url) => {
        try {
            await Share.share({
                message: `Check out ${name}, here ${url}`,
            });
        } catch (error) {
            console.error("Error in sharing song:", error);
        }
    };

    useEffect(() => {
        if (isModalVisible) {
            const timer = setTimeout(() => {
                setIsModalVisible(false);
            }, 1000);
            return () => clearTimeout(timer); // Cleanup the timeout if the component unmounts or the effect re-runs
        } else {
            sheetRef.current?.close();
        }
    }, [isModalVisible]);

    useEffect(() => {
        if (isBottomSheetVisible) {
            sheetRef.current?.expand();
        } else {
            sheetRef.current?.close();
        }
    }, [isBottomSheetVisible]);

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
        <>
            <BottomSheet
                ref={sheetRef}
                index={isBottomSheetVisible ? 0 : -1}
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
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <TouchableOpacity
                        activeOpacity={0.6}
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
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                            addSongIdToNotInterested({
                                itemId,
                                currentUser,
                                setIsBottomSheetVisible,
                                setIsModalVisible,
                            });
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
                                <Text style={styles.button}>
                                    Not interested
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
            <Modal
                transparent={true}
                animationType="fade"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <MinusCircle weight="light" color="white" size={60} />
                        <Text
                            style={{
                                color: "white",
                                fontSize: 12,
                                fontFamily: "Inter-Medium",
                                textAlign: "center",
                                marginTop: 6,
                            }}
                        >
                            Song added to not interested
                        </Text>
                    </View>
                </View>
            </Modal>
        </>
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
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: 150,
        padding: 20,
        backgroundColor: "rgba(33,33,35,0.95)",
        borderRadius: 20,
        alignItems: "center",
    },
});
