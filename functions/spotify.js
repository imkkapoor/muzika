import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken } from "./localStorageFunctions";

const getTracks = async (tracks) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.error("No access token available");
        return [];
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks?ids=${tracks
                .map((track) => track.itemId)
                .join(",")}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data.tracks;
    } catch (err) {
        console.error("Error fetching tracks:", err);
        return [];
    }
};

const getPLaylistSpecificTracks = async (playlistId) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.error("No access token available");
        return [];
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.total != 0) {
            const alreadyPresentTrackIds = data.items.map(
                (item) => item.track.id
            );
            console.log(alreadyPresentTrackIds);
            return alreadyPresentTrackIds;
        } else {
            return -1;
        }
    } catch (err) {
        console.error("Error fetching tracks:", err);
        return [];
    }
};

const getProfile = async () => {
    const accessToken = await getAccessToken();

    try {
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        await AsyncStorage.setItem("userProfile", JSON.stringify(data));
        return data;
    } catch (err) {
        console.error("Error getting user deatils:", err);
    }
};

export { getTracks, getPLaylistSpecificTracks, getProfile };
