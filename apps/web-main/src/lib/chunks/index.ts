// Chunk exports for dynamic loading
// This directory is used for code splitting and dynamic imports

export const exampleChunk = {
  name: 'example',
  load: () => import('./example')
};

// Add more chunks as needed
export default {};