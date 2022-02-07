import CONFIG from "./config.js";

/**
 *
 * @returns {string}
 */
const queryTeamRepositories = () => {
  const repoString = CONFIG.repositories
    .map((repo) => `repo:${repo.owner}/${repo.repo}`)
    .join(" ");

  return `${repoString} is:open`;
};

/**
 *
 * @returns {string}
 */
const querySentryRepositories = () => {
  const repoString = CONFIG.repositories
    .map((repo) => ` -repo:${repo.owner}/${repo.repo}`)
    .join("");

  const labelString = ["Team: Web Frontend", "Team: Web Backend"]
    .map((label) => `"${label}"`)
    .join(",");

  return `is:open label:${labelString} org:getsentry ${repoString}`.escapeSpecialChars();
};

const QUERIES = {
  teamRepositories: queryTeamRepositories(),
  sentryRepositories: querySentryRepositories(),
};

export default QUERIES;
