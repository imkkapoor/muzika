import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default getUserProfile;
