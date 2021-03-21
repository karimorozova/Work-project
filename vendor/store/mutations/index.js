import language from "./language";
import industry from "./industry";
import steps from "./steps";
import timezones from "./timezones";
import vendors from "./vendors";
import rates from "./rates";
import { INCREASE_REQUEST, DECREASE_REQUEST } from "./requests";
import { ALERTING_MESSAGE } from "./alerts";
import { SET_TOKEN } from "./auth";
import { SET_PREVIOUS_LINK } from "./helpers";

export default {
  ...language,
  ...industry,
  ...steps,
  ...timezones,
  ...vendors,
  ...rates,
  INCREASE_REQUEST,
  DECREASE_REQUEST,
  ALERTING_MESSAGE,
  SET_TOKEN,
  SET_PREVIOUS_LINK
};
