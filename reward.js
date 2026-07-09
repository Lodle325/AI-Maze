// ============================================================
// REWARD.JS -- Define how your agent learns
//
// THIS IS THE ONLY FILE YOU NEED TO MODIFY.
//
// The function below is called after every step the agent takes.
// You decide what score to return based on what happened.
// Positive numbers = reward (good). Negative numbers = penalty (bad).
//
// The agent will learn to do whatever earns the highest total score.
// If your rules are unclear or wrong, the agent will find that out.
// ============================================================

// ============================================================
// WHAT YOU HAVE ACCESS TO
// ============================================================
//
// state (where the agent was before the move):
//   state.row          -- row position (0 = top row, 7 = bottom row)
//   state.col          -- column position (0 = left, 7 = right)
//   state.distToGoal   -- Manhattan distance to the goal (lower = closer)
//   state.steps        -- how many steps taken so far this episode
//
// action (what the agent did):
//   One of: "up", "right", "down", "left"
//
// newState (where the agent ended up after the move):
//   newState.row          -- new row position
//   newState.col          -- new column position
//   newState.distToGoal   -- new distance to goal
//   newState.reachedGoal  -- true if the agent just reached the goal
//   newState.hitWall      -- true if the agent tried to walk into a wall
//   newState.steps        -- total steps taken after this move

// ============================================================
// YOUR TASK
// ============================================================
//
// Fill in the function below. Start simple and run training.
// Then change one value, run again, and compare what happens.
//
// Questions to think about before you write any code:
//   1. What should the agent be rewarded for?
//   2. What should the agent be penalized for?
//   3. What do you want it to be doing after 500 episodes?
//
//
// BASIC STARTING POINT (try this first):
//
//   if (newState.reachedGoal) return 1;
//   if (newState.hitWall)     return -1;
//   return -0.01;
//
//
// DISTANCE SHAPING (try this after the basic version works):
// Rewards the agent for getting closer to the goal each step.
//
//   if (newState.reachedGoal) return 1;
//   if (newState.hitWall)     return -1;
//   const progress = state.distToGoal - newState.distToGoal;
//   return progress * 0.1 - 0.01;
//
//
// EXPERIMENTS TO TRY:
//   - What happens if you increase the wall penalty from -1 to -5?
//   - What happens if you remove the -0.01 step penalty entirely?
//   - What happens if you reward survival instead of reaching the goal?
//     (give +0.01 per step, no goal reward)
//   - What is the minimum reward function that still trains a working agent?
// ============================================================

function getReward(state, action, newState) {
  // YOUR CODE GOES HERE
  if (newState.reachedGoal) return 1;
  if (newState.hitWall) return -1;

  let progress = state.distToGoal - newState.distToGoal;
    return 1000
  if (progress > 0) {
    return 1000; // small reward for getting closer to the goal
  }
  return -1; // small penalty for each step to encourage shorter paths
}
