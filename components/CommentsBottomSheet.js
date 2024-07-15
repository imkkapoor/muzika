import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { PaperPlaneRight } from "phosphor-react-native";
import { User } from "../UserContext";
import { addComment, getComments } from "../functions/dbFunctions";
import EachComment from "./EachComment";

const CommentsBottomSheet = ({ isVisible, onClose, songId, songName }) => {
    const sheetRef = useRef(null);
    const [comment, setComment] = useState("");
    const [commentsToDisplay, setCommentsToDisplay] = useState([]);
    const [postingComment, setPostingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(true);
    const { currentUser } = useContext(User);
    const snapPoints = ["75%"];

    useEffect(() => {
        setComment("");
    }, [songId]);

    useEffect(() => {
        if (isVisible && !postingComment) {
            fetchComments(songId);
        }
    }, [isVisible, postingComment]);

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
        <EachComment item={item} songId={songId} currentUser={currentUser} />
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
        >
            <View style={styles.contentContainer}>
                <Text style={styles.commentTitle}>Comments</Text>
                <View style={styles.lineSeprator} />
                {loadingComments ? (
                    <ActivityIndicator
                        size="small"
                        color="white"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "center",
                            flex: 1,
                        }}
                    />
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
                        keyExtractor={(item) => item.id}
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
                            style={styles.commentInput}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Add a comment..."
                            placeholderTextColor="#979797"
                        />
                        <TouchableOpacity
                            onPress={() => {
                                addComment({
                                    comment: comment,
                                    songId: songId,
                                    songName: songName,
                                    currentUserId: currentUser.id,
                                    name: currentUser.display_name,
                                    imageLink: currentUser?.images[1].url,
                                    setPostingComment: setPostingComment,
                                    setComment: setComment,
                                });
                            }}
                        >
                            <PaperPlaneRight
                                style={styles.sendButton}
                                color="#979797"
                                weight="fill"
                                size={23}
                            ></PaperPlaneRight>
                        </TouchableOpacity>
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
