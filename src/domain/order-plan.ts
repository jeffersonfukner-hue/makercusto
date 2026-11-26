export interface OrderPlanInput {
  quantity?: number;
  partialPlateCost?: number;
}

export function calculateOrderPlan(
  piecesPerPlate: number,
  plateCost: number,
  salePrice: number,
  quantity: number,
  partialPlateCost?: number
) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error('Informe uma quantidade inteira de peças maior que zero.');
  }
  const fullPlates = Math.floor(quantity / piecesPerPlate);
  const partialPieces = quantity % piecesPerPlate;
  if (partialPieces && partialPlateCost !== undefined && (!Number.isFinite(partialPlateCost) || partialPlateCost < 0)) {
    throw new Error('Informe um custo válido para a última mesa.');
  }
  const estimatedPartialCost = plateCost * (partialPieces / piecesPerPlate);
  const lastPlateCost = partialPieces ? partialPlateCost ?? estimatedPartialCost : 0;
  const totalCost = fullPlates * plateCost + lastPlateCost;
  const revenue = salePrice * quantity;
  const grossProfit = revenue - totalCost;
  return {
    fullPlates,
    partialPieces,
    totalPlates: fullPlates + Number(partialPieces > 0),
    lastPlateCost,
    totalCost,
    revenue,
    grossProfit,
    marginPercent: revenue ? grossProfit / revenue * 100 : 0
  };
}
