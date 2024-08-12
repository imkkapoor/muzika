import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import NavigationBar from "../components/NavigationBar";
import { CheckCircle } from "phosphor-react-native";
import { User } from "../UserContext";
import { storeAcousticnessInFirestore } from "../functions/dbFunctions";
import LoadingFullScreen from "../loaders/LoadingFullScreen";

const AdvancedFilters = () => {
    const [selectedValue, setSelectedValue] = useState("0.5");
    const values = Array.from({ length: 11 }, (_, i) => (i * 0.1).toFixed(1));
    const [isWaiting, setIsWaiting] = useState(false);
    const { currentUser } = useContext(User);

    const handleAdvancedFilterStorage = async () => {
        setIsWaiting(true);
        try {
            if (currentUser) {
                await storeAcousticnessInFirestore(currentUser, selectedValue);
            } else {
                console.log("User profile is null");
            }
        } catch (err) {
            console.log("Error in playlist selection:", err);
        } finally {
            setIsWaiting(false);
        }
    };

    return (
        <View style={{ backgroundColor: "black", height: "100%" }}>
            <SafeAreaView style={styles.container}>
                <NavigationBar title={"/múzika/advancedFilters"} />
                <Text style={styles.label}>
                    Target Acousticness: {selectedValue}
                </Text>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(itemValue) => setSelectedValue(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {values.map((value) => (
                        <Picker.Item
                            key={value}
                            label={value.toString()}
                            value={value.toString()}
                            style={{ color: "white" }}
                        />
                    ))}
                </Picker>

                <View>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={styles.continueBox}
                        onPress={handleAdvancedFilterStorage}
                    >
                        <Text style={styles.continue}>Done</Text>
                        <CheckCircle size={17} color="white" weight="bold" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            {isWaiting && <LoadingFullScreen />}
        </View>
    );
};

export default AdvancedFilters;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 15,
        marginBottom: 10,
        color: "white",
        fontFamily: "Inter-Bold",
    },
    picker: {
        height: 150,
        width: "100%",
        backgroundColor: "black",
    },
    pickerItem: {
        height: 150,
        fontSize: 18,
        color: "white",
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
