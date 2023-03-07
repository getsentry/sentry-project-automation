import { getAllProjectItems, getIssuesFromQuery, getOpenPullRequests, getCurrentIteration } from "../src/github.js";
import { addItemsToProject, filterItemsNotInProject, updateItemsIterationField } from "../src/helpers.js";
import CONFIG from "./config.js";
import QUERIES from "./queries.js";

export default async function main() {
  const [issues, additionalIssues, project, prs] = await Promise.all([
    getIssuesFromQuery(QUERIES.teamRepositories, CONFIG),
    getIssuesFromQuery(QUERIES.sentryRepositories, CONFIG),
    getAllProjectItems(CONFIG),
    getOpenPullRequests([{ owner: "getsentry", repo: "relay" }]),
  ]);

  const issuesNotInProject = filterItemsNotInProject([...issues, ...additionalIssues], project.projectItems);
  const prsNotInProject = filterItemsNotInProject(prs, project.projectItems);

  console.info(`[INGEST] Found ${issuesNotInProject.length} issues to sync.`);
  console.info(`[INGEST] Found ${prsNotInProject.length} PRs to sync.`);
  
  await addItemsToProject(CONFIG.githubProject, [...issuesNotInProject, ...prsNotInProject]);

  // Set the field "Week" which is of type iteration to the current week
  const iteration = await getCurrentIteration(CONFIG.githubProject);
  console.info(`[INGEST] Current iteration: ${iteration.title}`);
  await updateItemsIterationField(CONFIG.githubProject, prs, iteration.fieldId, iteration.id);
}
