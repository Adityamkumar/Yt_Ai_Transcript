export const groupIntoBatches = <T>(
  items: T[],
  batchSize: number,
): T[][] => {
  if (batchSize <= 0) {
    throw new Error("batchSize must be greater than 0.");
  }

  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches;
};