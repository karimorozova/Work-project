import language from "./language";
import timezones from "./timezones";
import vendors from "./vendors";
import { INCREASE_REQUEST, DECREASE_REQUEST } from "./requests";
import { ALERTING_MESSAGE } from "./alerts";

export default {
  ...language,
  ...timezones,
  ...vendors,
  INCREASE_REQUEST,
  DECREASE_REQUEST,
  ALERTING_MESSAGE
};
