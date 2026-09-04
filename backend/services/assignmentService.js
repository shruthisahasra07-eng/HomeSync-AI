/**
 * HomeSync AI - Smart Worker Assignment Engine
 * Multi-criteria ranking system based on skill, availability, distance, workload, and performance.
 */

// Helper to estimate block distance between A, B, C, D, E, F
function calculateBlockDistanceScore(residentBlock, workerBlock) {
  const blocks = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F'];
  
  // Normalize strings
  const rIdx = blocks.findIndex(b => residentBlock && residentBlock.includes(b.replace('Block ', '')));
  const wIdx = blocks.findIndex(b => workerBlock && workerBlock.includes(b.replace('Block ', '')));

  if (rIdx === -1 || wIdx === -1) return 80;

  const distance = Math.abs(rIdx - wIdx);
  if (distance === 0) return 100; // Same block
  if (distance === 1) return 85;  // Neighboring block
  if (distance === 2) return 70;  // 2 blocks away
  return 55;                      // 3+ blocks away
}

function calculateWorkerMatch(worker, requiredSkill, residentBlock) {
  // 1. Skill Match Score (40% weight)
  let parsedSkills = [];
  try {
    parsedSkills = typeof worker.skills === 'string' ? JSON.parse(worker.skills) : worker.skills;
  } catch (e) {
    parsedSkills = [worker.skills];
  }

  const primarySkill = parsedSkills[0] || '';
  const hasSkill = parsedSkills.some(s => s.toLowerCase().includes(requiredSkill.toLowerCase()) || requiredSkill.toLowerCase().includes(s.toLowerCase()));
  
  let skillScore = 0;
  if (primarySkill.toLowerCase().includes(requiredSkill.toLowerCase())) {
    skillScore = 100;
  } else if (hasSkill) {
    skillScore = 85;
  } else {
    skillScore = 0;
  }

  // 2. Availability Score (25% weight)
  let availScore = 0;
  if (worker.availability_status === 'Available') {
    availScore = 100;
  } else if (worker.availability_status === 'Busy') {
    availScore = 35;
  } else {
    availScore = 0;
  }

  // 3. Distance / Travel Score (15% weight)
  const distanceScore = calculateBlockDistanceScore(residentBlock, worker.current_block);

  // 4. Current Workload Score (10% weight)
  const activeJobs = worker.active_jobs || 0;
  let workloadScore = 100;
  if (activeJobs === 1) workloadScore = 80;
  else if (activeJobs === 2) workloadScore = 50;
  else if (activeJobs >= 3) workloadScore = 20;

  // 5. Historical Performance Score (10% weight)
  const rating = worker.rating || 4.5;
  const performanceScore = Math.min(100, Math.round((rating / 5.0) * 100));

  // Weighted sum
  const finalScore = Math.round(
    (skillScore * 0.40) +
    (availScore * 0.25) +
    (distanceScore * 0.15) +
    (workloadScore * 0.10) +
    (performanceScore * 0.10)
  );

  // Reasons / bullet points
  const matchReasons = [];
  if (skillScore > 0) matchReasons.push(`✓ Required ${requiredSkill} skill match`);
  if (availScore === 100) matchReasons.push('✓ Currently available');
  else if (availScore > 0) matchReasons.push('• Currently completing active job');
  if (workloadScore >= 80) matchReasons.push('✓ Low active workload');
  if (performanceScore >= 90) matchReasons.push(`✓ Excellent performance rating (${rating}★)`);
  if (distanceScore >= 85) matchReasons.push(`✓ Nearby location (${worker.current_block || 'Same Block'})`);

  return {
    workerId: worker.id,
    workerName: worker.name,
    skills: parsedSkills,
    rating: worker.rating,
    availability: worker.availability_status,
    currentBlock: worker.current_block,
    activeJobs: worker.active_jobs,
    matchScore: finalScore,
    scoreBreakdown: {
      skillScore,
      availScore,
      distanceScore,
      workloadScore,
      performanceScore
    },
    matchReasons
  };
}

/**
 * Ranks all workers for a given request
 */
function rankEligibleWorkers(allWorkers, requiredSkill, residentBlock) {
  const ranked = allWorkers
    .map(worker => calculateWorkerMatch(worker, requiredSkill, residentBlock))
    .sort((a, b) => b.matchScore - a.matchScore);

  const recommendedWorker = ranked.length > 0 ? ranked[0] : null;

  return {
    recommendedWorker,
    rankedWorkers: ranked
  };
}

module.exports = {
  calculateWorkerMatch,
  rankEligibleWorkers
};
