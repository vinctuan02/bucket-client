// Jest setup file
import '@testing-library/jest-dom';

// Setup fast-check for property-based testing
import fc from 'fast-check';

// Configure fast-check globally
fc.configureGlobal({
	numRuns: 100, // Run each property test 100 times as specified in the design
});
