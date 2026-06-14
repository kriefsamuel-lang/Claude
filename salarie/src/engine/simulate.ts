import type { SalariedYearParams } from './params/types';
import type { SalarieInput, SalarieResult } from './types';
import { computeBL } from './bituachLeumi';
import { computeIR } from './incomeTax';
import { computePension } from './pension';
import { computeKeren, emptyKeren } from './kerenHishtalmout';
import { computeIndirectCosts } from './indirectCosts';
import { computeCreditPoints, totalCreditPoints } from './creditPoints';
import { grossFromNet } from './solver';
import { round2 } from './format';

function computeNetFromBrut(brut: number, input: SalarieInput, p: SalariedYearParams): number {
  const bl = computeBL(brut, p);
  const pension = computePension(
    brut,
    input.pension.employeeTagmoulimRate,
    input.pension.employerTagmoulimRate,
    input.pension.employerPitsouimRate,
    p
  );
  const keren = input.keren.enabled
    ? computeKeren(brut, input.keren.employeeRate, input.keren.employerRate, p)
    : emptyKeren();
  const cpLines = computeCreditPoints(input.personal, input.fiscalYear, p);
  const totalPts = totalCreditPoints(cpLines);
  const ir = computeIR(brut, pension.employeeContrib, pension.employeeZikuy, totalPts, p);
  return round2(brut - bl.employeeTotal - ir.netTax - pension.employeeContrib - keren.employeeContrib);
}

export function simulate(input: SalarieInput, p: SalariedYearParams): SalarieResult {
  let brut: number;
  let solverConverged = true;
  let solverIterations = 0;

  if (input.mode === 'brut') {
    brut = input.salaryInput;
  } else {
    const res = grossFromNet(input.salaryInput, (b) => computeNetFromBrut(b, input, p));
    brut = round2(res.brut);
    solverConverged = res.converged;
    solverIterations = res.iterations;
  }

  const bl = computeBL(brut, p);
  const pension = computePension(
    brut,
    input.pension.employeeTagmoulimRate,
    input.pension.employerTagmoulimRate,
    input.pension.employerPitsouimRate,
    p
  );
  const keren = input.keren.enabled
    ? computeKeren(brut, input.keren.employeeRate, input.keren.employerRate, p)
    : emptyKeren();
  const creditPointLines = computeCreditPoints(input.personal, input.fiscalYear, p);
  const totalPts = totalCreditPoints(creditPointLines);
  const ir = computeIR(brut, pension.employeeContrib, pension.employeeZikuy, totalPts, p);
  const indirect = computeIndirectCosts(brut, input.employmentRate, input.indirectCosts, p);

  const net = round2(brut - bl.employeeTotal - ir.netTax - pension.employeeContrib - keren.employeeContrib);
  const totalEmployeeDeductions = round2(bl.employeeTotal + ir.netTax + pension.employeeContrib + keren.employeeContrib);
  const totalEmployerDirectCosts = round2(brut + bl.employerBL + pension.employerTotal + keren.employerContrib);
  const totalEmployerIndirect = indirect.totalMonthly;
  const totalEmployerCost = round2(totalEmployerDirectCosts + totalEmployerIndirect);

  return {
    brut,
    net,
    bl,
    ir,
    pension,
    keren,
    creditPointLines,
    indirect,
    totalEmployeeDeductions,
    totalEmployerDirectCosts,
    totalEmployerIndirect,
    totalEmployerCost,
    netToCostRatio: totalEmployerCost > 0 ? round2(net / totalEmployerCost) : 0,
    solverConverged,
    solverIterations,
  };
}
