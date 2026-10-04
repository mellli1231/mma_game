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
      <div className="focu-card flex flex-col items-center gap-4 p-8">
        <p className="text-sm font-extrabold uppercase tracking-widest text-muted">Battle complete</p>
        <h1 className="focu-title">Your Squad zoned out...</h1>
        <p className="max-w-lg text-lg text-soft">
          {battle?.gymName
            ? `${battle.gymName} held its ground. Your next Adventure can help you prepare for another try.`
            : 'The Distraction Gym held its ground. Your next Adventure can help you prepare for another try.'}
        </p>
        {practice && <p className="text-sm text-muted">Practice battles do not change Gym progress.</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {gymLevel && (
          <Link
            to={`/battle/${gymLevel}${practice ? '?practice=1' : ''}`}
            className="focu-btn focu-btn--primary"
          >
            Rematch
          </Link>
        )}
        <Link to="/gyms" className="focu-btn focu-btn--secondary">Gym Map</Link>
        <Link to="/" className="focu-btn focu-btn--secondary">Home</Link>
      </div>
    </main>
  );
}
