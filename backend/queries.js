import CONFIG from "./config.js";
import { escapeSpecialChars, queryTeamRepositories, querySentryRepositories } from "../src/helpers.js";

const QUERIES = {
  teamRepositories: queryTeamRepositories(),
  sentryRepositories: querySentryRepositories("Team: Web Backend"),
};

export default QUERIES;
