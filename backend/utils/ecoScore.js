export function calculateEcoScore({
  materialType = "mixed",
  packagingType = "standard",
  carbonImpact = "medium",
} = {}) {
  const materialScore = {
    plastic: 15,
    mixed: 45,
    natural: 70,
    recycled: 85,
  };

  const packagingScore = {
    plastic: 15,
    standard: 50,
    eco: 85,
  };

  const carbonScore = {
    high: 20,
    medium: 55,
    low: 85,
  };

  const score = Math.round(
    materialScore[materialType] * 0.45 +
      packagingScore[packagingType] * 0.25 +
      carbonScore[carbonImpact] * 0.3,
  );

  const badgeColor = score >= 70 ? "green" : score >= 40 ? "yellow" : "red";

  return {
    materialType,
    packagingType,
    carbonImpact,
    score,
    badgeColor,
  };
}

export function formatLocation(location = {}) {
  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
}
