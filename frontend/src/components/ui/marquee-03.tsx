import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee-03-utils/marquee";

type Review = {
  name: string;
  username: string;
  body: string;
  profile: string;
};

const reviews: Review[] = [
  {
    name: "Aarav Mehta",
    username: "@aaravlearns",
    body: "“Lumora turns a long YouTube lecture into a focused study session. I can ask questions about the transcript and get answers that stay grounded in the source.”",
    profile:
      "https://cdn.21st.dev/assets/localized/b539abc60701ab9cbcd73f9241d13a14a09582a4fd06c65784cb5567d77a2e0e.webp",
  },
  {
    name: "Maya Chen",
    username: "@mayastudies",
    body: "“The chapter summaries make it easy to find the exact part of a video I need. Lumora feels like a personal research workspace instead of another generic chat tool.”",
    profile:
      "https://cdn.21st.dev/assets/localized/2bc5f22fa3400c61a2161d14e3dce5a0804badebfc1b3d9cbe844feaa3b72180.webp",
  },
  {
    name: "Rohan Kapoor",
    username: "@rohanbuilds",
    body: "“I use Lumora to understand technical videos faster. The transcript search and follow-up questions help me move from watching to actually understanding.”",
    profile:
      "https://cdn.21st.dev/assets/localized/e1e172821860559f890ef5ef7c14cc66a6c1ec001f3bbeb6dddd349c0081dd6b.webp",
  },
  {
    name: "Sofia Williams",
    username: "@sofiareads",
    body: "“Uploading a PDF and asking questions about it is wonderfully simple. Lumora keeps my notes, context, and conversation together so I can stay focused.”",
    profile:
      "https://cdn.21st.dev/assets/localized/61fda783ca2662349458bad61a434038016f05d6a14bd7c5a314f48c8ee8be03.webp",
  },
  {
    name: "Noah Patel",
    username: "@noahnotes",
    body: "“Lumora has changed how I revise. I can turn a dense source into clear notes and return to the important ideas without replaying the whole video.”",
    profile:
      "https://cdn.21st.dev/assets/localized/c5ee2e124ea7334450d30a46607f793534f567e97d4b708cda110a06aeed4953.webp",
  },
  {
    name: "Elena Garcia",
    username: "@elenalearns",
    body: "“What I like most is that Lumora answers in context. It helps me explore a topic while keeping me connected to the original video or document.”",
    profile:
      "https://cdn.21st.dev/assets/localized/2bc5f22fa3400c61a2161d14e3dce5a0804badebfc1b3d9cbe844feaa3b72180.webp",
  },
  {
    name: "Aarav Mehta",
    username: "@aaravlearns",
    body: "“Lumora turns a long YouTube lecture into a focused study session. I can ask questions about the transcript and get answers that stay grounded in the source.”",
    profile:
      "https://cdn.21st.dev/assets/localized/b539abc60701ab9cbcd73f9241d13a14a09582a4fd06c65784cb5567d77a2e0e.webp",
  },
];

const ReviewCard = ({ profile, name, username, body }: Review) => {
  return (
    <Card className="relative w-full max-w-sm cursor-pointer overflow-hidden border border-[var(--border-medium)] bg-[var(--surface-2)] p-4 text-[var(--text-primary)] shadow-none">
      <CardContent className="flex flex-col gap-2 p-0">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
            alt={name}
            src={profile}
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-[var(--text-primary)]">{name}</p>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {username}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
      </CardContent>
    </Card>
  );
};

const VerticalMarqueeDemo = () => {
  return (
    <div className="relative flex h-[34rem] w-full flex-row items-center justify-center overflow-hidden">
      <div className="flex flex-row items-center justify-center w-full gap-4 px-4 h-full">
        <Marquee
          pauseOnHover
          vertical
          className="[--duration:20s] h-full sm:flex hidden flex-1"
        >
          {reviews
            .filter((_, i) => i % 3 === 0)
            .map((review, idx) => (
              <ReviewCard key={idx} {...review} />
            ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          vertical
          className="[--duration:20s] h-full hidden sm:flex flex-1"
        >
          {reviews
            .filter((_, i) => i % 3 === 1)
            .map((review, idx) => (
              <ReviewCard key={idx} {...review} />
            ))}
        </Marquee>
        <Marquee
          pauseOnHover
          vertical
          className="[--duration:20s] h-full hidden lg:flex flex-1"
        >
          {reviews
            .filter((_, i) => i % 3 === 2)
            .map((review, idx) => (
              <ReviewCard key={idx} {...review} />
            ))}
        </Marquee>
        <Marquee
          pauseOnHover
          vertical
          className="[--duration:20s] h-full sm:hidden flex flex-1"
        >
          {reviews.map((review, idx) => (
            <ReviewCard key={idx} {...review} />
          ))}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background"></div>
    </div>
  );
};

export default VerticalMarqueeDemo;
