import {
  AIAutoBreakdownRequest,
  AIAutoBreakdownResponse,
  AssistantProposal,
  Goal,
} from '@ai-study-planner/shared';

// Academic curriculum knowledge base for instant high-quality topic breakdowns
const CURRICULUM_PRESETS: Record<string, Array<{ title: string; difficulty: number; estHours: number }>> = {
  dsa: [
    { title: 'Array Manipulation & Two Pointers', difficulty: 2, estHours: 3 },
    { title: 'Strings & Sliding Window', difficulty: 2, estHours: 3 },
    { title: 'Linked Lists & Fast/Slow Pointers', difficulty: 3, estHours: 2.5 },
    { title: 'Stacks, Queues & Monotonic Stacks', difficulty: 3, estHours: 3 },
    { title: 'Binary Search & Edge Cases', difficulty: 3, estHours: 3.5 },
    { title: 'Binary Trees, BST & Tree Traversals', difficulty: 4, estHours: 4.5 },
    { title: 'Graph BFS/DFS & Topological Sort', difficulty: 4, estHours: 5 },
    { title: 'Dijkstra & Minimum Spanning Trees', difficulty: 4, estHours: 4 },
    { title: 'Dynamic Programming: 1D & Knapsack', difficulty: 5, estHours: 6 },
    { title: 'Dynamic Programming: 2D & Grid Paths', difficulty: 5, estHours: 6 },
  ],
  os: [
    { title: 'Processes, Threads & Context Switching', difficulty: 3, estHours: 3.5 },
    { title: 'CPU Scheduling Algorithms', difficulty: 2, estHours: 3 },
    { title: 'Process Synchronization & Semaphores', difficulty: 4, estHours: 4.5 },
    { title: 'Deadlock Detection & Prevention (Banker’s)', difficulty: 4, estHours: 3.5 },
    { title: 'Memory Management, Paging & Virtual Memory', difficulty: 4, estHours: 5 },
    { title: 'Page Replacement Algorithms (LRU, FIFO)', difficulty: 3, estHours: 3 },
    { title: 'File System Architecture & Disk Scheduling', difficulty: 3, estHours: 3 },
  ],
  ml: [
    { title: 'Linear & Logistic Regression with Gradient Descent', difficulty: 3, estHours: 4 },
    { title: 'Decision Trees, Random Forests & Ensemble Methods', difficulty: 3, estHours: 4.5 },
    { title: 'Support Vector Machines & Kernel Tricks', difficulty: 4, estHours: 4 },
    { title: 'Neural Networks: Forward & Backpropagation', difficulty: 5, estHours: 6 },
    { title: 'Convolutional Neural Networks (CNNs)', difficulty: 4, estHours: 5 },
    { title: 'Sequence Models, RNNs & Transformers', difficulty: 5, estHours: 6 },
    { title: 'Model Evaluation: Cross-Validation & Metrics', difficulty: 2, estHours: 3 },
  ],
  webdev: [
    { title: 'Modern JavaScript (ES6+), Async/Await & Event Loop', difficulty: 2, estHours: 4 },
    { title: 'React Core: Components, Props, State & Hooks', difficulty: 3, estHours: 5 },
    { title: 'State Management & Client Cache (Zustand, Query)', difficulty: 3, estHours: 4 },
    { title: 'RESTful API Design & Express Server Architecture', difficulty: 3, estHours: 4.5 },
    { title: 'Database Modeling & Mongoose Schemas', difficulty: 3, estHours: 4 },
    { title: 'Authentication: JWT, Refresh Tokens & OAuth', difficulty: 4, estHours: 4.5 },
    { title: 'Deployment, CI/CD & Performance Optimization', difficulty: 3, estHours: 3.5 },
  ],
};

export const AIService = {
  /**
   * Generates a pedagogical topic breakdown from a goal title or syllabus text.
   */
  async generateTopicBreakdown(req: AIAutoBreakdownRequest): Promise<AIAutoBreakdownResponse> {
    const titleLower = req.title.toLowerCase();

    // 1. Check if user provided explicit syllabus text
    if (req.syllabusText && req.syllabusText.trim().length > 15) {
      const lines = req.syllabusText
        .split(/[\n,;•\-]/)
        .map((l) => l.trim())
        .filter((l) => l.length > 2 && !l.toLowerCase().includes('syllabus'));

      if (lines.length >= 2) {
        const topics = lines.slice(0, 12).map((line, idx) => {
          // Heuristic difficulty based on length / terms
          let diff = 3;
          if (line.match(/advanced|dynamic|concurrency|kernel|distributed|neural|complex|quantum/i)) diff = 5;
          else if (line.match(/intro|basic|overview|fundamental|syntax|arrays/i)) diff = 2;
          else if (line.match(/algorithm|tree|graph|memory|optimization|database/i)) diff = 4;

          return {
            title: line,
            difficulty: diff,
            estHours: diff * 1.25,
          };
        });

        const suggestedTotalHours = topics.reduce((sum, t) => sum + t.estHours, 0);
        return {
          topics,
          suggestedTotalHours: Math.round(suggestedTotalHours * 10) / 10,
          reasoning: `Extracted ${topics.length} key modules from your syllabus text with calibrated difficulty and effort estimates.`,
        };
      }
    }

    // 2. Preset match
    if (titleLower.includes('dsa') || titleLower.includes('data structure') || titleLower.includes('algorithm') || titleLower.includes('leetcode')) {
      const topics = CURRICULUM_PRESETS.dsa;
      const suggestedTotalHours = topics.reduce((sum, t) => sum + t.estHours, 0);
      return {
        topics,
        suggestedTotalHours,
        reasoning: 'Tailored 10-module comprehensive DSA roadmap covering foundational patterns up to dynamic programming and graph theory.',
      };
    }

    if (titleLower.includes('operating system') || titleLower.includes('os ') || titleLower.includes('system software')) {
      const topics = CURRICULUM_PRESETS.os;
      const suggestedTotalHours = topics.reduce((sum, t) => sum + t.estHours, 0);
      return {
        topics,
        suggestedTotalHours,
        reasoning: 'Standard university syllabus structure for Operating Systems covering process management, memory paging, and storage.',
      };
    }

    if (titleLower.includes('machine learning') || titleLower.includes('ml') || titleLower.includes('ai') || titleLower.includes('deep learning')) {
      const topics = CURRICULUM_PRESETS.ml;
      const suggestedTotalHours = topics.reduce((sum, t) => sum + t.estHours, 0);
      return {
        topics,
        suggestedTotalHours,
        reasoning: 'Full-stack Machine Learning track from regression and ensembles to deep learning and neural architectures.',
      };
    }

    if (titleLower.includes('web') || titleLower.includes('fullstack') || titleLower.includes('react') || titleLower.includes('node')) {
      const topics = CURRICULUM_PRESETS.webdev;
      const suggestedTotalHours = topics.reduce((sum, t) => sum + t.estHours, 0);
      return {
        topics,
        suggestedTotalHours,
        reasoning: 'Full-stack modern web engineering roadmap with frontend state, backend APIs, auth, and production deployment.',
      };
    }

    // 3. Smart generalized curriculum synthesis for arbitrary titles
    const defaultModules = [
      { title: `Foundations & Fundamentals of ${req.title}`, difficulty: 2, estHours: 3 },
      { title: `Core Principles & Architecture`, difficulty: 3, estHours: 4 },
      { title: `Intermediate Problem Solving & Applications`, difficulty: 3, estHours: 4.5 },
      { title: `Advanced Techniques & Case Studies`, difficulty: 4, estHours: 5 },
      { title: `Comprehensive Review & Practice Problems`, difficulty: 4, estHours: 3.5 },
    ];

    const suggestedTotalHours = defaultModules.reduce((sum, t) => sum + t.estHours, 0);
    return {
      topics: defaultModules,
      suggestedTotalHours,
      reasoning: `Synthesized a balanced 5-stage learning progression for "${req.title}" with progressive difficulty scaling.`,
    };
  },

  /**
   * Translates natural language student requests into structured actions.
   */
  async processAssistantChat(
    message: string,
    context: { goals: Goal[]; userPreferences: any }
  ): Promise<{
    reply: string;
    proposal?: AssistantProposal;
  }> {
    const msg = message.toLowerCase();

    // Check for blocked date / unavailable requests ("sick today", "unavailable on friday", "traveling")
    if (
      msg.includes('sick') ||
      msg.includes('unavailable') ||
      msg.includes('busy') ||
      msg.includes('cannot study') ||
      msg.includes("can't study") ||
      msg.includes('take off') ||
      msg.includes('dentist') ||
      msg.includes('appointment')
    ) {
      const today = new Date();
      let targetDate = today;

      if (msg.includes('tomorrow')) {
        targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (msg.includes('friday')) {
        const day = today.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        targetDate = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000);
      } else if (msg.includes('saturday')) {
        const day = today.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        targetDate = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000);
      }

      const dateStr = targetDate.toISOString().split('T')[0];

      return {
        reply: `I understand! I've prepared a proposal to block out ${dateStr} so you won't have any study sessions scheduled then. Your remaining sessions will be intelligently shifted across upcoming slots to preserve your deadlines.`,
        proposal: {
          id: `prop_${Date.now()}`,
          actionType: 'block_date',
          description: `Block date ${dateStr} and adaptively reschedule pending sessions.`,
          details: {
            startDate: `${dateStr}T00:00:00.000Z`,
            endDate: `${dateStr}T23:59:59.000Z`,
            reason: 'Personal unavailability / Break',
          },
        },
      };
    }

    // Check for deadline extension
    if (msg.includes('extend deadline') || msg.includes('more time for') || msg.includes('delay exam')) {
      const matchingGoal = context.goals.find((g) => msg.includes(g.title.toLowerCase())) || context.goals[0];
      if (matchingGoal) {
        const currentDeadline = new Date(matchingGoal.deadline);
        const newDeadline = new Date(currentDeadline.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return {
          reply: `I can extend the deadline for **${matchingGoal.title}** by 1 week to ${newDeadline.split('T')[0]}. This will relax your daily study hours and increase your buffer time.`,
          proposal: {
            id: `prop_${Date.now()}`,
            actionType: 'change_deadline',
            description: `Extend "${matchingGoal.title}" deadline by 7 days.`,
            details: {
              goalId: matchingGoal.id,
              newDeadline,
            },
          },
        };
      }
    }

    // Check for re-plan request
    if (msg.includes('replan') || msg.includes('reschedule') || msg.includes('behind') || msg.includes('adjust')) {
      return {
        reply: `I can trigger an adaptive re-plan across all your active subjects. The scheduler will interleave your topics, prioritize high-difficulty concepts during your peak study hours, and ensure buffer slots are preserved.`,
        proposal: {
          id: `prop_${Date.now()}`,
          actionType: 'replan',
          description: 'Recalculate adaptive schedule across all goals.',
          details: {},
        },
      };
    }

    // Default friendly assistant advice
    return {
      reply: `I'm your AI Study Assistant! You can tell me things like:\n- *"I'm sick tomorrow, clear my schedule"*\n- *"I'm busy this Friday for a family event"*\n- *"Extend my DSA exam deadline by a week"*\n- *"Re-plan my study schedule"*\n\nHow can I help optimize your study flow today?`,
    };
  },
};
