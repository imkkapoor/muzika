import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";

const Stack = createNativeStackNavigator();
function Navigation(){
    return(<NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
        </Stack.Navigator>
    </NavigationContainer>)
}

export default Navigation;