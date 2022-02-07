import dotenv from "dotenv";
dotenv.config();

const CONFIG = {
  repositories: [
    { owner: "vladanpaunovic", repo: "dca-crypto" },
    { owner: "vladanpaunovic", repo: "process-metrics" },
    { owner: "vladanpaunovic", repo: "process-metrics" },
  ],
  githubProject: {
    githubUser: "vladanpaunovic",
    projectNumber: 2,
    type: "user", // "user" or "organization"
  },
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  PAGE_LIMIT: 50,
};

// const CONFIG = {
//   repositories: [
//     { owner: "getsentry", repo: "sentry-javascript" },
//     { owner: "getsentry", repo: "sentry-ruby" },
//     { owner: "getsentry", repo: "sentry-python" },
//   ],
//   githubProject: {
//     githubUser: "vladanpaunovic",
//     projectNumber: 2,
//     type: "user", // "user" or "organization"
//   },
//   GITHUB_TOKEN: process.env.GITHUB_TOKEN,
// };

export default CONFIG;
