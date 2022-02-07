import {
  getProjectColumns,
  getColumnCards,
  getIssue,
} from "./github-old-projects.js";
import { addItemToProject } from "./github.js";
import ghParse from "parse-github-url";

const OLD_PROJECT_ID = "OLD_PROJECT_ID_HERE";

const OLD_PROJECT_COLUMNS = [
  {
    old_project_id: "PROJECT_ID",
    name: "COLUMN_NAME",
  },
];

async function migrate() {
  // const projectColumns = await getProjectColumns(OLD_PROJECT_ID);

  const columnCards = await getColumnCards(
    OLD_PROJECT_COLUMNS[0].old_project_id
  );

  const promisesss = columnCards.map((card) => {
    const {
      owner,
      filepath: issue_number,
      name: repo,
    } = ghParse(card.content_url);

    return { owner, repo, issue_number };
  });

  const issues = (await Promise.all(promisesss.map(getIssue))).map(
    (issue) => issue[0].node_id
  );

  for (const issueId of issues) {
    await addItemToProject("PN_kwDOABVQ184AAtgH", issueId);

    console.info(`Added: ${issueId}`);
  }

  console.log("Finished.");
}

migrate();
