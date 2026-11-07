import {
  Button,
  Host,
  HStack,
  Image,
  Menu,
  Picker,
  Section,
  Spacer,
  Text,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  font,
  frame,
  padding,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { NativeTabs } from "expo-router/native-tabs";
import { RANGE_OPTIONS, type RangeOption } from "./data";
import { type CrosshairStyle, useDemo } from "./state";

const CROSSHAIRS: CrosshairStyle[] = ["Gradient", "Dashed"];
const RANGE_LABELS: Record<RangeOption, string> = {
  "2W": "2 weeks",
  "4W": "4 weeks",
  "6W": "6 weeks",
};

/**
 * Linear-style glass bar in the tab bar's bottom accessory: a menu button
 * that opens into Range / Crosshair pickers (iOS 26 morphs the glass into
 * the menu), plus Shuffle and Replay. Always reachable while scrolling.
 */
export function DemoControls() {
  const { range, setRange, crosshair, setCrosshair, shuffle, replay } =
    useDemo();
  const inline = NativeTabs.BottomAccessory.usePlacement() === "inline";

  // One glass capsule (the accessory) with plain icons inside, like
  // Linear's bar: no glass-on-glass, fixed 44pt targets so spacing is even.
  const plain = [buttonStyle("plain"), frame({ width: 44, height: 44 })];

  return (
    <Host style={{ flex: 1 }}>
      <HStack
        modifiers={[padding({ horizontal: inline ? 6 : 10 })]}
        spacing={0}
      >
        <Menu
          label={
            <HStack
              modifiers={[frame({ height: 44 }), padding({ horizontal: 8 })]}
              spacing={7}
            >
              <Image size={16} systemName="calendar" />
              <Text modifiers={[font({ size: 16, weight: "semibold" })]}>
                {range}
              </Text>
              <Image size={11} systemName="chevron.up.chevron.down" />
            </HStack>
          }
          modifiers={[buttonStyle("plain")]}
        >
          <Section title="Range">
            <Picker
              label="Range"
              onSelectionChange={(v) => setRange(v as RangeOption)}
              selection={range}
            >
              {RANGE_OPTIONS.map((r) => (
                <Text key={r} modifiers={[tag(r)]}>
                  {RANGE_LABELS[r]}
                </Text>
              ))}
            </Picker>
          </Section>
          <Section title="Crosshair">
            <Picker
              label="Crosshair"
              onSelectionChange={(v) => setCrosshair(v as CrosshairStyle)}
              selection={crosshair}
            >
              {CROSSHAIRS.map((c) => (
                <Text key={c} modifiers={[tag(c)]}>
                  {c}
                </Text>
              ))}
            </Picker>
          </Section>
        </Menu>
        <Spacer />
        <Button modifiers={plain} onPress={shuffle}>
          <Image size={17} systemName="shuffle" />
        </Button>
        <Button modifiers={plain} onPress={replay}>
          <Image size={17} systemName="arrow.counterclockwise" />
        </Button>
      </HStack>
    </Host>
  );
}
