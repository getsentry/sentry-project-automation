import CONFIG from "./config.js";
import { escapeSpecialChars, queryTeamRepositories, querySentryRepositories } from "../src/helpers.js";

const QUERIES = {
  teamRepositories: queryTeamRepositories(),
  sentryRepositories: querySentryRepositories("Team: Ingest"),
};

export default QUERIES;
