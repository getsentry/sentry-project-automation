import { addItemToProject } from "./github.js";

const extractIssuesFromProjectItems = (projectItems) =>
  projectItems.map((item) => item.content);

/**
 *
 * @param {*} allIssues
 * @param {*} projectItems
 */
export const filterIssuesNotInProject = (allIssues, projectItems) => {
  const issuesInProject = extractIssuesFromProjectItems(projectItems);

  return allIssues
    .filter(
      (issue) => !issuesInProject.map((iss) => iss?.id).includes(issue.id)
    )
    .filter((issue) => issue.id);
};

/**
 *
 * @param {Array} issuesArray
 * @param {string} projectId
 */
export async function addIssuesToProject(issuesArray, projectId) {
  if (issuesArray.length) {
    console.info(`Syncing with project starting...`);

    for (const issue of issuesArray) {
      await addItemToProject(projectId, issue.id);

      console.info(`[${projectId}] Added: ${issue.title} (${issue.url})`);
    }

    console.info(`[${projectId}] Syncing with project finished.`);
  } else {
    console.info(`[${projectId}] Nothing to sync. Exiting.`);
  }
}

/**
 *
 * @param {string} string
 */
export const escapeSpecialChars = (string) => {
  return string
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/"/g, '\\"');
};

/**
 * @param {Object} config
 * @returns {string}
 */
export const queryTeamRepositories = (config) => {
  const repoString = config.repositories
    .map((repo) => `repo:${repo.owner}/${repo.repo}`)
    .join(" ");

  return escapeSpecialChars(`${repoString} is:open`);
};

/**
 * @param {Object} config
 * @returns {string}
 */
export const querySentryRepositories = (config) => {
  const repoString = config.repositories
    .map((repo) => ` -repo:${repo.owner}/${repo.repo}`)
    .join("");

  return escapeSpecialChars(
    `is:open label:"${config.teamLabel}" org:getsentry ${repoString}`
  );
};
