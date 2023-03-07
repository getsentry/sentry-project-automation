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
                  url
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
 * Fetches all the open pull requests from a given repository
 * 
 * @param {string} owner
 * @param {string} repo
 */

export const getOpenPullRequests = async (repos) => {
  const data = await Promise.all(repos.map((repo) => octokit.graphql(`
  query {
    repository(name: "${repo.repo}", owner: "${repo.owner}") {
      pullRequests(first: 100, states: OPEN) {
        nodes {
          id
          title
          url
        }
      }
    }  
  }
  `)));
  const prs = data.map((repo) => repo.repository.pullRequests.nodes).flat();
  return prs;
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
        title
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
                ...on PullRequest {
                    id
                }
              }
          }
        }
      }
    }
  }`);

  return items[type].projectV2;
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
  let projectId = null;
  let title = null;

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

    projectId = firstBatchOfItems?.id;
    title = firstBatchOfItems?.title;
  } catch (error) {
    console.error(error);
  }

  return { projectItems: items, projectId: projectId, title: title};
};

/**
 * @param {string} projectId
 * @param {string} issueId
 */
export async function addItemToProject(projectId, issueId) {
  return await octokit.graphql(`
    mutation {
      addProjectV2ItemById(input: {
        projectId: "${projectId}",
        contentId: "${issueId}"
      }) {
        clientMutationId
      }
    }
  `);
}

/**
 * Get the current iteration from a given userId, projectId and field name
 * 
 * @param {Object} githubProject
 * 
 * @returns {Promise}
 */
export async function getCurrentIteration(githubProject) {
  const data = await octokit.graphql(`
    query {
      ${githubProject.type}(login: "${githubProject.githubUser}") {
        projectV2(number: ${githubProject.projectNumber}) {
          field(name: "${githubProject.iterationField}") {
            ... on ProjectV2IterationField {
              id
              name
              configuration {
                iterations {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `);

  const iterations = data[githubProject.type].projectV2.field.configuration.iterations;
  if (iterations.length === 0) {
    throw new Error("No iterations found in project");
  }

  return {...iterations[0], fieldId: data[githubProject.type].projectV2.field.id};
}

/**
 * Update the iteration field of a given project v2 item
 * 
 * @param {Object} project
 * @param {string} itemId
 * @param {string} fieldId
 * @param {string} iterationId
 *
 * @returns {Promise}
 */
export async function updateIterationField(project, itemId, fieldId, iterationId) {
  return await octokit.graphql(`
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: "${project.projectId}",
        itemId: "${itemId}",
        fieldId: "${fieldId}",
        value: {
          iterationId: "${iterationId}"
        }
      }) {
        clientMutationId
      }
    }
  `);
}