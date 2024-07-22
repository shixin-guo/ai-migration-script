
import { KPI_TYPE } from "shared/js/constant";

export function getSearchByIndicatorKey(searchByIndicator: string = ""): string {
  let key: string = KPI_TYPE.GOOD_QUESTIONS;
  if (searchByIndicator == "1") {
    key = KPI_TYPE.GOOD_QUESTIONS;
  } else if (searchByIndicator == "2") {
    key = KPI_TYPE.NEXT_STEPS;
  } else if (searchByIndicator == "5") {
    key = KPI_TYPE.FILLER_WORDS;
  } else if (searchByIndicator == "indicator") {
    // todo
    key = "indicators";
  } else if (searchByIndicator == "topic_mentioned") {
    key = "topics";
  }
  return key;
}
