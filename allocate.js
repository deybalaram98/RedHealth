const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "./inputsame.json");
const outputPath = path.join(__dirname, "./outputsame.json");

const costMetrics = ["lateDeliveries"];
const minDiscount = 1; // Set minimum discount to prevent 0 assignment

function normalize(data, keys) {
  return data.map((agent) => {
    const norm = { id: agent.id };
    for (let key of keys) {
      const denom = Math.sqrt(data.reduce((sum, a) => sum + (a[key] ** 2), 0));
      const value = agent[key];
      norm[key] = denom === 0 ? 0 :
        (costMetrics.includes(key) ? (1 - (value / Math.max(...data.map(a => a[key])))) : (value / denom));
    }
    return norm;
  });
}

function entropyWeights(normalized, keys) {
  const n = normalized.length;
  const k = 1 / Math.log(n);
  const entropy = {};
  for (let key of keys) {
    let eSum = 0;
    for (let agent of normalized) {
      const p = agent[key];
      if (p > 0) eSum += p * Math.log(p);
    }
    entropy[key] = -k * eSum;
  }

  const entropyDiff = Object.fromEntries(
    Object.entries(entropy).map(([k, e]) => [k, 1 - e])
  );

  const total = Object.values(entropyDiff).reduce((acc, e) => acc + e, 0);
  const weights = {};

  if (total === 0) {
    const equalWeight = 1 / keys.length;
    for (let key of keys) {
      weights[key] = equalWeight;
    }
  } else {
    for (let key of keys) {
      weights[key] = entropyDiff[key] / total;
    }
  }
  return weights;
}

function applyWeights(normalized, weights, metrics) {
  return normalized.map((agent) => {
    const weighted = { id: agent.id };
    for (let key of metrics) {
      weighted[key] = agent[key] * weights[key];
    }
    return weighted;
  });
}

function getIdealSolutions(weighted, keys) {
  const ideal = {}, anti = {};
  for (let key of keys) {
    ideal[key] = Math.max(...weighted.map((a) => a[key]));
    anti[key] = Math.min(...weighted.map((a) => a[key]));
  }
  return { ideal, anti };
}

function calculateCloseness(weighted, ideal, anti, metrics) {
  return weighted.map((agent) => {
    let dPlus = 0, dMinus = 0;
    for (let key of metrics) {
      dPlus += (agent[key] - ideal[key]) ** 2;
      dMinus += (agent[key] - anti[key]) ** 2;
    }
    dPlus = Math.sqrt(dPlus);
    dMinus = Math.sqrt(dMinus);

    let closeness = 0;
    if (dPlus + dMinus === 0) {
      closeness = 0.5;
    } else {
      closeness = dMinus / (dPlus + dMinus);
    }

    return {
      id: agent.id,
      closeness: closeness
    };
  });
}

function allocateDiscounts(siteKitty, closeness) {
  const total = closeness.reduce((sum, a) => sum + a.closeness, 0);
  let raw = closeness.map((a) => ({
    ...a,
    rawDiscount: (a.closeness / total) * siteKitty
  }));

  raw = raw.map((a) => ({
    id: a.id,
    closeness: a.closeness,
    assignedDiscount: Math.max(Math.round(a.rawDiscount), minDiscount)
  }));

  let assignedTotal = raw.reduce((sum, a) => sum + a.assignedDiscount, 0);
  const remainder = siteKitty - assignedTotal;
  raw[raw.length - 1].assignedDiscount += remainder;

  return raw.map((a) => ({
    id: a.id,
    assignedDiscount: a.assignedDiscount,
    justification: justify(a.closeness)
  }));
}

function justify(score) {
  if (score >= 0.8) return "Consistently high performance and long-term contribution";
  if (score >= 0.5) return "Moderate performance with potential for growth";
  return "Needs support and improvement";
}

console.log("🚀 Processing inputnormal.json...");

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const { siteKitty, salesAgents } = input;
const metrics = Object.keys(salesAgents[0]).filter((key) => key !== "id");

const normalized = normalize(salesAgents, metrics);
const weights = entropyWeights(normalized, metrics);
const weighted = applyWeights(normalized, weights, metrics);
const { ideal, anti } = getIdealSolutions(weighted, metrics);
const closeness = calculateCloseness(weighted, ideal, anti, metrics);
const allocations = allocateDiscounts(siteKitty, closeness);

fs.writeFileSync(outputPath, JSON.stringify({ allocations }, null, 2));
console.log("✅ Discounts calculated and written to outputnormal.json");
