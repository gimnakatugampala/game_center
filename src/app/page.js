export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🎮 Game Center
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#a0aec0' }}>
          Homepage coming soon...
        </p>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#718096' }}>
          Visit <a href="/games/tsp" style={{ color: '#667eea', textDecoration: 'none' }}>/games/tsp</a> to play Traveling Salesman Problem
        </p>
      </div>
    </div>
  );
}