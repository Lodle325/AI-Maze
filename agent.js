// ============================================================
// AGENT.JS -- Q-learning agent and training loop
//
// READ ONLY -- do not modify this file.
// All your work goes in reward.js.
// ============================================================

// ============================================================
// Q-TABLE
// A table of values that tells the agent how good each action
// is from each state. Rows = states, columns = actions.
// All values start at 0 (the agent knows nothing).
// ============================================================

const NUM_STATES = ROWS * COLS;
const NUM_ACTIONS = 4;

let qTable = Array.from({ length: NUM_STATES }, () =>
  new Array(NUM_ACTIONS).fill(0),
);

// ============================================================
// TRAINING PARAMETERS
// These control how the agent learns.
// ============================================================

const ALPHA = 0.1; // learning rate: how much to update on each step (0 to 1)
const GAMMA = 0.9; // discount factor: how much future rewards matter (0 to 1)
const EPSILON_START = 1.0; // starting exploration rate (1.0 = fully random at first)
const EPSILON_MIN = 0; // minimum exploration rate (always explore a little)
const EPSILON_DECAY = 0; // how fast exploration decreases each episode

const MAX_STEPS = 200; // maximum steps before an episode is cut short

// ============================================================
// AGENT STATE
// Tracks progress across all episodes.
// ============================================================

let epsilon = EPSILON_START;
let episode = 0;
let goalsReached = 0;
let episodeRewards = [];
let recentAvg = 0;

// ============================================================
// ACTION SELECTION
// With probability epsilon, choose a random action (explore).
// Otherwise, choose the action with the highest Q-value (exploit).
// ============================================================

function chooseAction(stateIndex) {
  if (Math.random() < epsilon) {
    // Explore: pick a random action
    return Math.floor(Math.random() * NUM_ACTIONS);
  }
  // Exploit: pick the action with the highest Q-value
  const values = qTable[stateIndex];
  return values.indexOf(Math.max(...values));
}

// ============================================================
// Q-TABLE UPDATE
// After taking an action and receiving a reward, update the
// Q-value for that (state, action) pair.
//
// The update rule is:
//   Q(s, a) = Q(s, a) + alpha * (reward + gamma * max(Q(s')) - Q(s, a))
//
// This nudges the Q-value toward the reward plus the best
// possible future value from the new state.
// ============================================================

function updateQTable(stateIndex, actionIndex, reward, newStateIndex) {
  const currentQ = qTable[stateIndex][actionIndex];
  const bestFuture = Math.max(...qTable[newStateIndex]);
  qTable[stateIndex][actionIndex] =
    currentQ + ALPHA * (reward + GAMMA * bestFuture - currentQ);
}

// ============================================================
// RUN ONE EPISODE
// Runs the agent from START to GOAL (or until max steps).
// Returns the final state index after the episode ends.
// ============================================================

function runEpisode() {
  let stateIndex = stateToIndex(START.row, START.col);
  let totalReward = 0;

  for (let step = 0; step < MAX_STEPS; step++) {
    const actionIndex = chooseAction(stateIndex);
    const result = takeAction(stateIndex, actionIndex, step);
    const reward = getReward(
      result.prevStateObj,
      ACTIONS[actionIndex],
      result.newStateObj,
    );

    updateQTable(stateIndex, actionIndex, reward, result.stateIndex);

    totalReward += reward;
    stateIndex = result.stateIndex;

    if (result.newStateObj.reachedGoal) {
      goalsReached++;
      break;
    }
  }

  // Track reward history
  episode++;
  episodeRewards.push(totalReward);
  const last50 = episodeRewards.slice(-50);
  recentAvg = last50.reduce((a, b) => a + b, 0) / last50.length;

  // Decay epsilon: agent explores less over time as it learns
  if (epsilon > EPSILON_MIN) {
    epsilon *= EPSILON_DECAY;
  }

  return stateIndex;
}

// ============================================================
// RESET
// Clears the Q-table and all stats so training starts fresh.
// ============================================================

function resetAgent() {
  qTable = Array.from({ length: NUM_STATES }, () =>
    new Array(NUM_ACTIONS).fill(0),
  );
  epsilon = EPSILON_START;
  episode = 0;
  goalsReached = 0;
  episodeRewards = [];
  recentAvg = 0;
}
