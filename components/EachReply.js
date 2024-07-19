import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Heart } from "phosphor-react-native";

const EachReply = () => {
    return (
        <View style={styles.eachReplyContainer}>
            <Image
                source={{
                    uri: "https://i.scdn.co/image/ab6775700000ee8521e81d75b7c21a09ab00863b",
                }}
                style={styles.profilePicture}
            />
            <View style={styles.nameAndReply}>
                <Text style={styles.name}>Test</Text>
                <Text style={styles.reply}>Test</Text>
                {/* <TouchableOpacity style={styles.reply}>
                    <Text>Reply</Text>
                </TouchableOpacity> */}
            </View>
            <View style={styles.replyContainer}>
                <TouchableOpacity
                    // onPress={changeLikedState}
                    style={{ padding: 3 }}
                    activeOpacity={0.6}
                >
                    {/* {isLiked ? (
                        <Heart size={17} color="red" weight="fill" />
                    ) : (
                        <Heart size={17} color="white" />
                    )} */}
                    <Heart size={17} color="white" />
                </TouchableOpacity>
                <Text style={styles.likeCount}>1</Text>
            </View>
        </View>
    );
};

export default EachReply;

const styles = StyleSheet.create({
    eachReplyContainer: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: 277,
    },
    profilePicture: {
        height: 45,
        width: 45,
        borderRadius: 100,
    },
    nameAndReply: { width: 180 },
    name: { fontSize: 12, fontFamily: "Inter-Bold", color: "white" },
    reply: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: "white",
        marginTop: 6,
    },
    replyContainer: {
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    likeCount: {
        fontFamily: "Inter-Regular",
        fontSize: 13,
        color: "white",
        marginTop: 2,
    },
});
