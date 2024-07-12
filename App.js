import Navigation from "./StackNavigator";
import { UserContext } from "./UserContext";

export default function App() {
    return (
        <>
            <UserContext>
                <Navigation />
            </UserContext>
        </>
    );
}
