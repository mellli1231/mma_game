import { Link, useLocation } from 'react-router-dom';

interface DefeatRouteState {
  gymLevel?: number;
  gymName?: string;
  practice?: boolean;
}

export default function Defeat() {
  const location = useLocation();
  const battle = location.state as DefeatRouteState | null;
  const gymLevel = battle?.gymLevel;
  const practice = battle?.practice;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-5 p-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Battle complete</p>
      <h1 className="text-4xl font-black">Your Squad zoned out...</h1>
      <p className="max-w-lg text-lg text-slate-600">
        {battle?.gymName
          ? `${battle.gymName} held its ground. Your next Adventure can help you prepare for another try.`
          : 'The Distraction Gym held its ground. Your next Adventure can help you prepare for another try.'}
      </p>
      {practice && <p className="text-sm text-slate-500">Practice battles do not change Gym progress.</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {gymLevel && (
          <Link
            to={`/battle/${gymLevel}${practice ? '?practice=1' : ''}`}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
          >
            Try again
          </Link>
        )}
        <Link to="/gyms" className="rounded-xl border px-5 py-3 font-bold">Gym Map</Link>
        <Link to="/" className="rounded-xl border px-5 py-3 font-bold">Home</Link>
      </div>
    </main>
  );
}
