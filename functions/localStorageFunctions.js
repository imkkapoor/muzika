import AsyncStorage from "@react-native-async-storage/async-storage";

const getAccessToken = async () => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        return token;
    } catch (error) {
        console.error("Error retrieving access token:", error);
        return null;
    }
};
const getExpirationDate = async () => {
    try {
        const expirationDate = await AsyncStorage.getItem("expirationDate");
        return expirationDate;
    } catch (error) {
        console.error("Error retrieving expiration date:", error);
        return null;
    }
};

const getUserProfile = async () => {
    try {
        const userProfileString = await AsyncStorage.getItem("userProfile");

        if (userProfileString) {
            const userProfile = JSON.parse(userProfileString);
            return userProfile;
        }
    } catch (error) {
        console.error("Error parsing JSON string:", error);
    }
};
const getRefreshToken = async () => {
    try {
        const token = await AsyncStorage.getItem("refreshToken");
        return token;
    } catch (error) {
        return null;
    }
};

const getSelectedGenreList = async () => {
    try {
        const list = await AsyncStorage.getItem("selectedGenreList");
        if (list) {
            const selectedGenreList = JSON.parse(list);
            return selectedGenreList;
        }
        return [];
    } catch (error) {
        console.error("Error fetching selected genres:", error);
        return [];
    }
};

const setTokens = async (response) => {
    const currentTime = new Date();
    const expirationDate = currentTime.getTime() + 3600 * 1000;
    AsyncStorage.setItem("accessToken", response.accessToken);
    if (response.refreshToken) {
        AsyncStorage.setItem("refreshToken", response.refreshToken);
    }
    AsyncStorage.setItem("expirationDate", expirationDate.toString());
};

const setSelectedPlaylistId = async (selectedPlaylistId) => {
    await AsyncStorage.setItem("selectedPlaylistId", selectedPlaylistId);
};
const logout = async () => {
    AsyncStorage.removeItem("accessToken");
    AsyncStorage.removeItem("refreshToken");
    AsyncStorage.removeItem("expirationDate");
};

const setSelectedGenreList = async (selectedGenres) => {
    await AsyncStorage.setItem(
        "selectedGenreList",
        JSON.stringify(selectedGenres)
    );
};

const saveToCache = async (newRecommendations) => {
    const cacheData = {
        timestamp: Date.now(),
        recommendations: newRecommendations.slice(-5),
    };
    try {
        await AsyncStorage.setItem(
            "cachedRecommendations",
            JSON.stringify(cacheData)
        );
    } catch (error) {
        console.error("Error saving to cache", error);
    }
};

const loadFromCache = async (setRecommendations, setLoading) => {
    try {
        const cache = await AsyncStorage.getItem("cachedRecommendations");
        if (cache) {
            const { timestamp, recommendations } = JSON.parse(cache);
            const oneHour = 3600000;
            if (Date.now() - timestamp < oneHour) {
                setRecommendations(recommendations);
                setLoading(false);
            } else {
                await AsyncStorage.removeItem("cachedRecommendations");
            }
        }
    } catch (error) {
        console.error("Error loading from cache", error);
    }
};

export {
    getUserProfile,
    getAccessToken,
    getExpirationDate,
    getRefreshToken,
    setTokens,
    logout,
    setSelectedPlaylistId,
    setSelectedGenreList,
    getSelectedGenreList,
    saveToCache,
    loadFromCache,
};
