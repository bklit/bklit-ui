export interface ShowcaseProject {
  title: string;
  url: string;
  image: string;
  imageAlt: string;
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    title: "OpenPanel",
    url: "https://openpanel.dev/",
    image: "/img/showcase/openpanel.png",
    imageAlt: "OpenPanel analytics dashboard",
  },
  {
    title: "Chánh Đại",
    url: "https://chanhdai.com",
    image:
      "https://github.com/user-attachments/assets/b4fdc21a-2b8f-465b-9eb4-11f03f3a9fd0",
    imageAlt: "Chánh Đại portfolio",
  },
];
