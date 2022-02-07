import dotenv from "dotenv";
dotenv.config();
import { getAllProjectItems, getIssuesFromQuery } from "./src/github.js";
import { addIssuesToProject, filterIssuesNotInProject } from "./src/helpers.js";
import CONFIG from "./src/config.js";
import QUERIES from "./src/queries.js";

async function main() {
  const [issues, additionalIssues, project] = await Promise.all([
    getIssuesFromQuery(QUERIES.teamRepositories),
    getIssuesFromQuery(QUERIES.sentryRepositories),
    getAllProjectItems(CONFIG.githubProject),
  ]);

  const issuesNotInProject = filterIssuesNotInProject(
    [...issues, ...additionalIssues],
    project.projectItams
  );

  console.info(`Found ${issuesNotInProject.length} issues to sync.`);

  await addIssuesToProject(issuesNotInProject, project.projectId);
}

main();
