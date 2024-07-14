import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import BottomSheet, { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Heart, PaperPlaneRight } from "phosphor-react-native";
import { User } from "../UserContext";

const CommentsBottomSheet = ({ isVisible, onClose }) => {
    const sheetRef = useRef(null);
    const [comment, setComment] = useState("");
    const { currentUser } = useContext(User);
    const comments = [
        { id: "1", name: "John Doe", text: "Love this song!" },
        { id: "2", name: "Jane Smith", text: "Great melody!" },
        { id: "3", name: "Alex Jones", text: "Amazing lyrics!" },
        { id: "4", name: "Emily Clark", text: "This track is fire!" },
        { id: "5", name: "Michael Brown", text: "Can't stop listening!" },
        { id: "6", name: "Sarah White", text: "On repeat!" },
        { id: "7", name: "David Lee", text: "Such a vibe!" },
        { id: "8", name: "Linda Wilson", text: "Incredible production!" },
        { id: "9", name: "Robert Taylor", text: "Masterpiece!" },
        { id: "10", name: "Patricia Moore", text: "Beautiful!" },
        {
            id: "11",
            name: "James Anderson",
            text: "My favorite song right now!",
        },
        { id: "12", name: "Mary Thomas", text: "So good!" },
        { id: "13", name: "Daniel Jackson", text: "Fantastic track!" },
        { id: "14", name: "Laura Harris", text: "Absolutely love it!" },
        { id: "15", name: "Kevin Martin", text: "Great job!" },
    ];
    const snapPoints = ["75%"];

    const renderItem = ({ item }) => (
        <View style={styles.eachCommentContainer}>
            <Image
                source={{ uri: currentUser?.images[1].url }}
                style={styles.profilePicture}
            />
            <View style={styles.nameAndComment}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.comment}>{item.text}</Text>
            </View>
            <Heart size={17} color="white" />
        </View>
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
                <FlatList
                    data={comments}
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
                <View style={styles.inputContainer}>
                    <View style={styles.borderBox}>
                        <BottomSheetTextInput
                            style={styles.commentInput}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Add a comment..."
                            placeholderTextColor="#979797"
                        />
                        <TouchableOpacity>
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
        marginTop: 7,
    },
    box: {
        backgroundColor: "black",
        //  flex: 1
    },
    inputContainer: {
        flexDirection: "row",
        backgroundColor: "#101010",
        alignSelf: "center",
        width: 369,
        marginTop: 12,
        height: 50,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
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
        padding: 20,
        width: 312,
        borderRadius: 50,
        height: 50,
    },
    contentContainer: {
        flex: 1,
    },
});
