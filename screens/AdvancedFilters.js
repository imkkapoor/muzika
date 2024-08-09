import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import NavigationBar from "../components/NavigationBar";

const AdvancedFilters = () => {
    const [selectedValue, setSelectedValue] = useState("0.5");
    const values = Array.from({ length: 11 }, (_, i) => (i * 0.1).toFixed(1));

    return (
        <View style={styles.container}>
            <SafeAreaView>
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
            </SafeAreaView>
        </View>
    );
};

export default AdvancedFilters;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        padding: 20,
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
});
