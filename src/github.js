import dotenv from "dotenv";
dotenv.config();
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Helper function, used to test auth flow
export const login = await octokit.rest.users.getAuthenticated();

/**
 * @param {string} searchQuery
 * @param {*} config
 */
export const getIssuesFromQuery = async (searchQuery, config) => {
  console.info(
    `[PID:${config.githubProject.projectNumber}] Querying Github for: ${searchQuery}`
  );
  const constructQuery = ({ searchQuery, after = null }) => `
      query {
          search(first: ${config.PAGE_LIMIT}, after: ${after}, type: ISSUE, query: "${searchQuery}") {
            issueCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                ... on Issue {
                  id
                  title
                }
              }
            }
          }
        }
      `;

  const firstPage = await octokit.graphql(constructQuery({ searchQuery }));
  let issues = [];
  issues.push(...firstPage.search.edges);

  let after = firstPage.search.pageInfo.hasNextPage
    ? `"${firstPage.search.pageInfo.endCursor}"`
    : null;

  while (after != null) {
    var page = await octokit.graphql(constructQuery({ searchQuery, after }));
    issues.push(...page.search.edges);
    after = page.search.pageInfo.hasNextPage
      ? `"${page.search.pageInfo.endCursor}"`
      : null;
  }

  return issues.map((issue) => issue.node);
};

/**
 * @param {Object} project
 * @param {string} project.githubUser
 * @param {number} project.projectNumber
 * @param {"user"|"organization"} project.type
 * @param {string|null} project.after
 * @param {number} project.limit
 */
export const getProject = async ({
  githubUser,
  projectNumber,
  type = "user",
  after = null,
  limit = 50,
}) => {
  const items = await octokit.graphql(`
  query{
    ${type}(login: "${githubUser}"){
      projectV2(number: ${projectNumber}) {
        id
        items(first: ${limit}, after: ${after}) {
          pageInfo {
            endCursor
            hasNextPage
          }
          
          nodes {
            id
            content{
                ...on Issue {
                    id
                }
              }
          }
        }
      }
    }
  }`);

  console.log(items);

  return {
    items: items[type].projectV2.items,
    projectId: items[type].projectV2.id,
  };
};

/**
 * @param {Object} project
 * @param {string} project.githubUser
 * @param {number} project.projectNumber
 * @param {"user"|"organization"} project.type
 */
export const getAllProjectItems = async (config) => {
  const { githubUser, projectNumber, type } = config.githubProject;
  console.info(
    `[PID:${projectNumber}] Querying open issues in Github project: ${projectNumber}`
  );
  let items = [];

  try {
    // Read the first page.
    const firstBatchOfItems = await getProject({
      githubUser,
      projectNumber,
      type,
      after: null,
      limit: config.PAGE_LIMIT,
    });

    items.push(...firstBatchOfItems.items.nodes);

    let after = firstBatchOfItems.items.pageInfo.hasNextPage
      ? `"${firstBatchOfItems.items.pageInfo.endCursor}"`
      : null;

    while (after != null) {
      var page = await getProject({
        githubUser,
        projectNumber,
        type,
        after,
      });
      items.push(...page.items.nodes);
      after = page.items.pageInfo.hasNextPage
        ? `"${page.items.pageInfo.endCursor}"`
        : null;
    }
  } catch (error) {
    console.error(error);
  }

  return { projectItems: items, projectId: firstBatchOfItems?.projectId };
};

/**
 * @param {string} projectId
 * @param {string} issueId
 */
export const addItemToProject = async (projectId, issueId) => {
  return await octokit.graphql(`
    mutation {
        addProjectV2Item(input: {projectId: "${projectId}" contentId: "${issueId}"}) {
          projectV2Item {
            id
          }
        }
      }`);
};
