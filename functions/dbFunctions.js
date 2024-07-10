import { doc, getDoc } from "firebase/firestore";
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
}

export { getPlaylistId, checkUserExists };
