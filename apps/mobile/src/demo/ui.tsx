import { ImpactFeedbackStyle, impactAsync, selectionAsync } from "expo-haptics";
import { type ReactNode, useCallback } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

/** Haptic tick per scrubbed point, light tap per selection change. */
export function useChartHaptics() {
  const onActiveIndexChange = useCallback((index: number | null) => {
    if (index !== null) {
      selectionAsync();
    }
  }, []);
  const onSelectionChange = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
  }, []);
  return { onActiveIndexChange, onSelectionChange };
}

export function usePalette() {
  return useColorScheme() === "dark" ? dark : light;
}

const light = {
  bg: "#f5f5f7",
  card: "#ffffff",
  border: "#e5e5e5",
  fg: "#0a0a0a",
  muted: "#737373",
};
const dark = {
  bg: "#000000",
  card: "#0f0f10",
  border: "#232325",
  fg: "#fafafa",
  muted: "#a3a3a3",
};

// ─── Page shell with sticky glass controls ───────────────────────────────

export function DemoPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const palette = usePalette();
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.bg }}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.muted }]}>
          @bklitui/native
        </Text>
        <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          {subtitle}
        </Text>
      </View>
      {children}
    </ScrollView>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────

export function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  /** Which web recipe / component this mirrors. */
  note?: string;
  children: ReactNode;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: palette.fg }]}>{title}</Text>
        {note ? (
          <Text style={[styles.cardNote, { color: palette.muted }]}>
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  header: { paddingTop: 8, paddingBottom: 8, gap: 4 },
  eyebrow: { fontSize: 12, fontWeight: "500", letterSpacing: 0.2 },
  title: { fontSize: 32, fontWeight: "700", letterSpacing: -0.6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 10,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  cardHeader: { paddingHorizontal: 6, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardNote: { fontSize: 12 },
});
