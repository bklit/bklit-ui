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

interface GithubStatsContextType {
  data: GithubRepo | null;
  isLoading: boolean;
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
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repoResponse = await fetch(
          "https://api.github.com/repos/bklit/bklit-ui"
        );
        const repoData = await repoResponse.json();
        setData(repoData);
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GithubStatsContext.Provider value={{ data, isLoading }}>
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
