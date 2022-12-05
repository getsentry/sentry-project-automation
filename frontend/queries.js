import CONFIG from "./config.js";
import { escapeSpecialChars, queryTeamRepositories, querySentryRepositories } from "../src/helpers.js";

const QUERIES = {
  teamRepositories: queryTeamRepositories(CONFIG),
  sentryRepositories: querySentryRepositories(CONFIG),
};

export default QUERIES;
