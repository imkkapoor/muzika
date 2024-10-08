import {
    arrayUnion,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
    Timestamp,
    query,
    getDocs,
    arrayRemove,
    where,
    runTransaction,
    orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { Keyboard } from "react-native";
import { setSelectedPlaylistId } from "./localStorageFunctions";

const getPlaylistId = async (userProfile) => {
    try {
        if (!userProfile) {
            throw new Error("userProfile is null");
        }
        spotifyUserId = userProfile.id;
        const userDocRef = doc(db, "users", spotifyUserId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const playlistId = userDoc.data().playlistId;
            return playlistId;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting playlist ID:", error);
        return false;
    }
};

const checkUserExists = async (spotifyUserId) => {
    const userDocRef = doc(db, "users", spotifyUserId);
    try {
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists(); // true if the user exists, false otherwise
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

const addSongIdToNotInterested = async ({
    itemId,
    currentUser,
    setIsBottomSheetVisible,
    setIsModalVisible,
}) => {
    setIsBottomSheetVisible(false);
    setIsModalVisible(true);
    try {
        const userDocRef = doc(db, "users", currentUser.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.notInterested) {
                await updateDoc(userDocRef, {
                    notInterested: arrayUnion(itemId),
                });
            } else {
                await updateDoc(userDocRef, {
                    notInterested: [itemId],
                });
            }
        } else {
            console.error("User document does not exist");
        }
    } catch (err) {
        console.error(
            "Error storing the song to notInterested in Firestoree:",
            err
        );
        setIsBottomSheetVisible(true);
    }
};

const getNotInterestedSongIds = async (currentUser) => {
    spotifyUserId = currentUser.id;
    const userDocRef = doc(db, "users", spotifyUserId);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.notInterested) {
                return userData.notInterested;
            }
            return -1;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting notInterested song Ids:", error);
        return null;
    }
};

async function generateUniqueId() {
    const buffer = await Crypto.getRandomBytesAsync(16);
    return buffer.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const addComment = async ({
    songId,
    songName,
    comment,
    currentUserId,
    name,
    imageLink,
    setComment,
    setCommentsToDisplay,
}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!comment.trim()) {
        return;
    }
    try {
        Keyboard.dismiss();
        setComment("");

        const commentId = await generateUniqueId();
        const commentData = {
            userId: currentUserId,
            username: name,
            content: comment,
            likeCount: 0,
            likedBy: [],
            timestamp: Timestamp.now(),
            profileImage: imageLink,
            replyCount: 0,
        };
        setCommentsToDisplay((prevComments) => [
            { ...commentData, id: commentId }, // Use a temporary localId for rendering
            ...prevComments,
        ]);
        const songDocRef = doc(db, "songs", songId);
        const songDoc = await getDoc(songDocRef);
        if (songDoc.exists()) {
            const commentsCollectionRef = collection(songDocRef, "comments");
            await setDoc(doc(commentsCollectionRef, commentId), commentData);
        } else {
            await setDoc(songDocRef, { name: songName });
            const commentsCollectionRef = collection(songDocRef, "comments");
            await setDoc(doc(commentsCollectionRef, commentId), commentData);
        }
        return commentId;
    } catch (err) {
        setCommentsToDisplay((prevComments) =>
            prevComments.filter((c) => c.content !== comment)
        );
        console.error("Error in adding the comment:", err);
    }
};

const getComments = async (songId) => {
    try {
        const commentsCollectionRef = collection(
            db,
            "songs",
            songId,
            "comments"
        );
        const q = query(commentsCollectionRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return comments;
    } catch (err) {
        console.error("Error fetching comments", err);
    }
};

const toggleCommentLike = async ({ item, songId, currentUser }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
        const commentRef = doc(db, `songs/${songId}/comments/${item.id}`);
        const commentDoc = await getDoc(commentRef);

        if (!commentDoc.exists()) {
            console.error("Comment does not exist!");
            return;
        }

        const commentData = commentDoc.data();
        const likedBy = commentData.likedBy || [];

        if (likedBy.includes(currentUser.id)) {
            await updateDoc(commentRef, {
                likeCount: commentData.likeCount - 1,
                likedBy: arrayRemove(currentUser.id),
            });
        } else {
            await updateDoc(commentRef, {
                likeCount: commentData.likeCount + 1,
                likedBy: arrayUnion(currentUser.id),
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return -1;
    }
};

const addReply = async ({
    songId,
    commentId,
    reply,
    currentUserId,
    name,
    imageLink,
    setReply,
    setCommentsToDisplay,
}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!reply.trim()) {
        return;
    }
    try {
        Keyboard.dismiss();

        setReply("");
        const commentDocRef = doc(db, "songs", songId, "comments", commentId);
        const replyId = await generateUniqueId();

        const replyData = {
            userId: currentUserId,
            username: name,
            content: reply,
            likeCount: 0,
            likedBy: [],
            timestamp: Timestamp.now(),
            profileImage: imageLink,
        };

        setCommentsToDisplay((prevComments) =>
            prevComments.map((commentItem) =>
                commentItem.id === commentId
                    ? {
                          ...commentItem,
                          replies: [...(commentItem.replies || []), replyData],
                          replyCount: (commentItem.replyCount || 0) + 1,
                      }
                    : commentItem
            )
        );

        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentDocRef);
            if (!commentDoc.exists()) {
                throw new Error("Comment document does not exist.");
            }

            const repliesCollectionRef = collection(commentDocRef, "replies");
            transaction.set(doc(repliesCollectionRef, replyId), replyData);

            const newReplyCount = (commentDoc.data().replyCount || 0) + 1;
            transaction.update(commentDocRef, { replyCount: newReplyCount });
        });

        return replyId;
    } catch (err) {
        setCommentsToDisplay((prevComments) =>
            prevComments.map((comment) => {
                if (comment.id === commentId) {
                    return { ...comment, replyCount: comment.replyCount - 1 };
                }
                return comment;
            })
        );
        console.error("Error in adding the reply:", err);
    }
};

export const getReplies = async ({ songId, commentId }) => {
    if (!songId || !commentId) {
        console.error("Missing songId or commentId in getReplies:", {
            songId,
            commentId,
        });
        return [];
    }
    const replies = [];
    try {
        const repliesCollectionRef = collection(
            db,
            "songs",
            songId,
            "comments",
            commentId,
            "replies"
        );
        const q = query(repliesCollectionRef, orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            replies.push({ id: doc.id, ...doc.data() });
        });
    } catch (error) {
        console.error("Failed to fetch replies:", error);
    }
    return replies;
};
const toggleReplyLike = async ({ item, songId, commentId, currentUser }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
        const replyRef = doc(
            db,
            `songs/${songId}/comments/${commentId}/replies/${item.id}`
        );
        const replyDoc = await getDoc(replyRef);
        if (!replyDoc.exists()) {
            console.error("Reply does not exist!");
            return;
        }

        const replyData = replyDoc.data();
        const likedBy = replyData.likedBy || [];

        if (likedBy.includes(currentUser.id)) {
            await updateDoc(replyRef, {
                likeCount: replyData.likeCount - 1,
                likedBy: arrayRemove(currentUser.id),
            });
        } else {
            await updateDoc(replyRef, {
                likeCount: replyData.likeCount + 1,
                likedBy: arrayUnion(currentUser.id),
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return -1;
    }
};

const pushSelectedPlaylist = async ({
    selectedPlaylistId,
    playlistName,
    setWaitingPlaylistAddition,
    currentUser,
}) => {
    setWaitingPlaylistAddition(true);
    try {
        setSelectedPlaylistId(selectedPlaylistId);
        if (currentUser) {
            await storeUserDataInFirestore(
                currentUser,
                playlistName,
                selectedPlaylistId
            );
        } else {
            throw new Error("User doesn't exists");
        }
        return true;
    } catch (err) {
        console.log("Error in playlist selection:", err);
        Alert.alert("Please try again!");
        return false;
    } finally {
        setWaitingPlaylistAddition(false);
    }
};

const storeUserDataInFirestore = async (
    userProfile,
    playlistName,
    selectedPlaylistId
) => {
    try {
        const userDocRef = doc(db, "users", userProfile.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            await updateDoc(userDocRef, {
                playlistId: selectedPlaylistId,
                playlistName: playlistName,
            });
        } else {
            await setDoc(userDocRef, {
                email: userProfile.email,
                name: userProfile.display_name,
                playlistId: selectedPlaylistId,
                playlistName: playlistName,
            });
        }
    } catch (err) {
        console.error("Error storing user data in Firestore:", err);
    }
};

const storeGenreInFirestore = async (userProfile, selectedGenres) => {
    try {
        const userDocRef = doc(db, "users", userProfile.id);
        await updateDoc(userDocRef, {
            "preferences.genre": selectedGenres,
        });
    } catch (err) {
        console.error("Error storing user data in Firestore:", err);
    }
};

const storeAcousticnessInFirestore = async (userProfile, selectedValue) => {
    try {
        const userDocRef = doc(db, "users", userProfile.id);
        await updateDoc(userDocRef, {
            "preferences.acousticness": selectedValue,
        });
    } catch (err) {
        console.error("Error storing user data in Firestore:", err);
    }
};

export {
    getPlaylistId,
    checkUserExists,
    addSongIdToNotInterested,
    getNotInterestedSongIds,
    addComment,
    getComments,
    toggleCommentLike,
    addReply,
    toggleReplyLike,
    pushSelectedPlaylist,
    storeGenreInFirestore,
    storeAcousticnessInFirestore,
};
