export interface DonorProfile {
  id: string;
  reliability: number;
  location: [number, number];
  history: number;
}

export const calculatePriority = (donor: DonorProfile, currentLoc: [number, number]) => {
  const distance = Math.sqrt(
    Math.pow(donor.location[0] - currentLoc[0], 2) + 
    Math.pow(donor.location[1] - currentLoc[1], 2)
  );

  // Weight factors
  const wDistance = 0.4;
  const wReliability = 0.3;
  const wHistory = 0.3;

  const score = (1 / (distance + 0.1)) * wDistance + 
                (donor.reliability / 100) * wReliability + 
                (donor.history / 50) * wHistory;

  return Math.min(score * 100, 100);
};

export const getUrgencyColor = (score: number) => {
  if (score > 80) return '#EF4444'; // Critically Urgent
  if (score > 50) return '#F97316'; // High Priority
  return '#3B82F6'; // Standard
};

// Resubmission commit update
