import { roundToDecimalPlaces } from "shared/js/utils";

export const getMetics = ({
  doc_count,
  sentiment_score = 0,
  engagement_score = 0,
  next_steps_count = 0,
  engaging_questions_count = 0,
  filler_words_count = 0,
  talk_to_listen_ratio = 0,
  longest_monolog = 0,
  talk_speed = 0,
  patience = 0,
  sentiment_score_change = 0,
  engagement_score_change = 0,
  next_steps_count_change = 0,
  engaging_questions_count_change = 0,
  conversation_per_deal = 0,
}) => {
  let metrics = {};
  //now use
  metrics.my_talk_time = Math.round(talk_to_listen_ratio * 100);
  metrics.talk_speed = Math.round(talk_speed);
  metrics.longest_spiel = Math.round(longest_monolog);
  metrics.filler_words = roundToDecimalPlaces(filler_words_count, 1);
  metrics.patience = roundToDecimalPlaces(patience, 1);
  metrics.conversation_per_deal = Math.round(conversation_per_deal);
  //for future
  metrics.isResultFound = doc_count > 0;
  metrics.sentiment = Math.round(sentiment_score);
  metrics.engagement = Math.round(engagement_score);
  metrics.nextSteps = Math.round(next_steps_count);
  metrics.goodQuestions = Math.round(engaging_questions_count);
  metrics.sentimentDiff = Math.round(sentiment_score_change);
  metrics.engagementDiff = Math.round(engagement_score_change);
  metrics.nextStepsDiff = Math.round(next_steps_count_change);
  metrics.goodQuestionsDiff = Math.round(engaging_questions_count_change);
  return metrics;
};
