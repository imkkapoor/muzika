import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { CaretLeft } from "phosphor-react-native";

const NavigationBar = ({title}) => {
    const navigation = useNavigation();
    return (
        <View style={styles.titleBar}>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <CaretLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

export default NavigationBar;

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
});
