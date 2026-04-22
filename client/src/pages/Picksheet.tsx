import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { WeekContext } from '../context/WeekContext.jsx';
import Topbar from '../components/Topbar.jsx';
import apiUrl from '../services/serverConfig.js';

const Picksheet = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { week } = useContext(WeekContext) as { week: number };
  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [games, setGames] = useState<any[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<any>({});
  const [userSelections, setUserSelections] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Record<number, number>>({});
  const [selectedCount, setSelectedCount] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);

  const generatePicksSummary = () => {
    if (!hasExistingSelections || Object.keys(selectedTeam).length === 0) return 'No picks selected';
    return Object.entries(selectedTeam).map(([gameId, teamId]) => {
      const game = games.find((g) => g.id === parseInt(gameId));
      if (!game) return null;
      const name = teamId === game.away_team_id ? game.away_team_name : game.home_team_name;
      return `${name} (${weeklyPoints[parseInt(gameId)] || 0} pts)`;
    }).filter(Boolean).join(' • ');
  };

  useEffect(() => {
    const fetchGamesAndLeague = async () => {
      try {
        const leagueRes = await axios.get(`${apiUrl}/leagueinfo/${leagueId}`);
        const league = leagueRes.data.league[0];
        setLeagueInfo(league);

        const gamesRes = await axios.get(`${apiUrl}/games/${week}`);
        const filtered = gamesRes.data
          .filter((g: any) => g.nfl_year === league.year)
          .sort((a: any, b: any) => new Date(a.game_start_time).getTime() - new Date(b.game_start_time).getTime());
        setGames(filtered);
      } catch (error) {
        console.error('Error fetching game or league data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGamesAndLeague();
  }, [leagueId, week]);

  useEffect(() => {
    if (!week || week <= 0 || !userId) return;
    const fetchUserSelections = async () => {
      try {
        const res = await axios.get(`${apiUrl}/userselections/${leagueId}/${userId}/${week}`);
        const weekSelections = res.data.league.filter((s: any) => s.week === week);
        if (weekSelections.length > 0) {
          setHasExistingSelections(true);
          const { selectedTeam: st, weeklyPoints: wp } = weekSelections.reduce(
            (acc: any, s: any) => {
              acc.selectedTeam[s.game_id] = s.team_id;
              acc.weeklyPoints[s.game_id] = s.points;
              return acc;
            },
            { selectedTeam: {}, weeklyPoints: {} }
          );
          setSelectedTeam(st);
          setWeeklyPoints(wp);
          setSelectedCount(Object.keys(st).length);
        } else {
          setSelectedTeam({});
          setWeeklyPoints({});
          setSelectedCount(0);
          setHasExistingSelections(false);
        }
      } catch {
        setSelectedTeam({});
        setWeeklyPoints({});
        setSelectedCount(0);
      }
    };
    fetchUserSelections();
  }, [leagueId, userId, week]);

  const handleSelectTeam = (gameId: number, teamId: number) => {
    const game = games.find((g) => g.id === gameId);
    if (game?.game_started) { alert('This game has already started.'); return; }

    setSelectedTeam((prev) => {
      if (prev[gameId] === teamId) {
        const next = { ...prev };
        delete next[gameId];
        setWeeklyPoints((p) => { const n = { ...p }; delete n[gameId]; return n; });
        setSelectedCount(Object.keys(next).length);
        return next;
      }
      if (Object.keys(prev).length >= leagueInfo.games_select_max) return prev;
      const next = { ...prev, [gameId]: teamId };
      setSelectedCount(Object.keys(next).length);
      return next;
    });
  };

  const handleInputChange = (gameId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const game = games.find((g) => g.id === gameId);
    if (game?.game_started) { alert('This game has already started.'); return; }
    e.stopPropagation();
    setWeeklyPoints({ ...weeklyPoints, [gameId]: parseInt(e.target.value) || 0 });
  };

  const handleSubmitPicks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const totalPoints = Object.values(weeklyPoints).reduce((a, b) => a + b, 0);
    if (totalPoints !== leagueInfo.weekly_points) {
      alert(`Total points must equal ${leagueInfo.weekly_points}.`);
      setIsSubmitting(false);
      return;
    }
    if (Object.keys(selectedTeam).length < leagueInfo.games_select_min) {
      alert(`You must select at least ${leagueInfo.games_select_min} games.`);
      setIsSubmitting(false);
      return;
    }

    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const picks = games
      .filter((g) => weeklyPoints[g.id] !== undefined)
      .map((g) => ({ gameId: g.id, teamId: selectedTeam[g.id], points: weeklyPoints[g.id], createdAt: ts, updatedAt: ts, week }));

    try {
      if (hasExistingSelections) {
        await axios.delete(`${apiUrl}/removeuserselections/${leagueId}/${userId}/${week}`);
      }
      await axios.post(`${apiUrl}/submitpicks/`, { picks, userId, leagueId });
      alert('Picks submitted successfully!');
      setHasExistingSelections(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit picks.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const formatSpread = (spread: number) => {
    const n = parseFloat(String(spread));
    return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
  };

  return (
    <div className="main-container">
      <Topbar leagueId={leagueId} />
      <div className="page-content">
        <h2>{leagueInfo.name}&apos;s Week {week} Picksheet</h2>
        {hasExistingSelections && (
          <div className="submission-status">
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>✓ Picks submitted for this week</div>
            <div className="picks-summary">{generatePicksSummary()}</div>
          </div>
        )}
        <div className="picksheet-instructions">
          <p className="instruction-text">
            Select {leagueInfo.games_select_min}–{leagueInfo.games_select_max} games &bull; Distribute {leagueInfo.weekly_points} points &bull; Selected: {selectedCount} &bull; Distributed: {Object.values(weeklyPoints).reduce((a, b) => a + b, 0)}
          </p>
          <p className="update-note">Game lines update at 8am every day up until gameday.</p>
        </div>
        <button onClick={handleSubmitPicks} disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Submitting...' : hasExistingSelections ? 'Update Picks' : 'Submit Picks'}
        </button>
        <div className="game-container-wrapper">
          {games.length > 0 ? games.map((game) => (
            <div className={`game-container ${game.game_started ? 'game-locked' : ''}`} key={game.id}>
              <div className="game-info">
                <div className="game-start-date">
                  {new Date(game.game_start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="game-start-time">
                  {new Date(game.game_start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
              {[{ id: game.away_team_id, name: game.away_team_name, spread: game.away_curr_spread, openSpread: game.away_open_spread, label: '' },
                { id: game.home_team_id, name: game.home_team_name, spread: game.home_curr_spread, openSpread: game.home_open_spread, label: '@ ' }].map((team) => (
                <div
                  key={team.id}
                  className={`team-button ${selectedTeam[game.id] === team.id ? 'selected' : ''} ${game.game_started ? 'disabled' : ''}`}
                  onClick={() => handleSelectTeam(game.id, team.id)}
                >
                  <span className="team-name">{team.label}{team.name}</span>
                  <span className="curr-spread">{formatSpread(team.spread)}</span>
                  <span className="open-spread">(Open: {formatSpread(team.openSpread)})</span>
                  {selectedTeam[game.id] === team.id && !game.game_started && (
                    <input
                      className="point-input"
                      type="number"
                      value={weeklyPoints[game.id] || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleInputChange(game.id, e)}
                      placeholder="Points"
                    />
                  )}
                </div>
              ))}
            </div>
          )) : <p>No games available for this week.</p>}
        </div>
      </div>
    </div>
  );
};

export default Picksheet;
