"use client";

import { useGithubStats } from "./providers/github-stats-provider";

/** Star count, formatted like coss ui's header (e.g. 1.2k). */
export const GithubStarCount = () => {
  const { data, isLoading } = useGithubStats();
  if (isLoading) {
    return "...";
  }
  const stars = data?.stargazers_count;
  if (typeof stars !== "number") {
    return null;
  }
  return stars >= 1000
    ? `${(stars / 1000).toFixed(1)}k`
    : stars.toLocaleString();
};
