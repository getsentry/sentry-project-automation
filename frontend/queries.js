import CONFIG from "./config.js";
import { escapeSpecialChars } from "../src/helpers.js";

/**
 *
 * @returns {string}
 */
const queryTeamRepositories = () => {
  const repoString = CONFIG.repositories
    .map((repo) => `repo:${repo.owner}/${repo.repo}`)
    .join(" ");

  return escapeSpecialChars(`${repoString} is:open`);
};

/**
 *
 * @returns {string}
 */
const querySentryRepositories = () => {
  const repoString = CONFIG.repositories
    .map((repo) => ` -repo:${repo.owner}/${repo.repo}`)
    .join("");

  return escapeSpecialChars(
    `is:open label:"Team: Web Frontend" org:getsentry ${repoString}`
  );
};

const QUERIES = {
  teamRepositories: queryTeamRepositories(),
  sentryRepositories: querySentryRepositories(),
};

export default QUERIES;
