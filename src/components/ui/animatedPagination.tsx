import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    SharedValue,
} from "react-native-reanimated";
import { themes } from "../../context/theme/themeProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
    dataLength: number;
    scrollX: SharedValue<number>;
}

export const AnimatedPagination = ({ dataLength, scrollX }: Props) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: dataLength }).map((_, i) => {
                const animatedStyle = useAnimatedStyle(() => {
                    // คำนวณความกว้าง (Width) ตามตำแหน่ง Scroll
                    const dotWidth = interpolate(
                        scrollX.value,
                        [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
                        [8, 28, 8],
                        Extrapolation.CLAMP,
                    );

                    // คำนวณความโปร่งแสง/สี
                    const opacity = interpolate(
                        scrollX.value,
                        [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
                        [0.4, 1, 0.4],
                        Extrapolation.CLAMP,
                    );

                    return {
                        width: dotWidth,
                        opacity,
                        backgroundColor:
                            scrollX.value >= (i - 0.5) * SCREEN_WIDTH &&
                            scrollX.value < (i + 0.5) * SCREEN_WIDTH
                                ? themes.main.primary
                                : "#E5E7EB",
                    };
                });

                return <Animated.View key={i} style={[styles.dot, animatedStyle]} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
