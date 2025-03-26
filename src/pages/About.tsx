export default function About() {
    return (
      <div style={styles.container}>
        <h1>ℹ️ About Us</h1>
        <p>This AI-Driven CRM helps businesses automate, analyze, and personalize customer interactions.</p>
        <ul>
          <li>📌 Smart AI Recommendations</li>
          <li>📌 Automated Customer Support</li>
          <li>📌 Predictive Analytics</li>
          <li>📌 Real-Time Engagement</li>
        </ul>
      </div>
    );
  }
  
  const styles = {
    container: { textAlign: "center", padding: "20px" }
  };
  