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
} from "firebase/firestore";
import { db } from "../firebase";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { Keyboard } from "react-native";

const getPlaylistId = async (userProfile) => {
    spotifyUserId = userProfile.id;
    const userDocRef = doc(db, "users", spotifyUserId);
    try {
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
        console.log("User exists:", userDoc.exists());
        return userDoc.exists(); // true if the user exists, false otherwise
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

const addSongIdToNotInterested = async ({ itemId, currentUser }) => {
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
    setPostingComment,
    setComment,
}) => {
    setPostingComment(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!comment.trim()) {
        setPostingComment(false);
        return;
    }
    try {
        Keyboard.dismiss();
        setComment("");

        const songDocRef = doc(db, "songs", songId);
        const songDoc = await getDoc(songDocRef);
        const commentId = await generateUniqueId();
        const commentData = {
            userId: currentUserId,
            username: name,
            content: comment,
            likeCount: 0,
            likedBy: [],
            timestamp: Timestamp.now(),
            profileImage: imageLink,
        };

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
        console.error("Error in adding the comment:", err);
    } finally {
        setPostingComment(false);
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
        const q = query(commentsCollectionRef);
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
            // User has already liked the comment, so we remove the like
            await updateDoc(commentRef, {
                likeCount: commentData.likeCount - 1,
                likedBy: arrayRemove(currentUser.id),
            });
        } else {
            // User has not liked the comment yet, so we add the like
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

export {
    getPlaylistId,
    checkUserExists,
    addSongIdToNotInterested,
    getNotInterestedSongIds,
    addComment,
    getComments,
    toggleCommentLike,
};
