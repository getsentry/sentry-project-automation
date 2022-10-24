const CONFIG = {
  repositories: [
    { owner: "getsentry", repo: "sentry-ruby" },
    { owner: "getsentry", repo: "sentry-python" },
    { owner: "getsentry", repo: "sentry-php" },
    { owner: "getsentry", repo: "sentry-laravel" },
    { owner: "getsentry", repo: "sentry-symfony" },
    { owner: "getsentry", repo: "sentry-go" },
    { owner: "getsentry", repo: "sentry-java" },
  ],
  githubProject: {
    githubUser: "getsentry",
    projectNumber: 32,
    type: "organization", // "user" or "organization"
  },
  PAGE_LIMIT: 50,
};

export default CONFIG;
