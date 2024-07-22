import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useState } from "react";
import { Heart } from "phosphor-react-native";
import { getReplies, toggleCommentLike } from "../functions/dbFunctions";
import EachReply from "./EachReply";

const EachComment = ({
    item,
    songId,
    currentUser,
    inputRef,
    setInputPlaceholder,
    setIsReplying,
    setReplyToCommentId,
}) => {
    const [updatingLikes, setUpdatingLikes] = useState(false);
    const [isLiked, setIsLiked] = useState(
        item.likedBy.includes(currentUser.id)
    );
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [replies, setReplies] = useState([]);
    const [repliesAreVisible, setRepliesAreVisible] = useState(false);
    const [repliesAreLoading, setRepliesAreLoading] = useState(false);
    const commentId = item.id;

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
    const handleReply = async () => {
        setInputPlaceholder(`Replying to ${item.username}`);
        setIsReplying(true);
        setReplyToCommentId(item.id);
        inputRef.current.focus();
    };

    const fetchReplies = async () => {
        try {
            setRepliesAreLoading(true);
            if (!repliesAreVisible) {
                setRepliesAreVisible(!repliesAreVisible);

                const data = await getReplies({
                    songId: songId,
                    commentId: item.id,
                });
                setReplies(data);
            } else {
                setRepliesAreVisible(!repliesAreVisible);
            }
        } catch (err) {
            console.error("Error fetching replies:", err);
        } finally {
            setRepliesAreLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <EachReply
                item={item}
                currentUser={currentUser}
                commentId={commentId}
                songId={songId}
            />
        );
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
                <TouchableOpacity
                    style={styles.ReplyToAComment}
                    onPress={handleReply}
                >
                    <Text style={styles.ReplyToACommentText}>Reply</Text>
                </TouchableOpacity>
                {repliesAreVisible &&
                    (repliesAreLoading ? (
                        <ActivityIndicator
                            size="small"
                            color="white"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "center",
                                height: 60,
                            }}
                        />
                    ) : (
                        <View style={styles.replyContainer}>
                            <FlatList
                                data={replies}
                                renderItem={renderItem}
                                ItemSeparatorComponent={
                                    <View style={{ height: 20 }} />
                                }
                            />
                        </View>
                    ))}
                {item.replyCount > 0 && (
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignContent: "center",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <View
                            style={{
                                borderWidth: 0.25,
                                width: 30,
                                marginTop: 8,
                                borderColor: "#555555",
                            }}
                        ></View>
                        <TouchableOpacity
                            style={styles.toggleReplyView}
                            onPress={fetchReplies}
                        >
                            {repliesAreVisible ? (
                                <Text style={styles.toggleReplyViewText}>
                                    Hide Replies
                                </Text>
                            ) : (
                                <Text style={styles.toggleReplyViewText}>
                                    View Replies
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.likeContainer}>
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

export default EachComment;

const styles = StyleSheet.create({
    eachCommentContainer: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
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
    replyContainer: {
        marginTop: 20,
    },
    toggleReplyView: { marginTop: 8, marginLeft: 15 },
    toggleReplyViewText: {
        color: "#979797",
        fontSize: 12,
        fontFamily: "Inter-Regular",
    },
    ReplyToAComment: {
        marginTop: 10,
    },
    ReplyToACommentText: {
        color: "#979797",
        fontSize: 12,
        fontFamily: "Inter-SemiBold",
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
