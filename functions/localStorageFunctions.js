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

export { getUserProfile, getAccessToken, getExpirationDate };
