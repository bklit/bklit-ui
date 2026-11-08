"use client";

import { geoCentroid } from "d3-geo";
import { m, useTransform } from "motion/react";
import { memo, useCallback, useMemo } from "react";
import { useEnterComplete } from "../use-enter-complete";
import { useMountProgress } from "../use-mount-progress";
import { useChoroplethCamera } from "./choropleth-camera";
import {
  type ChoroplethFeature as ChoroplethFeatureType,
  defaultChoroplethColors,
  useChoroplethInteraction,
  useChoroplethStable,
} from "./choropleth-context";

export interface ChoroplethFeatureProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fadedOpacity?: number;
  getFeatureColor?: (feature: ChoroplethFeatureType, index: number) => string;
  patterns?: React.ReactNode;
  getFeaturePattern?: (
    feature: ChoroplethFeatureType,
    index: number
  ) => string | null | undefined;
}

interface FeatureRecord {
  index: number;
  path: string;
  fill: string;
  feature: ChoroplethFeatureType;
  centroid: { x: number; y: number } | null;
}

function resolveFeatureFill(
  feature: ChoroplethFeatureType,
  index: number,
  fill: string | undefined,
  getFeatureColor: ChoroplethFeatureProps["getFeatureColor"],
  getFeaturePattern: ChoroplethFeatureProps["getFeaturePattern"]
): string {
  const patternId = getFeaturePattern?.(feature, index);
  if (patternId) {
    return `url(#${patternId})`;
  }
  if (fill) {
    return fill;
  }
  if (getFeatureColor) {
    return getFeatureColor(feature, index);
  }
  return (
    defaultChoroplethColors[index % defaultChoroplethColors.length] ??
    "var(--chart-1)"
  );
}

const StaticFeatureLayer = memo(function StaticFeatureLayer({
  records,
  stroke,
  strokeWidth,
  baseOpacity,
  dimOpacity,
  hoveredIndex,
  focusedIndex,
  onFeatureEnter,
  onFeatureLeave,
  onFeatureClick,
}: {
  records: FeatureRecord[];
  stroke: string;
  strokeWidth: number;
  baseOpacity: number;
  dimOpacity: number;
  hoveredIndex: number | null;
  /** Region the camera is focused on — never dimmed. */
  focusedIndex: number | null;
  onFeatureEnter: (record: FeatureRecord) => void;
  onFeatureLeave: () => void;
  onFeatureClick: (index: number) => void;
}) {
  const isDimmed = hoveredIndex !== null;

  if (!isDimmed) {
    return (
      <g opacity={baseOpacity}>
        {records.map((record) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox
          <path
            className="cursor-pointer"
            d={record.path}
            fill={record.fill}
            key={`base-${record.index}`}
            onClick={() => onFeatureClick(record.index)}
            onMouseEnter={() => onFeatureEnter(record)}
            onMouseLeave={onFeatureLeave}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        ))}
      </g>
    );
  }

  const isLit = (index: number) =>
    index === hoveredIndex || index === focusedIndex;
  // Focused region first so a hovered neighbour draws on top of it.
  const highlighted = records
    .filter((record) => isLit(record.index))
    .sort((a) => (a.index === hoveredIndex ? 1 : -1));

  return (
    <>
      <g opacity={dimOpacity} style={{ transition: "opacity 0.18s ease-out" }}>
        {records
          .filter((record) => !isLit(record.index))
          .map((record) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox
            <path
              className="cursor-pointer"
              d={record.path}
              fill={record.fill}
              key={`base-${record.index}`}
              onClick={() => onFeatureClick(record.index)}
              onMouseEnter={() => onFeatureEnter(record)}
              onMouseLeave={onFeatureLeave}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          ))}
      </g>
      {highlighted.map((record) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox
        <path
          className="cursor-pointer"
          d={record.path}
          fill={record.fill}
          key={`highlight-${record.index}`}
          onClick={() => onFeatureClick(record.index)}
          onMouseEnter={() => onFeatureEnter(record)}
          onMouseLeave={onFeatureLeave}
          opacity={1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          style={{ transition: "opacity 0.18s ease-out" }}
        />
      ))}
    </>
  );
});

const EnterFeatureLayer = memo(function EnterFeatureLayer({
  records,
  stroke,
  strokeWidth,
  baseOpacity,
  dimOpacity,
  hoveredIndex,
  focusedIndex,
  onFeatureEnter,
  onFeatureLeave,
  onFeatureClick,
  revealEpoch,
}: {
  records: FeatureRecord[];
  stroke: string;
  strokeWidth: number;
  baseOpacity: number;
  dimOpacity: number;
  hoveredIndex: number | null;
  /** Region the camera is focused on — never dimmed. */
  focusedIndex: number | null;
  onFeatureEnter: (record: FeatureRecord) => void;
  onFeatureLeave: () => void;
  onFeatureClick: (index: number) => void;
  revealEpoch: number;
}) {
  const { enterTransition, animationDuration } = useChoroplethStable();
  const mountProgress = useMountProgress(
    enterTransition,
    0,
    `choropleth-layer-${revealEpoch}`
  );
  const enterComplete = useEnterComplete(mountProgress);
  const layerOpacity = useTransform(mountProgress, (t) => t * baseOpacity);

  if (enterComplete) {
    return (
      <StaticFeatureLayer
        baseOpacity={baseOpacity}
        dimOpacity={dimOpacity}
        focusedIndex={focusedIndex}
        hoveredIndex={hoveredIndex}
        onFeatureClick={onFeatureClick}
        onFeatureEnter={onFeatureEnter}
        onFeatureLeave={onFeatureLeave}
        records={records}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <m.g
      key={`enter-${revealEpoch}`}
      opacity={layerOpacity}
      transition={{
        duration: animationDuration / 1000,
        ease: "easeOut",
      }}
    >
      {records.map((record) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox
        <path
          className="cursor-pointer"
          d={record.path}
          fill={record.fill}
          key={`enter-${record.index}`}
          onClick={() => onFeatureClick(record.index)}
          onMouseEnter={() => onFeatureEnter(record)}
          onMouseLeave={onFeatureLeave}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </m.g>
  );
});

export const ChoroplethFeature = memo(function ChoroplethFeature({
  fill,
  stroke = "var(--background)",
  strokeWidth = 0.5,
  fadedOpacity = 0.4,
  getFeatureColor,
  patterns,
  getFeaturePattern,
}: ChoroplethFeatureProps) {
  const {
    features,
    featurePaths,
    pathGenerator,
    projectPoint,
    isLoaded,
    revealEpoch,
    width,
    height,
  } = useChoroplethStable();
  const { hoveredFeatureIndex, setHoveredFeatureIndex, setTooltipData } =
    useChoroplethInteraction();

  const featureCentroids = useMemo(() => {
    return features.map((feature) => {
      try {
        const centroid = geoCentroid(feature);
        if (
          centroid &&
          !Number.isNaN(centroid[0]) &&
          !Number.isNaN(centroid[1])
        ) {
          const projected = projectPoint(centroid as [number, number]);
          if (projected) {
            const padding = 60;
            return {
              x: Math.max(padding, Math.min(width - padding, projected[0])),
              y: Math.max(padding, Math.min(height - padding, projected[1])),
            };
          }
        }
      } catch {
        // Some geometries may not have valid centroids
      }
      return null;
    });
  }, [features, projectPoint, width, height]);

  const records = useMemo(() => {
    const items: FeatureRecord[] = [];
    for (let index = 0; index < features.length; index++) {
      const feature = features[index];
      if (!feature) {
        continue;
      }

      const path = featurePaths[index] ?? pathGenerator(feature);
      if (!path) {
        continue;
      }

      items.push({
        index,
        path,
        fill: resolveFeatureFill(
          feature,
          index,
          fill,
          getFeatureColor,
          getFeaturePattern
        ),
        feature,
        centroid: featureCentroids[index] ?? null,
      });
    }
    return items;
  }, [
    featureCentroids,
    featurePaths,
    features,
    fill,
    getFeatureColor,
    getFeaturePattern,
    pathGenerator,
  ]);

  const camera = useChoroplethCamera();
  const handleFeatureEnter = useCallback(
    (record: FeatureRecord) => {
      if (!camera.isHoverable(`feature:${record.index}`)) {
        return;
      }
      setHoveredFeatureIndex(record.index);
      setTooltipData({
        featureIndex: record.index,
        x: record.centroid?.x ?? width / 2,
        y: record.centroid?.y ?? height / 2,
        feature: record.feature,
      });
    },
    [camera, height, setHoveredFeatureIndex, setTooltipData, width]
  );

  const handleFeatureLeave = useCallback(() => {
    setHoveredFeatureIndex(null);
    setTooltipData(null);
  }, [setHoveredFeatureIndex, setTooltipData]);

  const handleFeatureClick = useCallback(
    (index: number) => {
      if (camera.enabled && !camera.wasDrag()) {
        camera.focusFeature(index);
      }
    },
    [camera]
  );

  const layerProps = {
    baseOpacity: 0.85,
    onFeatureClick: handleFeatureClick,
    dimOpacity: fadedOpacity,
    hoveredIndex: hoveredFeatureIndex,
    focusedIndex: camera.focusedFeatureIndex,
    onFeatureEnter: handleFeatureEnter,
    onFeatureLeave: handleFeatureLeave,
    records,
    stroke,
    strokeWidth,
  };

  return (
    <g className="choropleth-features">
      {patterns ? <defs>{patterns}</defs> : null}
      {isLoaded ? (
        <StaticFeatureLayer {...layerProps} />
      ) : (
        <EnterFeatureLayer {...layerProps} revealEpoch={revealEpoch} />
      )}
    </g>
  );
});

ChoroplethFeature.displayName = "ChoroplethFeature";

export default ChoroplethFeature;
