"use client";

import type { FeatureCollection, Geometry } from "geojson";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

interface CountryProperties {
  name: string;
  [key: string]: unknown;
}

interface WorldTopology extends Topology {
  objects: {
    [key: string]: GeometryCollection<CountryProperties>;
  };
}

const WORLD_DATA_URL =
  "https://raw.githubusercontent.com/subyfly/topojson/refs/heads/master/world-countries.json";

// Global cache to avoid refetching across component mounts
let globalWorldDataCache: FeatureCollection<
  Geometry,
  CountryProperties
> | null = null;
let globalFetchPromise: Promise<FeatureCollection<
  Geometry,
  CountryProperties
> | null> | null = null;

function fetchWorldData(): Promise<FeatureCollection<
  Geometry,
  CountryProperties
> | null> {
  // Return cached data if available
  if (globalWorldDataCache) {
    return Promise.resolve(globalWorldDataCache);
  }

  // Return existing promise if fetch is in progress
  if (globalFetchPromise) {
    return globalFetchPromise;
  }

  // Start new fetch
  globalFetchPromise = (async () => {
    try {
      const response = await fetch(WORLD_DATA_URL);
      const topology = (await response.json()) as WorldTopology;
      const objectKey = Object.keys(topology.objects)[0];
      if (!objectKey) {
        throw new Error("No objects found in topology");
      }
      const geoObject = topology.objects[objectKey];
      if (!geoObject) {
        throw new Error("Object not found in topology");
      }
      const geojson = feature(
        topology,
        geoObject
      ) as unknown as FeatureCollection<Geometry, CountryProperties>;
      globalWorldDataCache = geojson;
      return geojson;
    } catch (error) {
      console.error("Failed to fetch world data:", error);
      return null;
    }
  })();

  return globalFetchPromise;
}

interface WorldDataContextValue {
  worldData: FeatureCollection<Geometry, CountryProperties> | null;
  isLoading: boolean;
}

const WorldDataContext = createContext<WorldDataContextValue>({
  worldData: null,
  isLoading: true,
});

export function WorldDataProvider({ children }: { children: ReactNode }) {
  const [worldData, setWorldData] = useState<FeatureCollection<
    Geometry,
    CountryProperties
  > | null>(globalWorldDataCache);
  const [isLoading, setIsLoading] = useState(!globalWorldDataCache);

  useEffect(() => {
    if (globalWorldDataCache) {
      setWorldData(globalWorldDataCache);
      setIsLoading(false);
      return;
    }

    fetchWorldData().then((data) => {
      setWorldData(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <WorldDataContext.Provider value={{ worldData, isLoading }}>
      {children}
    </WorldDataContext.Provider>
  );
}

export function useWorldData() {
  return useContext(WorldDataContext);
}

// Standalone hook for components that don't have the provider
export function useWorldDataStandalone() {
  const [worldData, setWorldData] = useState<FeatureCollection<
    Geometry,
    CountryProperties
  > | null>(globalWorldDataCache);
  const [isLoading, setIsLoading] = useState(!globalWorldDataCache);

  useEffect(() => {
    if (globalWorldDataCache) {
      setWorldData(globalWorldDataCache);
      setIsLoading(false);
      return;
    }

    fetchWorldData().then((data) => {
      setWorldData(data);
      setIsLoading(false);
    });
  }, []);

  return { worldData, isLoading };
}
