import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";

const CommentsSkeleton = () => {
    return (
        <View
            style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                marginTop: 26,
                paddingBottom: 35,
                flex: 1,
            }}
        >
            <MotiView style={styles.skeletonContainer}>
                <MotiView
                    from={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        type: "timing",
                        duration: 800,
                        loop: true,
                        repeatReverse: true,
                    }}
                    style={styles.skeletonProfilePicture}
                />
                <View style={styles.skeletonTextContainer}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[styles.skeletonText, { width: "30%" }]}
                    />
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[
                            styles.skeletonText,
                            { width: "100%", marginTop: 4 },
                        ]}
                    />
                </View>
            </MotiView>
        </View>
    );
};

const RepliesSkeleton = () => {
    return (
        <View
            style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                height: 60,
            }}
        >
            <MotiView style={styles.repliesSkeletonContainer}>
                <MotiView
                    from={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        type: "timing",
                        duration: 800,
                        loop: true,
                        repeatReverse: true,
                    }}
                    style={styles.repliesSkeletonProfilePicture}
                />
                <View style={styles.repliesSkeletonTextContainer}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[styles.repliesSkeletonText, { width: "30%" }]}
                    />
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: "timing",
                            duration: 800,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={[
                            styles.repliesSkeletonText,
                            { width: "100%", marginTop: 4 },
                        ]}
                    />
                </View>
            </MotiView>
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 10,
        width: 336,
        flex: 1,
    },
    repliesSkeletonContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 10,
        width: 277,
        marginLeft: 40,
    },

    skeletonProfilePicture: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: "#e0e0e0",
        marginRight: 10,
    },
    repliesSkeletonProfilePicture: {
        width: 30,
        height: 30,
        borderRadius: 22.5,
        backgroundColor: "#e0e0e0",
        marginRight: 10,
    },
    skeletonTextContainer: {
        width: 240,
        display: "flex",
        justifyContent: "center",
        height: 40,
    },
    repliesSkeletonTextContainer: {
        width: 195,
        display: "flex",
        justifyContent: "center",
        height: 35,
    },
    skeletonText: {
        height: 8,
        backgroundColor: "#e0e0e0",
        marginBottom: 6,
        borderRadius: 4,
    },
    repliesSkeletonText: {
        height: 6,
        backgroundColor: "#e0e0e0",
        marginBottom: 6,
        borderRadius: 4,
    },
});

export { CommentsSkeleton, RepliesSkeleton };
