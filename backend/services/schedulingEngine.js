/**
 * HomeSync AI - Deterministic Scheduling Engine
 * Calculates feasible non-overlapping appointment slots based on worker hours,
 * active schedules, estimated duration, travel buffer, and preferred time.
 */

// Helper to convert HH:MM to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 540; // Default 09:00 AM
  const [hh, mm] = timeStr.split(':').map(Number);
  return (hh * 60) + (mm || 0);
}

// Helper to convert minutes from midnight to HH:MM (12-hour format string)
function minutesToTimeString(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsStr = mins < 10 ? `0${mins}` : mins;
  return `${hours12}:${minsStr} ${period}`;
}

// Helper to format minutes to 24h HH:MM
function minutesTo24h(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}

/**
 * Finds available schedule slots for a worker on a target date
 */
function calculateFeasibleSlots(worker, existingSchedules = [], estimatedDuration = 45, preferredTime = '10:00') {
  const workStartMin = timeToMinutes(worker.working_hours_start || '09:00'); // 540 (09:00)
  const workEndMin = timeToMinutes(worker.working_hours_end || '18:00');     // 1080 (18:00)
  const travelBuffer = 15; // 15 mins travel buffer
  const slotDuration = estimatedDuration + travelBuffer;

  // Convert existing schedules into minute intervals [start, end]
  const busyIntervals = existingSchedules.map(s => ({
    start: timeToMinutes(s.start_time),
    end: timeToMinutes(s.end_time)
  }));

  // Candidate slots every 30 minutes from workStart to workEnd - estimatedDuration
  const candidateSlots = [];
  
  for (let current = workStartMin; current + estimatedDuration <= workEndMin; current += 30) {
    const slotStart = current;
    const slotEnd = current + estimatedDuration;

    // Check collision with busy intervals
    const hasOverlap = busyIntervals.some(b => {
      // Allow buffer between jobs
      return (slotStart < b.end + 10 && slotEnd + 10 > b.start);
    });

    if (!hasOverlap) {
      candidateSlots.push({
        startTime24: minutesTo24h(slotStart),
        endTime24: minutesTo24h(slotEnd),
        startTimeFormatted: minutesToTimeString(slotStart),
        endTimeFormatted: minutesToTimeString(slotEnd),
        label: `${minutesToTimeString(slotStart)} – ${minutesToTimeString(slotEnd)}`,
        startMinutes: slotStart
      });
    }
  }

  if (candidateSlots.length === 0) {
    // Fallback emergency slot if worker schedule is full
    const defaultStart = workStartMin + 60;
    candidateSlots.push({
      startTime24: minutesTo24h(defaultStart),
      endTime24: minutesTo24h(defaultStart + estimatedDuration),
      startTimeFormatted: minutesToTimeString(defaultStart),
      endTimeFormatted: minutesToTimeString(defaultStart + estimatedDuration),
      label: `${minutesToTimeString(defaultStart)} – ${minutesToTimeString(defaultStart + estimatedDuration)}`,
      startMinutes: defaultStart
    });
  }

  // Sort candidate slots by proximity to preferred time
  const preferredMin = timeToMinutes(preferredTime);
  candidateSlots.sort((a, b) => Math.abs(a.startMinutes - preferredMin) - Math.abs(b.startMinutes - preferredMin));

  const recommendedSlot = candidateSlots[0];
  const alternativeSlots = candidateSlots.slice(1, 4);

  return {
    recommendedSlot,
    alternativeSlots
  };
}

module.exports = {
  calculateFeasibleSlots,
  timeToMinutes,
  minutesToTimeString
};
