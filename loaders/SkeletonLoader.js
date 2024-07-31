import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";

const SkeletonLoader = ({ styleSheetRef }) => {
    return (
        <View style={styleSheetRef.skeletonParent}>
            <MotiView style={styleSheetRef.skeletonContainer}>
                <MotiView
                    from={{ opacity: 0.2 }}
                    animate={{ opacity: 0.6 }}
                    transition={{
                        type: "timing",
                        duration: 800,
                        loop: true,
                        repeatReverse: true,
                    }}
                    style={styleSheetRef.skeletonProfilePicture}
                />
                <View style={styleSheetRef.skeletonTextContainer}>
                    <MotiView
                        from={{ opacity: 0.2 }}
                        animate={{ opacity: 0.6 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[styleSheetRef.skeletonText, { width: "30%" }]}
                    />
                    <MotiView
                        from={{ opacity: 0.2 }}
                        animate={{ opacity: 0.6 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[
                            styleSheetRef.skeletonText,
                            { width: "100%", marginTop: 4 },
                        ]}
                    />
                </View>
            </MotiView>
        </View>
    );
};

export default SkeletonLoader;
