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
    .filter((issue) => !issuesInProject.map((iss) => iss.id).includes(issue.id))
    .filter((issue) => issue.id && issue.title);
};

/**
 *
 * @param {Array} issuesArray
 * @param {string} projectId
 */
export async function addIssuesToProject(issuesArray, projectId) {
  if (issuesNotInProject.length) {
    console.info(`Syncing with project starting...`);

    for (const issue of issuesNotInProject) {
      await addItemToProject(project.projectId, issue.id);

      console.info(`Added: ${issue.title}`);
    }

    console.info(`Syncing with project finished.`);
  } else {
    console.info(`Nothing to sync. Exiting.`);
  }
}
