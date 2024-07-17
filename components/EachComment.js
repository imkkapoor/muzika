import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Heart } from "phosphor-react-native";
import { toggleCommentLike } from "../functions/dbFunctions";

const EachComment = ({ item, songId, currentUser }) => {
    const [updatingLikes, setUpdatingLikes] = useState(false);
    const [isLiked, setIsLiked] = useState(
        item.likedBy.includes(currentUser.id)
    );
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const changeLikedState = async () => {
        if (updatingLikes) {
            return;
        }
        setUpdatingLikes(true);
        setIsLiked(!isLiked);
        setLikeCount(!isLiked ? likeCount + 1 : likeCount - 1);
        try {
            if (
                (await toggleCommentLike({ item, songId, currentUser })) == -1
            ) {
                setIsLiked(!isLiked);
                setLikeCount(likeCount - 1);
            }
        } catch (err) {
            console.error("Error in liking the comment");
        } finally {
            setUpdatingLikes(false);
        }
    };
    return (
        <View style={styles.eachCommentContainer}>
            <Image
                source={{ uri: item.profileImage }}
                style={styles.profilePicture}
            />
            <View style={styles.nameAndComment}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.comment}>{item.content}</Text>
            </View>
            <View style={styles.likeContainer}>
                <TouchableOpacity
                    onPress={changeLikedState}
                    style={{ padding: 3 }}
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

export default EachComment;

const styles = StyleSheet.create({
    eachCommentContainer: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: 336,
    },
    profilePicture: {
        height: 45,
        width: 45,
        borderRadius: 100,
    },
    nameAndComment: { width: 240 },
    name: { fontSize: 12, fontFamily: "Inter-Bold", color: "white" },
    comment: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: "white",
        marginTop: 4,
    },
    likeContainer: {
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
