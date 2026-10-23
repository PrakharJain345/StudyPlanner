import { Goal, Topic } from '@ai-study-planner/shared';
import { differenceInDays, parseISO } from 'date-fns';

export interface TopicScore {
  topic: Topic;
  goal: Goal;
  score: number;
  urgency: number;
  priorityFactor: number;
  difficultyFactor: number;
}

/**
 * Calculates priority-urgency-difficulty score for a topic.
 * Higher score = higher placement priority.
 */
export function calculateTopicScore(topic: Topic, goal: Goal, currentDate: Date): TopicScore {
  const deadlineDate = parseISO(goal.deadline);
  const daysUntilDeadline = differenceInDays(deadlineDate, currentDate);

  // Urgency: rises exponentially or inversely as deadline nears
  let urgency = 1;
  if (daysUntilDeadline <= 0) {
    urgency = 10; // Overdue or due today
  } else if (daysUntilDeadline <= 3) {
    urgency = 7;
  } else if (daysUntilDeadline <= 7) {
    urgency = 4.5;
  } else if (daysUntilDeadline <= 14) {
    urgency = 3;
  } else if (daysUntilDeadline <= 30) {
    urgency = 1.8;
  } else {
    urgency = Math.max(1, 40 / daysUntilDeadline);
  }

  // Priority: 1-5 scale mapped to weight 0.8 to 2.5
  const priorityFactor = 0.5 + goal.priority * 0.4;

  // Difficulty: 1-5 scale mapped to weight 0.9 to 1.7
  const difficultyFactor = 0.7 + topic.difficulty * 0.2;

  // Order penalty: topics earlier in the syllabus get a slight boost
  const orderBonus = Math.max(0, 1 - topic.order * 0.05);

  const score = priorityFactor * urgency * difficultyFactor + orderBonus;

  return {
    topic,
    goal,
    score,
    urgency,
    priorityFactor,
    difficultyFactor,
  };
}
