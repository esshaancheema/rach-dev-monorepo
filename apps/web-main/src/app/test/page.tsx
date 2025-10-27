export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Zoptal Test Page</h1>
      <p>If you can see this, the app is running successfully!</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
}