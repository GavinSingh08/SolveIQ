import { NextResponse } from 'next/server';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const VERIFY_USER_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
    }
  }
`;

export async function POST(request: Request) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const leetcodeResponse = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: VERIFY_USER_QUERY,
      variables: { username },
    }),
  });

  const { data } = await leetcodeResponse.json();
  const exists = data?.matchedUser !== null;

  return NextResponse.json({ exists });
}
