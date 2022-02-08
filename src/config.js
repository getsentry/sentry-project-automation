import dotenv from "dotenv";
dotenv.config();

const CONFIG = {
  repositories: [
    { owner: "getsentry", repo: "sentry-javascript" },
    { owner: "getsentry", repo: "sentry-ruby" },
    { owner: "getsentry", repo: "sentry-python" },
    { owner: "getsentry", repo: "sentry-php" },
    { owner: "getsentry", repo: "sentry-elixir" },
    { owner: "getsentry", repo: "sentry-laravel" },
    { owner: "getsentry", repo: "sentry-symfony" },
    { owner: "getsentry", repo: "sentry-webpack-go" },
    { owner: "getsentry", repo: "sentry-cli" },
    { owner: "getsentry", repo: "sentry-webpack-plugin" },
    { owner: "getsentry", repo: "sentry-webpack-wizard" },
    { owner: "getsentry", repo: "craft" },
  ],
  githubProject: {
    githubUser: "getsentry",
    projectNumber: 22,
    type: "organization", // "user" or "organization"
  },
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  PAGE_LIMIT: 50,
};

export default CONFIG;
