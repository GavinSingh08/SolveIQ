const stats = [
  { label: 'Problems Solved', value: '128' },
  { label: 'Topics Mastered', value: '6 / 14' },
  { label: 'Current Streak', value: '4 days' },
  { label: 'Readiness Score', value: '72%' },
];

export default function Dashboard() {
  return (
    <main className="px-8 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
      <p className="text-gray-400 mb-8">
        Here&apos;s how your interview prep is going.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-800 rounded-lg p-5 border border-gray-700"
          >
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
