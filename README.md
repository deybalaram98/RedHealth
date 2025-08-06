#  Discount Allocation Engine (Entropy + TOPSIS)

This project is a smart discount distribution engine for sales agents based on their multi-dimensional performance using:

-  Entropy-based automatic weight calculation (no manual tuning)
-  TOPSIS method for multi-objective ranking
-  Support for dynamic number of agents and attributes

---

##  Folder Structure

```
📁 RedHealth/
├── allocate.js          # Main script
├── input.json           # Input data with agent metrics
├── output.json          # Auto-generated result file
```

---

##  input.json Format

Must contain:

- siteKitty: total amount to be distributed
- salesAgents: array of agents with metrics

Example:

```json
{
  "siteKitty": 10000,
  "salesAgents": [
    {
      "id": "A1",
      "performanceScore": 90,
      "seniorityMonths": 18,
      "targetAchievedPercent": 85,
      "activeClients": 12,
      "trainingHours": 45,
      "customerFeedbackScore": 92,
      "lateDeliveries": 1,
      "teamContributionScore": 88
    },
    {
      "id": "A2",
      "performanceScore": 70,
      "seniorityMonths": 6,
      "targetAchievedPercent": 60,
      "activeClients": 8,
      "trainingHours": 20,
      "customerFeedbackScore": 75,
      "lateDeliveries": 3,
      "teamContributionScore": 65
    }
  ]
}
```
 Note:
- You can add any number of agents.
- Metrics must be the same across agents.
- "lateDeliveries" is automatically treated as a cost metric (lower is better).



##  What the Engine Does

1. Normalizes all agent metrics
2. Calculates entropy weights for each metric
3. Ranks agents using TOPSIS closeness score
4. Allocates total siteKitty proportionally
5. Rounds, adjusts for leftover, and adds justification



##  How to Run

 Prerequisites: Node.js installed

In terminal (inside the project folder):

```bash
node allocate.js
```

 Output:
- Prints allocation table in terminal
- Writes result to output.json

---

##  output.json Format

```json
{
  "allocations": [
    {
      "id": "A1",
      "assignedDiscount": 2244,
      "justification": "Strong performance across key metrics"
    },
    {
      "id": "A2",
      "assignedDiscount": 201,
      "justification": "Needs support and improvement"
    }
  ]
}




##  Advanced Notes

-  Dynamic agents/metrics supported
-  Entropy ensures data-driven fairness
-  Justifications help explain final result



##  Future Improvements

- Add CLI arguments for input/output paths
- Export CSV output
- Integrate frontend UI or Express API



2025 — Developed as part of Red Health Assignment
