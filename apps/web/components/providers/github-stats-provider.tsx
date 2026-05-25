"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface GithubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  ssh_url: string;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  forks_count: number;
}

export interface GithubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface GithubStatsContextType {
  data: GithubRepo | null;
  contributors: GithubContributor[];
  isLoading: boolean;
  isContributorsLoading: boolean;
}

const GithubStatsContext = createContext<GithubStatsContextType | undefined>(
  undefined
);

export const GithubStatsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<GithubRepo | null>(null);
  const [contributors, setContributors] = useState<GithubContributor[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isContributorsLoading, setContributorsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repoResponse, contributorsResponse] = await Promise.all([
          fetch("https://api.github.com/repos/bklit/bklit-ui"),
          fetch(
            "https://api.github.com/repos/bklit/bklit-ui/contributors?per_page=30"
          ),
        ]);
        const [repoData, contributorsData] = await Promise.all([
          repoResponse.json(),
          contributorsResponse.json(),
        ]);
        setData(repoData);
        if (Array.isArray(contributorsData)) {
          setContributors(contributorsData);
        }
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      } finally {
        setLoading(false);
        setContributorsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GithubStatsContext.Provider
      value={{ data, contributors, isLoading, isContributorsLoading }}
    >
      {children}
    </GithubStatsContext.Provider>
  );
};

export const useGithubStats = (): GithubStatsContextType => {
  const context = useContext(GithubStatsContext);
  if (context === undefined) {
    throw new Error("useGithubStats must be used within a GithubStatsProvider");
  }
  return context;
};
