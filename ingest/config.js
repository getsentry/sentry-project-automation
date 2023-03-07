const CONFIG = {
  repositories: [
    { owner: "getsentry", repo: "relay" },
    { owner: "getsentry", repo: "team-ingest" },
  ],
  githubProject: {
    githubUser: "getsentry",
    projectNumber: 47,
    type: "organization", // "user" or "organization"
    iterationField: "Week",
  },
  PAGE_LIMIT: 50,
  teamLabel: "Team: Ingest",
  ignoreLabels: ["rerouted"],
};

export default CONFIG;
