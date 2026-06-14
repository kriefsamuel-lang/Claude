/**
 * Solveur Net → Brut par bisection (dichotomie).
 *
 * f(brut) = net calculé est monotone strictement croissante en brut.
 * La bisection converge toujours, en ≤ 50 itérations sur la plage [net, net×3].
 * Tolérance : 1 ₪.
 */
export interface SolverResult {
  brut: number;
  converged: boolean;
  iterations: number;
}

export function grossFromNet(
  targetNet: number,
  computeNet: (brut: number) => number,
  tolerance = 1,
  maxIter = 50
): SolverResult {
  let low = targetNet;           // net < brut toujours
  let high = targetNet * 3;     // borne sup généreuse (couvre taux marginal ~65%)

  // Vérification que la borne sup est suffisante
  while (computeNet(high) < targetNet) {
    high *= 1.5;
  }

  let mid = targetNet;
  for (let i = 0; i < maxIter; i++) {
    mid = (low + high) / 2;
    const computed = computeNet(mid);
    if (Math.abs(computed - targetNet) < tolerance) {
      return { brut: mid, converged: true, iterations: i + 1 };
    }
    if (computed < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return { brut: mid, converged: false, iterations: maxIter };
}
