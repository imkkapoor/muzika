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
export {
    getUserProfile,
    getAccessToken,
    getExpirationDate,
    getRefreshToken,
    setTokens,
    logout,
    setSelectedPlaylistId,
};
