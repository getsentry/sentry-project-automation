const CONFIG = {
  repositories: [
    { owner: "getsentry", repo: "sentry-replay" },
    { owner: "getsentry", repo: "replay-backend" },
    { owner: "getsentry", repo: "rrweb" },
  ],
  githubProject: {
    githubUser: "getsentry",
    projectNumber: 23,
    type: "organization", // "user" or "organization"
  },
  PAGE_LIMIT: 50,
  teamLabel: "Team: Replay"
};

export default CONFIG;
