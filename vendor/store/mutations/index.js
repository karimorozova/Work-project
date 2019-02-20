import language from "./language";
import timezones from "./timezones";
import vendors from "./vendors";
import { INCREASE_REQUEST, DECREASE_REQUEST } from "./requests";

export default {
  ...language,
  ...timezones,
  ...vendors,
  INCREASE_REQUEST,
  DECREASE_REQUEST
};
