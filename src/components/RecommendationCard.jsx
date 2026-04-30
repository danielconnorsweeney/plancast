function RecommendationCard({
  activityRecommendation,
  selectedActivity,
  activityOptions,
}) {
  if (!activityRecommendation) {
    return null;
  }

  return (
    <div className="recommendation-card">
      <p className="section-label">Activity recommendation</p>
      <h4>{activityRecommendation.label}</h4>
      <p>
        {activityOptions[selectedActivity].label} score:{" "}
        <strong>{activityRecommendation.score}/100</strong>
      </p>

      <ul className="recommendation-reasons">
        {activityRecommendation.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationCard;
