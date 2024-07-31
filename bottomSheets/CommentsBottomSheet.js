import {
    Easing,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { PaperPlaneRight } from "phosphor-react-native";
import { User } from "../UserContext";
import { addComment, addReply, getComments } from "../functions/dbFunctions";
import EachComment from "../components/EachComment";
import SkeletonLoader from "../loaders/SkeletonLoader";

const CommentsBottomSheet = ({ isVisible, onClose, songId, songName }) => {
    const sheetRef = useRef(null);
    const inputRef = useRef(null);
    const [comment, setComment] = useState("");
    const [commentsToDisplay, setCommentsToDisplay] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const { currentUser } = useContext(User);
    const snapPoints = ["75%"];
    const [isReplying, setIsReplying] = useState(false);
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [inputPlaceholder, setInputPlaceholder] =
        useState("Add a comment...");
    const opacity = useRef(new Animated.Value(0)).current;
    const position = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        setComment("");
    }, [songId]);

    useEffect(() => {
        if (isVisible) {
            fetchComments(songId);
        }
    }, [isVisible]);

    const fetchComments = async (songId) => {
        setLoadingComments(true);
        try {
            const comments = await getComments(songId);
            setCommentsToDisplay(comments);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const renderItem = ({ item }) => (
        <EachComment
            item={item}
            songId={songId}
            currentUser={currentUser}
            inputRef={inputRef}
            setInputPlaceholder={setInputPlaceholder}
            setIsReplying={setIsReplying}
            setReplyToCommentId={setReplyToCommentId}
            commentsToDisplay={commentsToDisplay}
        />
    );

    const keyExtractor = useCallback((item) => item.id, []);

    const handleInputFocus = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
            Animated.timing(position, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
        ]).start();
    };

    const handleInputBlur = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
            Animated.timing(position, {
                toValue: -150,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
        ]).start();
        setReplyToCommentId(null);
        setIsReplying(false);
        setInputPlaceholder("Add a comment...");
    };

    const handleSubmit = () => {
        if (isReplying) {
            const newReply = {
                id: Date.now().toString(),
                userId: currentUser.id,
                username: currentUser.display_name,
                content: comment,
                likeCount: 0,
                likedBy: [],
                profileImage: currentUser?.images[1].url,
            };

            setCommentsToDisplay((prevComments) =>
                prevComments.map((commentItem) =>
                    commentItem.id === replyToCommentId
                        ? {
                              ...commentItem,
                              replies: [
                                  ...(commentItem.replies || []),
                                  newReply,
                              ],
                          }
                        : commentItem
                )
            );

            addReply({
                reply: comment,
                songId: songId,
                commentId: replyToCommentId,
                currentUserId: currentUser.id,
                name: currentUser.display_name,
                imageLink: currentUser?.images[1].url,
                setReply: setComment,
                setCommentsToDisplay: setCommentsToDisplay,
            });
        } else {
            addComment({
                comment: comment,
                songId: songId,
                songName: songName,
                currentUserId: currentUser.id,
                name: currentUser.display_name,
                imageLink: currentUser?.images[1].url,
                setComment: setComment,
                setCommentsToDisplay: setCommentsToDisplay,
            });
        }
    };

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={isVisible ? 0 : -1}
            snapPoints={snapPoints}
            onClose={onClose}
            enablePanDownToClose={true}
            style={styles.box}
            backgroundStyle={{ backgroundColor: "#262626" }}
            handleIndicatorStyle={{
                backgroundColor: "#979797",
                height: 5,
                width: 55,
            }}
            keyboardBehavior="extend"
            backdropComponent={renderBackdrop}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.commentTitle}>Comments</Text>
                <View style={styles.lineSeprator} />
                {loadingComments ? (
                    <SkeletonLoader styleSheetRef={commentsSkeleton} />
                ) : commentsToDisplay.length == 0 ? (
                    <View
                        style={{
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "center",
                            flex: 1,
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 18,
                                fontFamily: "Inter-SemiBold",
                            }}
                        >
                            No comments yet
                        </Text>
                        <Text
                            style={{
                                color: "#979797",
                                fontSize: 15,
                                fontFamily: "Inter-SemiBold",
                                marginTop: 8,
                            }}
                        >
                            Say something!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={commentsToDisplay}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ItemSeparatorComponent={<View style={{ height: 20 }} />}
                        style={styles.listStyle}
                        contentContainerStyle={{
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "center",
                            marginTop: 26,
                            paddingBottom: 35,
                        }}
                    />
                )}
                <View style={styles.inputContainer}>
                    <View style={styles.borderBox}>
                        <BottomSheetTextInput
                            ref={inputRef}
                            style={styles.commentInput}
                            value={comment}
                            onChangeText={setComment}
                            placeholder={inputPlaceholder}
                            placeholderTextColor="#979797"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                        <Animated.View
                            style={{
                                opacity,
                                transform: [{ translateX: position }],
                            }}
                        >
                            <TouchableOpacity onPress={handleSubmit}>
                                <PaperPlaneRight
                                    style={styles.sendButton}
                                    color="#979797"
                                    weight="fill"
                                    size={23}
                                ></PaperPlaneRight>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </View>
        </BottomSheet>
    );
};

export default CommentsBottomSheet;

const styles = StyleSheet.create({
    box: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "black",
        flex: 1,
    },
    commentTitle: {
        color: "white",
        marginTop: 22,
        fontSize: 15,
        fontFamily: "Inter-Bold",
        alignSelf: "center",
    },
    lineSeprator: {
        borderTopWidth: 0.4,
        borderColor: "#979797",
        marginTop: 20,
        width: "100%",
    },
    commentContainer: {
        width: "100%",
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 26,
    },
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
    box: {},
    inputContainer: {
        flexDirection: "row",
        backgroundColor: "#101010",
        alignSelf: "center",
        width: 369,
        marginTop: 13,
        height: 50,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    borderBox: {
        display: "flex",
        width: 334,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },
    commentInput: {
        color: "white",
        backgroundColor: "#101010",
        width: "90%",
        padding: 8,
        width: 312,
        borderRadius: 50,
        height: 50,
    },
    contentContainer: {
        // flex:1,
        height: "95%",
    },
});

const commentsSkeleton = StyleSheet.create({
    skeletonParent: {
        display: "flex",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        marginTop: 26,
        paddingBottom: 35,
        flex: 1,
    },
    skeletonContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 10,
        width: 336,
        flex: 1,
    },

    skeletonProfilePicture: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: "#979797",
        marginRight: 10,
    },

    skeletonTextContainer: {
        width: 240,
        display: "flex",
        justifyContent: "center",
        height: 40,
    },

    skeletonText: {
        height: 8,
        backgroundColor: "#979797",
        marginBottom: 6,
        borderRadius: 4,
    },
});
