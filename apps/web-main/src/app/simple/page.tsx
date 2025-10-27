export default function SimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Simple Test Page</h1>
      <p>This is a minimal page to test if Next.js is working.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}