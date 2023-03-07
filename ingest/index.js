import { getAllProjectItems, getIssuesFromQuery, getOpenPullRequests, getCurrentIteration } from "../src/github.js";
import { addItemsToProject, filterItemsNotInProject, updateItemsIterationField, updateItemsSelectField } from "../src/helpers.js";
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

  console.info(`[${project.title}] Found ${issuesNotInProject.length} issues to sync.`);
  console.info(`[${project.title}] Found ${prsNotInProject.length} PRs to sync.`);
  
  const newItems = await addItemsToProject(project, [...issuesNotInProject, ...prsNotInProject]);

  // Set the field "Week" on PRs which is of type iteration to the current week
  const newPullRequests = newItems.filter((item) => item.type === "PULL_REQUEST");
  const iteration = await getCurrentIteration(CONFIG.githubProject);
  console.info(`[${project.title}] Current iteration: ${iteration.title}`);
  await updateItemsIterationField(project, newPullRequests, iteration.fieldId, iteration.id);
  await updateItemsSelectField(project, newPullRequests, "PVTSSF_lADOABVQ184AIawozgFQUtg", "47fc9ee4");
}
