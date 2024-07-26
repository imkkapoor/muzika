import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken } from "./localStorageFunctions";
import { CLIENT_ID, REDIRECT_URI, CLIENT_SECRET } from "@env";
import {
    exchangeCodeAsync,
    makeRedirectUri,
    refreshAsync,
} from "expo-auth-session";

const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
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
        if (data.total != 0) {
            const alreadyPresentTrackIds = data.items.map(
                (item) => item.track.id
            );
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

const exchangeRefreshTokenForAccessToken = async (token) => {
    const tokenResponse = await refreshAsync(
        {
            grantType: "refresh_token",
            refreshToken: token,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
        },
        discovery
    );

    return tokenResponse;
};

const exchangeCodeForToken = async (code) => {
    try {
        const tokenResponse = await exchangeCodeAsync(
            {
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                code,
                redirectUri: makeRedirectUri({
                    scheme: REDIRECT_URI,
                }),
            },
            discovery
        );
        return tokenResponse;
    } catch (error) {
        console.error("Error exchanging code:", error);
        return null;
    }
};

const getPlaylists = async ({ currentUser, setPlaylists, setIsLoading }) => {
    const accessToken = await getAccessToken();

    try {
        const response = await fetch(
            "https://api.spotify.com/v1/me/playlists",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const data = await response.json();
        const ownedPlaylists = data.items.filter(
            (playlist) => playlist.owner.id === currentUser.id
        );
        setPlaylists(ownedPlaylists);
        setIsLoading(false);
    } catch (error) {
        console.error(error);
    }
};

export {
    getTracks,
    getPLaylistSpecificTracks,
    getProfile,
    exchangeCodeForToken,
    exchangeRefreshTokenForAccessToken,
    getPlaylists,
};
