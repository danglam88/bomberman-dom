// This code creates a state object that holds the state of the application. 
// It also provides functions for updating the state and getting the current state.

let state = {};
 
export const setState = (newState) => {
   state = { ...state, ...newState };
};

export const getState = () => {
   return state;
};