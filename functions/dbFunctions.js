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

export { getPlaylistId };
