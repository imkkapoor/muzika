import { ActivityIndicator, View } from "react-native";
import React from "react";

const LoadingFullScreen = () => {
    return (
        <View
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 100,
                position: "absolute",
                height: "100%",
                width: "100%",
            }}
        >
            <ActivityIndicator size="small" color="white" />
        </View>
    );
};

export default LoadingFullScreen;
