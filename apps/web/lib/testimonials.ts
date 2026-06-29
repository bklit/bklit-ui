export interface Testimonial {
  id: string;
  url: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
}

const TWITTER_AVATAR_200 = /_200x200\.(jpg|png|webp)$/i;

/** Prefer 400×400 Twitter profile images in the UI. */
export function twitterAvatarUrl(url: string) {
  return url.replace(TWITTER_AVATAR_200, "_400x400.$1");
}

/**
 * Masonry uses CSS columns (fill top-to-bottom per column).
 * First 9 entries = top 3 cards in each of the 3 columns on lg screens.
 */
export const testimonials: Testimonial[] = [
  // Column 1 — top 3
  {
    id: "2056717453816729751",
    url: "https://x.com/jordienr/status/2056717453816729751",
    author: {
      name: "jordi",
      handle: "@jordienr",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2053541405121769475/TUDez6zL_200x200.jpg"
      ),
      verified: true,
    },
    content: "bklit saved my marriage",
  },
  // Column 2 — top 3
  {
    id: "2056717181338149036",
    url: "https://x.com/ausrobdev/status/2056717181338149036",
    author: {
      name: "Rob Austin",
      handle: "@ausrobdev",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1902211854476439552/CTVSPPo1_200x200.jpg"
      ),
      verified: true,
    },
    content: "Makes me want to replace Recharts and Tremor charts with Bklit",
  },
  {
    id: "2057059340113387607",
    url: "https://x.com/shabanhr/status/2057059340113387607",
    author: {
      name: "Shaban",
      handle: "@shabanhr",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2024177105110781953/zPXZyKbx_200x200.jpg"
      ),
      verified: true,
    },
    content:
      "Congrats on the launch, Matt! It looks incredibly clean. Glad we finally have a solid chart builder, but that video export feature is elite. 🔥",
  },
  {
    id: "CarlLindesvard-launch",
    url: "https://x.com/CarlLindesvard",
    author: {
      name: "Carl Lindesvärd",
      handle: "@CarlLindesvard",
      avatar:
        "https://pbs.twimg.com/profile_images/1751607056316944384/8E4F88FL_400x400.jpg",
      verified: true,
    },
    content: "Looks f**king awesome! Well done!",
  },
  {
    id: "2057019798022729845",
    url: "https://x.com/orcdev/status/2057019798022729845",
    author: {
      name: "OrcDev",
      handle: "@orcdev",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1756766826736893952/6Gvg6jha_200x200.jpg"
      ),
      verified: true,
    },
    content:
      "man this is awesome, I think this is the only chart builder I've seen so far — awesome work man, have to put it on some video",
  },
  {
    id: "2032217721484537956",
    url: "https://x.com/shadcn/status/2032217721484537956",
    author: {
      name: "shadcn",
      handle: "@shadcn",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_200x200.jpg"
      ),
      verified: true,
    },
    content: "Amazing Matt.",
  },
  {
    id: "2056711618768130336",
    url: "https://x.com/Nil_phy_dreamer/status/2056711618768130336",
    author: {
      name: "Indranil",
      handle: "@Nil_phy_dreamer",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2004691775328317440/adKTKv7E_200x200.jpg"
      ),
      verified: true,
    },
    content: "My favourite chart library. Going to use this forever.",
  },
  {
    id: "jayalxndr-launch",
    url: "https://x.com/jayalxndr",
    author: {
      name: "Amped",
      handle: "@jayalxndr",
      avatar:
        "https://pbs.twimg.com/profile_images/1944673322018500608/fc7NYahG_400x400.jpg",
    },
    content: "These are clean. I look forward to trying them out",
  },
  // Remaining
  {
    id: "2025661733159751781",
    url: "https://x.com/chriszeuch/status/2025661733159751781",
    author: {
      name: "Chris 🧱",
      handle: "@chriszeuch",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1941976533221904385/Jg6GEYpD_400x400.jpg"
      ),
      verified: true,
    },
    content: "Oooh this is nice",
  },
  {
    id: "2025682783222247907",
    url: "https://x.com/CarlLindesvard/status/2025682783222247907",
    author: {
      name: "Carl Lindesvärd",
      handle: "@CarlLindesvard",
      avatar:
        "https://pbs.twimg.com/profile_images/1751607056316944384/8E4F88FL_400x400.jpg",
      verified: true,
    },
    content: "should i just pay you to implement all your charts in op?",
  },
  {
    id: "2056750667104977104",
    url: "https://x.com/shuxer/status/2056750667104977104",
    author: {
      name: "Shuh",
      handle: "@shuxer",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2034859847162761216/B6O3rtEH_200x200.jpg"
      ),
      verified: true,
    },
    content: "Those charts are really juicy!",
  },
  {
    id: "2056740153473876192",
    url: "https://x.com/hkbonur/status/2056740153473876192",
    author: {
      name: "Onur 〽️",
      handle: "@hkbonur",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2032171326283091968/5_Fev0OR_200x200.jpg"
      ),
      verified: false,
    },
    content: "Love it. Using for my project (☞ﾟ∀ﾟ)☞",
  },
  {
    id: "2056700468051484698",
    url: "https://x.com/alibey_10/status/2056700468051484698",
    author: {
      name: "Ali Bey",
      handle: "@alibey_10",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1935578610854719488/E-Wn2FKX_200x200.jpg"
      ),
      verified: true,
    },
    content: "huge 🔥",
  },
  {
    id: "2056345955427836023",
    url: "https://x.com/Nil_phy_dreamer/status/2056345955427836023",
    author: {
      name: "Indranil",
      handle: "@Nil_phy_dreamer",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2004691775328317440/adKTKv7E_200x200.jpg"
      ),
      verified: true,
    },
    content:
      "Matt has made an amazing chart library. Absolutely love it while using.",
  },
  {
    id: "2054963612469657838",
    url: "https://x.com/designerdada/status/2054963612469657838",
    author: {
      name: "Akash",
      handle: "@designerdada",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2039719661806477313/nSlvpP0Z_200x200.jpg"
      ),
      verified: true,
    },
    content: "this is soo good 👌",
  },

  {
    id: "2014789834506661940",
    url: "https://x.com/vanderleeden/status/2014789834506661940",
    author: {
      name: "Leonard",
      handle: "@vanderleeden",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1693400079128727552/aIo3WzIt_200x200.jpg"
      ),
      verified: false,
    },
    content: "Love it. Would be glad to use it.",
  },
  {
    id: "2032183825300967684",
    url: "https://x.com/legionsdev/status/2032183825300967684",
    author: {
      name: "Gurbinder",
      handle: "@legionsdev",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1924504051728670720/mqyGd02m_200x200.jpg"
      ),
      verified: true,
    },
    content: "i found my healthy competitor 😂",
  },
  {
    id: "2056814419057717752",
    url: "https://x.com/barryroodt/status/2056814419057717752",
    author: {
      name: "Barry Roodt",
      handle: "@barryroodt",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1404701440199774210/-G_PJlYS_200x200.jpg"
      ),
      verified: false,
    },
    content: "you're absolutely killing it!",
  },
  {
    id: "2025670287983816999",
    url: "https://x.com/sevenfootpole/status/2025670287983816999",
    author: {
      name: "origami",
      handle: "@sevenfootpole",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/2001383011426729986/5TdN15tG_200x200.jpg"
      ),
      verified: true,
    },
    content: "Insane",
  },
  {
    id: "2056734907100258551",
    url: "https://x.com/stacks0x_/status/2056734907100258551",
    author: {
      name: "Matt",
      handle: "@stacks0x_",
      avatar: twitterAvatarUrl(
        "https://pbs.twimg.com/profile_images/1993136374346924033/nFij3xQM_200x200.jpg"
      ),
      verified: true,
    },
    content: "Cleanest charts on the web, hands down!",
  },

  {
    id: "khalidxv1-launch",
    url: "https://x.com/khalidxv1",
    author: {
      name: "Khalid",
      handle: "@khalidxv1",
      avatar:
        "https://pbs.twimg.com/profile_images/1937604395945918464/zBCajSen_400x400.jpg",
    },
    content: "This is insane! I've never seen a design like this.",
  },
  {
    id: "SergeiLavrukhin-launch",
    url: "https://x.com/SergeiLavrukhin",
    author: {
      name: "Sergei Lavrukhin",
      handle: "@SergeiLavrukhin",
      avatar:
        "https://pbs.twimg.com/profile_images/1790449245960429568/ClsrHZ8p_400x400.jpg",
    },
    content: "so cool! so smooth!!",
  },
  {
    id: "DanielWhit21874-launch",
    url: "https://x.com/DanielWhit21874",
    author: {
      name: "Daniel",
      handle: "@DanielWhit21874",
      avatar:
        "https://pbs.twimg.com/profile_images/2015154381310550016/bnq0483l_400x400.jpg",
    },
    content: "Beautiful work Matt honestly it looks sensational",
  },
  {
    id: "imadatyat-launch",
    url: "https://x.com/imadatyat",
    author: {
      name: "Imad Atyat",
      handle: "@imadatyat",
      avatar:
        "https://pbs.twimg.com/profile_images/1445703657140338694/H2jE7fZk_400x400.jpg",
    },
    content: "The best shadcn charts I have ever seen & used!",
  },
];

/** Number of cards visible before "See more" (2 rows × 3 columns). */
export const testimonialCollapsedCount = 6;
