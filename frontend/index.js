import { getAllProjectItems, getIssuesFromQuery } from "../src/github.js";
import {
  addIssuesToProject,
  filterIssuesNotInProject,
} from "../src/helpers.js";
import CONFIG from "./config.js";
import QUERIES from "./queries.js";

export default async function main() {
  const [issues, additionalIssues, project] = await Promise.all([
    getIssuesFromQuery(QUERIES.teamRepositories, CONFIG),
    getIssuesFromQuery(QUERIES.sentryRepositories, CONFIG),
    getAllProjectItems(CONFIG),
  ]);

  const issuesNotInProject = filterIssuesNotInProject(
    [...issues, ...additionalIssues],
    project.projectItems
  );

  console.info(`[FRONTEND] Found ${issuesNotInProject.length} issues to sync.`);

  await addIssuesToProject(issuesNotInProject, project.projectId);
}
