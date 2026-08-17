import type { SupabaseClient } from '@supabase/supabase-js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

async function leetcodeRequest(query: string, variables: Record<string, unknown>) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  });
  const { data } = await response.json();
  return data;
}

const RECENT_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      title
      titleSlug
      timestamp
    }
  }
`;

const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      difficulty
      topicTags { name }
    }
  }
`;

const AGGREGATE_QUERY = `
  query userAggregateStats($username: String!, $year: Int) {
    matchedUser(username: $username) {
      profile {
        userAvatar
      }
      tagProblemCounts {
        advanced { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental { tagName problemsSolved }
      }
      userCalendar(year: $year) {
        submissionCalendar
      }
    }
  }
`;

const PROGRESS_QUERY = `
  query questionProgress($userSlug: String!) {
    userProfileUserQuestionProgressV2(userSlug: $userSlug) {
      numAcceptedQuestions { count difficulty }
    }
  }
`;

// Total problems per difficulty across all of LeetCode, not scoped to any
// user — used as the reference distribution so "difficulty breakdown" can
// compare the user's mix against the catalog's actual mix, instead of just
// re-showing the same solved counts the stat cards already display.
const CATALOG_COUNTS_QUERY = `
  query allQuestionsCount {
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

async function syncRecentProblems(
  supabase: SupabaseClient,
  userId: string,
  username: string
) {
  const { recentAcSubmissionList } = await leetcodeRequest(
    RECENT_SUBMISSIONS_QUERY,
    { username, limit: 20 }
  );

  // LeetCode lists every accepted submission, including re-solves of the same
  // problem. Keep only the first (most recent, since the list is newest-first)
  // occurrence of each slug so the upsert never targets the same row twice.
  const seenSlugs = new Set<string>();
  const uniqueSubmissions = recentAcSubmissionList.filter(
    (submission: { titleSlug: string }) => {
      if (seenSlugs.has(submission.titleSlug)) return false;
      seenSlugs.add(submission.titleSlug);
      return true;
    }
  );

  const rows = await Promise.all(
    uniqueSubmissions.map(
      async (submission: { title: string; titleSlug: string; timestamp: string }) => {
        const { question } = await leetcodeRequest(QUESTION_QUERY, {
          titleSlug: submission.titleSlug,
        });

        return {
          user_id: userId,
          slug: submission.titleSlug,
          display_name: submission.title,
          difficulty: question.difficulty,
          topics: question.topicTags.map((tag: { name: string }) => tag.name),
          solved_at: new Date(Number(submission.timestamp) * 1000).toISOString(),
        };
      }
    )
  );

  if (rows.length > 0) {
    const { error } = await supabase
      .from('recent_problems')
      .upsert(rows, { onConflict: 'user_id,slug' });

    if (error) {
      console.error('recent_problems upsert failed:', error);
    }
  }
}

async function syncUserStats(
  supabase: SupabaseClient,
  userId: string,
  username: string
) {
  const currentYear = new Date().getFullYear();

  const [aggregateData, previousYearData, progressData, catalogData] = await Promise.all([
    leetcodeRequest(AGGREGATE_QUERY, { username, year: currentYear }),
    leetcodeRequest(AGGREGATE_QUERY, { username, year: currentYear - 1 }),
    leetcodeRequest(PROGRESS_QUERY, { userSlug: username }),
    leetcodeRequest(CATALOG_COUNTS_QUERY, {}),
  ]);

  const difficultyCounts: Record<string, number> = {};
  for (const entry of progressData.userProfileUserQuestionProgressV2.numAcceptedQuestions) {
    difficultyCounts[entry.difficulty.toLowerCase()] = entry.count;
  }

  const { advanced, intermediate, fundamental } = aggregateData.matchedUser.tagProblemCounts;
  const topics: Record<string, number> = {};
  for (const tag of [...advanced, ...intermediate, ...fundamental]) {
    topics[tag.tagName] = tag.problemsSolved;
  }

  // The heatmap shows a trailing 371-day window, which can reach back into
  // the previous calendar year (e.g. every January) — LeetCode's calendar
  // API is scoped to a single year, so merge this year's and last year's.
  // 371 days never reaches back two full years, so these two are enough.
  const currentYearCalendar = JSON.parse(aggregateData.matchedUser.userCalendar.submissionCalendar);
  const previousYearCalendar = JSON.parse(previousYearData.matchedUser.userCalendar.submissionCalendar);
  const calendar = { ...previousYearCalendar, ...currentYearCalendar };

  const catalogCounts: Record<string, number> = {};
  for (const entry of catalogData.allQuestionsCount) {
    if (entry.difficulty !== 'All') {
      catalogCounts[entry.difficulty.toLowerCase()] = entry.count;
    }
  }

  const { error } = await supabase.from('user_stats').upsert({
    user_id: userId,
    easy_solved: difficultyCounts.easy ?? 0,
    medium_solved: difficultyCounts.medium ?? 0,
    hard_solved: difficultyCounts.hard ?? 0,
    topics,
    calendar,
    catalog_counts: catalogCounts,
    last_synced_at: new Date().toISOString(),
  });

  if (error) {
    console.error('user_stats upsert failed:', error);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: aggregateData.matchedUser.profile.userAvatar })
    .eq('id', userId);

  if (profileError) {
    console.error('profiles avatar update failed:', profileError);
  }
}

export async function syncLeetCodeData(
  supabase: SupabaseClient,
  userId: string,
  username: string
) {
  await Promise.all([
    syncRecentProblems(supabase, userId, username),
    syncUserStats(supabase, userId, username),
  ]);
}
