import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

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

export {
    getPlaylistId,
    checkUserExists,
    addSongIdToNotInterested,
    getNotInterestedSongIds,
};
