import { NativeTabs } from "expo-router/native-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DemoControls } from "../demo/controls";
import { DemoProvider } from "../demo/state";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DemoProvider>
        <NativeTabs>
          <NativeTabs.BottomAccessory>
            <DemoControls />
          </NativeTabs.BottomAccessory>
          <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Label>Line</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon md="show_chart" sf="chart.xyaxis.line" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="area">
            <NativeTabs.Trigger.Label>Area</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon md="area_chart" sf="mountain.2.fill" />
          </NativeTabs.Trigger>
        </NativeTabs>
      </DemoProvider>
    </GestureHandlerRootView>
  );
}
