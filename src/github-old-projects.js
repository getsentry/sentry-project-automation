import { Octokit } from "octokit";
import CONFIG from "./config.js";
const octokit = new Octokit({ auth: CONFIG.GITHUB_TOKEN });

/**
 * @param {string} projectId
 */
export const getProjectColumns = async (project_id) => {
  const columns = await octokit.request("GET /projects/{project_id}/columns", {
    project_id,
  });

  return columns.data;
};

/**
 * @param {string} projectId
 */
export const getColumnCards = async (column_id) => {
  const cards = await octokit.paginate(
    "GET /projects/columns/{column_id}/cards",
    { column_id }
  );

  console.log(cards.length);

  return cards;
};

/**
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} issueId
 * @returns
 */
export const getIssue = async ({ owner, repo, issue_number }) => {
  const issue = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    { owner, repo, issue_number }
  );

  return issue;
};
