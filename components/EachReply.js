import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Heart } from "phosphor-react-native";
import { toggleReplyLike } from "../functions/dbFunctions";

const EachReply = ({ item, currentUser, commentId, songId }) => {
    const [isLiked, setIsLiked] = useState(
        item.likedBy.includes(currentUser.id)
    );
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [updatingLikes, setUpdatingLikes] = useState(false);

    const changeLikedState = async () => {
        if (updatingLikes) {
            return;
        }
        setUpdatingLikes(true);
        setIsLiked(!isLiked);
        setLikeCount(!isLiked ? likeCount + 1 : likeCount - 1);
        try {
            if (
                (await toggleReplyLike({
                    item,
                    songId,
                    commentId,
                    currentUser,
                })) == -1
            ) {
                setIsLiked(!isLiked);
                setLikeCount(likeCount - 1);
            }
        } catch (err) {
            console.error("Error in liking the reply", err);
        } finally {
            setUpdatingLikes(false);
        }
    };

    return (
        <View style={styles.eachReplyContainer}>
            <Image
                source={{
                    uri: "https://i.scdn.co/image/ab6775700000ee8521e81d75b7c21a09ab00863b",
                }}
                style={styles.profilePicture}
            />
            <View style={styles.nameAndReply}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.reply}>{item.content}</Text>
            </View>
            <View style={styles.replyContainer}>
                <TouchableOpacity
                    onPress={changeLikedState}
                    style={{ padding: 3 }}
                    activeOpacity={0.6}
                >
                    {isLiked ? (
                        <Heart size={17} color="red" weight="fill" />
                    ) : (
                        <Heart size={17} color="white" />
                    )}
                </TouchableOpacity>
                <Text style={styles.likeCount}>{likeCount}</Text>
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
        height: 30,
        width: 30,
        borderRadius: 100,
    },
    nameAndReply: { width: 195 },
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
