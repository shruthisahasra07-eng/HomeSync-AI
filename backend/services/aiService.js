/**
 * HomeSync AI - AI-Assisted & Rule-Based NLP Complaint Analysis Service
 * 
 * Analyzes natural language maintenance complaints using deterministic rule-based NLP classification,
 * semantic keyword matching, and severity heuristics to extract structured metadata:
 * - Category & Subcategory
 * - Priority Level (Low / Medium / High)
 * - Required Worker Skill
 * - Estimated Repair Duration (minutes)
 * - Explainable Diagnostic Reasoning & Confidence Score
 * 
 * Note: Operates as a fast, deterministic, offline-capable, and cost-free NLP classification engine.
 */

async function analyzeMaintenanceRequest(description) {
  if (!description || typeof description !== 'string') {
    throw new Error('Description is required for analysis');
  }

  const text = description.toLowerCase().trim();

  let category = 'Other';
  let subcategory = 'General Maintenance';
  let priority = 'MEDIUM';
  let requiredSkill = 'General Maintenance';
  let estimatedDuration = 45; // minutes
  let confidence = 92;
  let reason = 'Identified via rule-based NLP semantic keyword matching and symptom severity analysis.';

  // 1. PLUMBING
  if (
    text.includes('tap') || text.includes('faucet') || text.includes('leak') || 
    text.includes('pipe') || text.includes('drain') || text.includes('flush') || 
    text.includes('toilet') || text.includes('sink') || text.includes('plumb')
  ) {
    category = 'Plumbing';
    requiredSkill = 'Plumbing';

    if (text.includes('tap') || text.includes('faucet')) {
      subcategory = 'Tap Leakage';
      estimatedDuration = 45;
      confidence = 94;
      reason = 'Continuous tap leakage detected. Requires washer replacement or valve inspection to prevent water wastage.';
    } else if (text.includes('pipe') || text.includes('burst')) {
      subcategory = 'Pipe Leakage';
      estimatedDuration = 60;
      confidence = 95;
      reason = 'Pipe leakage detected. Water line repair needed urgently to prevent structural dampness.';
    } else if (text.includes('drain') || text.includes('clog') || text.includes('block')) {
      subcategory = 'Drain Blockage';
      estimatedDuration = 45;
      confidence = 91;
      reason = 'Drainage blockage detected. Hydraulic clearing required.';
    } else if (text.includes('toilet') || text.includes('flush')) {
      subcategory = 'Toilet Issue';
      estimatedDuration = 45;
      confidence = 93;
      reason = 'Sanitary flush mechanism failure identified.';
    } else {
      subcategory = 'Water Pressure';
      estimatedDuration = 30;
      confidence = 88;
      reason = 'General plumbing flow pressure anomaly.';
    }
  }

  // 2. ELECTRICAL
  else if (
    text.includes('fan') || text.includes('light') || text.includes('switch') || 
    text.includes('socket') || text.includes('power') || text.includes('wire') || 
    text.includes('spark') || text.includes('circuit') || text.includes('electric') || text.includes('fuse')
  ) {
    category = 'Electrical';
    requiredSkill = 'Electrical';

    if (text.includes('fan')) {
      subcategory = 'Fan Issue';
      estimatedDuration = 30;
      confidence = 91;
      reason = 'Ceiling/exhaust fan mechanical noise or capacitor failure detected.';
    } else if (text.includes('light') || text.includes('bulb') || text.includes('tube')) {
      subcategory = 'Light Issue';
      estimatedDuration = 20;
      confidence = 96;
      reason = 'Lighting fixture or circuit fitting replacement required.';
    } else if (text.includes('switch') || text.includes('button')) {
      subcategory = 'Switch Problem';
      estimatedDuration = 30;
      confidence = 92;
      reason = 'Electrical switch contact failure detected.';
    } else if (text.includes('spark') || text.includes('short') || text.includes('fuse')) {
      subcategory = 'Power Issue';
      estimatedDuration = 60;
      confidence = 97;
      reason = 'Hazardous spark or circuit short detected. High priority safety inspection needed.';
    } else {
      subcategory = 'Socket Problem';
      estimatedDuration = 30;
      confidence = 89;
      reason = 'Wall socket voltage or connection issue.';
    }
  }

  // 3. CARPENTRY
  else if (
    text.includes('door') || text.includes('window') || text.includes('cabinet') || 
    text.includes('lock') || text.includes('hinge') || text.includes('wood') || text.includes('furniture')
  ) {
    category = 'Carpentry';
    requiredSkill = 'Carpentry';

    if (text.includes('door') || text.includes('hinge') || text.includes('lock')) {
      subcategory = 'Door Problem';
      estimatedDuration = 45;
      confidence = 92;
      reason = 'Door alignment, hinge friction, or latch mechanism issue identified.';
    } else if (text.includes('window')) {
      subcategory = 'Window Problem';
      estimatedDuration = 40;
      confidence = 90;
      reason = 'Window sash or sliding track obstruction detected.';
    } else {
      subcategory = 'Cabinet Problem';
      estimatedDuration = 45;
      confidence = 88;
      reason = 'Wooden cabinet or shelf repair required.';
    }
  }

  // 4. WATER SUPPLY
  else if (
    text.includes('no water') || text.includes('water supply') || text.includes('low pressure') || 
    text.includes('tank') || text.includes('motor') || text.includes('overhead')
  ) {
    category = 'Water Supply';
    requiredSkill = 'Plumbing';

    if (text.includes('no water')) {
      subcategory = 'No Water';
      estimatedDuration = 60;
      confidence = 96;
      reason = 'Complete water supply disruption detected. High priority pipeline or valve issue.';
    } else if (text.includes('motor')) {
      subcategory = 'Motor Issue';
      estimatedDuration = 60;
      confidence = 93;
      reason = 'Sump motor pump failure or electrical tripping detected.';
    } else {
      subcategory = 'Low Pressure';
      estimatedDuration = 45;
      confidence = 89;
      reason = 'Main inflow pressure drop identified.';
    }
  }

  // 5. APPLIANCE
  else if (
    text.includes('geyser') || text.includes('ac') || text.includes('air conditioner') || 
    text.includes('refrigerator') || text.includes('washing machine') || text.includes('appliance')
  ) {
    category = 'Appliance';
    requiredSkill = 'Electrical';
    subcategory = text.includes('geyser') ? 'Geyser Issue' : text.includes('ac') ? 'AC Issue' : 'Appliance Repair';
    estimatedDuration = 60;
    confidence = 90;
    reason = 'Residential electrical appliance component malfunction.';
  }

  // 6. CIVIL / STRUCTURAL
  else if (
    text.includes('wall') || text.includes('crack') || text.includes('ceiling') || 
    text.includes('tile') || text.includes('paint') || text.includes('seepage')
  ) {
    category = 'Civil / Structural';
    requiredSkill = 'Civil';

    if (text.includes('ceiling')) {
      subcategory = 'Ceiling Damage';
      estimatedDuration = 90;
      confidence = 94;
      reason = 'Ceiling dampness or plaster damage detected.';
    } else if (text.includes('crack')) {
      subcategory = 'Wall Crack';
      estimatedDuration = 60;
      confidence = 91;
      reason = 'Masonry wall crack assessment required.';
    } else {
      subcategory = 'Tile Damage';
      estimatedDuration = 45;
      confidence = 88;
      reason = 'Flooring or wall tile repair needed.';
    }
  }

  // 7. CLEANING
  else if (
    text.includes('clean') || text.includes('garbage') || text.includes('trash') || 
    text.includes('waste') || text.includes('dust')
  ) {
    category = 'Cleaning';
    requiredSkill = 'Cleaning';
    subcategory = text.includes('garbage') ? 'Garbage Collection' : 'Common Area Cleaning';
    estimatedDuration = 30;
    confidence = 95;
    reason = 'Housekeeping or sanitation service requested.';
  }

  // 8. PRIORITY CALCULATION
  if (
    text.includes('continuously') || text.includes('continuous') || text.includes('emergency') || 
    text.includes('urgent') || text.includes('spark') || text.includes('burst') || 
    text.includes('flooding') || text.includes('no water') || text.includes('severe')
  ) {
    priority = 'HIGH';
  } else if (
    text.includes('low') || text.includes('minor') || text.includes('whenever possible') || 
    text.includes('squeak')
  ) {
    priority = 'LOW';
  } else {
    priority = 'MEDIUM';
  }

  return {
    category,
    subcategory,
    priority,
    requiredSkill,
    estimatedDuration,
    confidence,
    reason
  };
}

module.exports = {
  analyzeMaintenanceRequest
};
