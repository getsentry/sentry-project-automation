const CONFIG = {
  repositories: [
    { owner: "getsentry", repo: "sentry-javascript" },
    { owner: "getsentry", repo: "sentry-webpack-plugin" },
    { owner: "getsentry", repo: "sentry-webpack-wizard" },
    { owner: "getsentry", repo: "sentry-electron" },
    { owner: "getsentry", repo: "sentry-javascript-bundler-plugins" },
  ],
  githubProject: {
    githubUser: "getsentry",
    projectNumber: 31,
    type: "organization", // "user" or "organization"
  },
  PAGE_LIMIT: 50,
  teamLabel: "Team: Web Frontend"
};

export default CONFIG;
