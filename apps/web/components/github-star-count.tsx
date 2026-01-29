"use client";

import { useGithubStats } from "./providers/github-stats-provider";

export const GithubStarCount = () => {
  const { data, isLoading } = useGithubStats();
  return isLoading ? "..." : data?.stargazers_count;
};
