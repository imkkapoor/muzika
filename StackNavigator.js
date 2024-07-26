import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChoosePlaylistScreen from "./screens/ChoosePlaylistScreen";
import ChooseGenresScreen from "./screens/ChooseGenresScreen";
import ChangePreferencesScreen from "./screens/ChangePreferencesScreen";

const Stack = createNativeStackNavigator();
function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Main"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ChangePreferences"
                    component={ChangePreferencesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ChoosePlaylist"
                    component={ChoosePlaylistScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ChooseGenre"
                    component={ChooseGenresScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;
