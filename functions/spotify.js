import AsyncStorage from "@react-native-async-storage/async-storage";

const getAccessToken = async () => {
    try {
        const token = await AsyncStorage.getItem("token");
        return token;
    } catch (error) {
        console.error("Error retrieving access token:", error);
        return null;
    }
};

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
        return data;
    } catch (err) {
        console.error("Error fetching tracks:", err);
        return [];
    }
};

export { getTracks, getPLaylistSpecificTracks};
