export interface Testimonial {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    author: {
      name: "Amped",
      handle: "@jayalxndr",
      avatar:
        "https://pbs.twimg.com/profile_images/1944673322018500608/fc7NYahG_400x400.jpg",
    },
    content: "These are clean. I look forward to trying them out",
  },
  {
    id: "2",
    author: {
      name: "OrcDev",
      handle: "@orcdev",
      avatar:
        "https://pbs.twimg.com/profile_images/1756766826736893952/6Gvg6jha_400x400.jpg",
    },
    content: "oh this looks pretty nice",
  },
  {
    id: "3",
    author: {
      name: "Khalid",
      handle: "@khalidxv1",
      avatar:
        "https://pbs.twimg.com/profile_images/1937604395945918464/zBCajSen_400x400.jpg",
    },
    content: "This is insane! I've never seen a design like this.",
  },
  {
    id: "4",
    author: {
      name: "Carl Lindesvärd",
      handle: "@CarlLindesvard",
      avatar:
        "https://pbs.twimg.com/profile_images/1751607056316944384/8E4F88FL_400x400.jpg",
    },
    content: "Looks f**king awesome! Well done!",
  },
  {
    id: "5",
    author: {
      name: "Sergei Lavrukhin",
      handle: "@SergeiLavrukhin",
      avatar:
        "https://pbs.twimg.com/profile_images/1790449245960429568/ClsrHZ8p_400x400.jpg",
    },
    content: "so cool! so smooth!!",
  },
  {
    id: "6",
    author: {
      name: "Daniel",
      handle: "@DanielWhit21874",
      avatar:
        "https://pbs.twimg.com/profile_images/2015154381310550016/bnq0483l_400x400.jpg",
    },
    content: "Beautiful work Matt honestly it looks sensational",
  },
  {
    id: "7",
    author: {
      name: "Imad Atyat",
      handle: "@imadatyat",
      avatar:
        "https://pbs.twimg.com/profile_images/1445703657140338694/H2jE7fZk_400x400.jpg",
    },
    content: "The best shadcn charts I have ever seen & used!",
  },
];
