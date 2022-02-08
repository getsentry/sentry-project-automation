import CONFIG from "./config.js";

String.prototype.escapeSpecialChars = function () {
  return this.replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/"/g, '\\"');
};

/**
 *
 * @returns {string}
 */
const queryTeamRepositories = () => {
  const repoString = CONFIG.repositories
    .map((repo) => `repo:${repo.owner}/${repo.repo}`)
    .join(" ");

  return `${repoString} is:open`.escapeSpecialChars();
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
