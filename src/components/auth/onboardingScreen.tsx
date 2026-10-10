import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
} from "react-native-reanimated";
import { AnimatedPagination } from "../ui/animatedPagination";
import { scheduleOnRN } from "react-native-worklets";
import { scrollTo } from "react-native-reanimated";
import { useThemeContext } from "../../context/theme/themeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface SlideItem {
  id: string;
  title: string;
  desc: string;
  icon?: React.ReactElement;
}

interface OnboardingScreenProps {
  slides: SlideItem[];
  onFinish?: () => void;
}

export const OnboardingScreen = ({
  slides,
  onFinish,
}: OnboardingScreenProps) => {
  const { theme } = useThemeContext();
  const animatedRef = useAnimatedRef<Animated.FlatList>();
  const scrollX = useSharedValue(0);

  const [activeJSIndex, setActiveJSIndex] = useState(0);
  const activeUIIndex = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const nextIndex = Math.round(event.contentOffset.x / SCREEN_WIDTH);

      if (activeUIIndex.value !== nextIndex) {
        activeUIIndex.value = nextIndex;

        // Modern approach to safely schedule state updates back on the React Native thread
        scheduleOnRN(setActiveJSIndex, nextIndex);
      }
    },
  });

  const isLastSlide = activeJSIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <View>
        {/* Slide List */}
        <Animated.FlatList
          ref={animatedRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slideContainer}>
              {
                <View style={styles.iconOuter}>
                  <View
                    style={
                      item.icon
                        ? {
                            ...styles.iconCard,
                            backgroundColor: "rgba(28, 194, 159, 0.08)",
                            borderColor: "rgba(28, 194, 159, 0.25)",
                            borderWidth: 1.5,
                          }
                        : styles.iconCard
                    }
                  >
                    {item.icon}
                  </View>
                </View>
              }
              <View style={styles.slideView}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </View>
            </View>
          )}
        />

        {/* Footer */}
        {
          <View style={styles.footer}>
            <AnimatedPagination dataLength={slides.length} scrollX={scrollX} />

            <TouchableOpacity
              style={isLastSlide ? styles.getStartButton : styles.button}
              onPress={
                isLastSlide
                  ? onFinish
                  : () => {
                      scrollTo(
                        animatedRef,
                        scrollX.value + SCREEN_WIDTH,
                        0,
                        true,
                      );

                      console.log("next");
                    }
              }
              activeOpacity={0.8}
            >
              {isLastSlide && (
                <Image
                  source={require("../../../assets/icons/google-logo.jpg")}
                  style={{ width: 24, height: 24 }}
                />
              )}
              <Text
                style={
                  isLastSlide ? styles.getStartButtonText : styles.buttonText
                }
              >
                {isLastSlide ? "Sign in with Google" : "ถัดไป"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
  },
  slideContainer: {
    paddingTop: 48,
    width: SCREEN_WIDTH,
  },
  slideView: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  desc: { fontSize: 16, color: "#6B7280", lineHeight: 24 },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
    alignItems: "center",
    gap: 24,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1CC29F",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  getStartButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  component: {
    display: "flex",
    alignItems: "center",
  },
  iconOuter: {
    position: "relative",
    marginBottom: 36,
    alignItems: "center",
  },
  iconCard: {
    width: 160,
    height: 160,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
