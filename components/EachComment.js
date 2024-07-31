import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Heart } from "phosphor-react-native";
import { getReplies, toggleCommentLike } from "../functions/dbFunctions";
import EachReply from "./EachReply";
import SkeletonLoader from "../loaders/SkeletonLoader";

const ReplyState = {
    HIDDEN: "hidden",
    VISIBLE: "visible",
    LOAD_MORE: "load_more",
};

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
    const [repliesAreVisible, setRepliesAreVisible] = useState(
        ReplyState.HIDDEN
    );
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

    const getToggleText = () => {
        switch (repliesAreVisible) {
            case ReplyState.VISIBLE:
                return "Hide Replies";
            case ReplyState.LOAD_MORE:
                return "Load More";
            case ReplyState.HIDDEN:
            default:
                return "View Replies";
        }
    };
    const fetchReplies = async () => {
        try {
            if (
                repliesAreVisible === ReplyState.HIDDEN ||
                repliesAreVisible === ReplyState.LOAD_MORE
            ) {
                setRepliesAreVisible(ReplyState.VISIBLE);
                if (replies.length === item.replyCount) {
                    return;
                }
                setRepliesAreLoading(true);

                const data = await getReplies({
                    songId: songId,
                    commentId: item.id,
                });
                setReplies(data);
            } else {
                setRepliesAreVisible(ReplyState.HIDDEN);
            }
        } catch (err) {
            console.error("Error fetching replies:", err);
        } finally {
            setRepliesAreLoading(false);
        }
    };

    useEffect(() => {
        if (item.replies) {
            setReplies([...item.replies, ...replies]);
            if (item.replyCount > 1) {
                setRepliesAreVisible(ReplyState.LOAD_MORE);
            } else {
                setRepliesAreVisible(ReplyState.VISIBLE);
            }
        }
    }, [item.replies]);

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

    const keyExtractor = useCallback((item) => item.id, [replies]);
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
                {repliesAreVisible !== ReplyState.HIDDEN && (
                    <View style={styles.replyContainer}>
                        <FlatList
                            data={replies}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            ItemSeparatorComponent={
                                <View style={{ height: 20 }} />
                            }
                            ListFooterComponent={
                                repliesAreLoading && (
                                    <SkeletonLoader
                                        styleSheetRef={repliesSkeleton}
                                    />
                                )
                            }
                        />
                    </View>
                )}

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
                            <Text style={styles.toggleReplyViewText}>
                                {getToggleText()}
                            </Text>
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

const repliesSkeleton = StyleSheet.create({
    skeletonParent: {
        display: "flex",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        height: 60,
    },
    skeletonContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 10,
        width: 277,
        marginLeft: 40,
    },

    skeletonProfilePicture: {
        width: 30,
        height: 30,
        borderRadius: 22.5,
        backgroundColor: "#979797",
        marginRight: 10,
    },

    skeletonTextContainer: {
        width: 195,
        display: "flex",
        justifyContent: "center",
        height: 35,
    },
    skeletonText: {
        height: 6,
        backgroundColor: "#979797",
        marginBottom: 6,
        borderRadius: 4,
    },
});
