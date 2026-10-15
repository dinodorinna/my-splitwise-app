import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import { SignInScreen } from "../screens/auth/signInScreen";
import { JoinGroupScreen } from '../screens/group/joinGroupScreen';
import { WelcomeScreen } from '../screens/auth/welcomeScreen';
import { useThemeContext } from '../context/theme/themeContext';

export type AuthStackParamList = {
    Welcome: undefined;
    JoinGroup: { token: string };
    SignIn: undefined;
    PromptPayBind: { phone: string };
    OtpVerify: { promptPayId: string; type: 'MOBILE' | 'CITIZEN_ID' };
};

export const AuthNavigator = () => {
    const Stack = createNativeStackNavigator<AuthStackParamList>();
    const { mode } = useThemeContext();

    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
                headerShown: false, // ซ่อน Native Header เพื่อใช้ Custom UI ของเรา
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: mode.background },
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
                name="JoinGroup"
                component={JoinGroupScreen as React.ComponentType}
                options={{ presentation: 'modal' }}
            />
            {/* <Stack.Screen name="SignIn" component={SignInScreen} /> */}
            {/*  <Stack.Screen name="PromptPayBind" component={PromptPayBindScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} /> */}
        </Stack.Navigator>
    );
};
