import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import { SignInScreen } from "../screens/auth/signInScreen";
import { WelcomeScreen } from "../screens/auth/welcomeScreen";
import { useThemeContext } from "../context/theme/themeContext";

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  PromptPayBind: { phone: string };
  OtpVerify: { promptPayId: string; type: "MOBILE" | "CITIZEN_ID" };
};

export const AuthNavigator = () => {
  const Stack = createNativeStackNavigator<AuthStackParamList>();
  const { theme } = useThemeContext();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false, // ซ่อน Native Header เพื่อใช้ Custom UI ของเรา
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      {/* <Stack.Screen name="SignIn" component={SignInScreen} /> */}
      {/*  <Stack.Screen name="PromptPayBind" component={PromptPayBindScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} /> */}
    </Stack.Navigator>
  );
};
