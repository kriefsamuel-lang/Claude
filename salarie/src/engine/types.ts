export type InputMode = 'brut' | 'net';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface ChildEntry {
  birthYear: number;
  claiming: boolean;
}

export interface PersonalInfo {
  birthYear: number;
  gender: 'M' | 'F';
  maritalStatus: MaritalStatus;
  spouseNoIncome: boolean;
  children: ChildEntry[];
  paysMezonot: boolean;
  aliyahDate: string | null; // ISO YYYY-MM-DD
  hasAcademicDegree: boolean;
  isDischargedSoldier: boolean;
}

export interface PensionParams {
  productType: 'keren_pensia' | 'bituach_menahalim';
  employeeTagmoulimRate: number;
  employerTagmoulimRate: number;
  employerPitsouimRate: number;
}

export interface KerenParams {
  enabled: boolean;
  employeeRate: number;
  employerRate: number;
}

export interface IndirectCostsParams {
  includeHavara: boolean;
  includeHolidays: boolean;
  includePublicHolidays: boolean;
  seniority: number;
}

export interface SalarieInput {
  mode: InputMode;
  salaryInput: number;
  fiscalYear: number;
  employmentRate: number;
  personal: PersonalInfo;
  pension: PensionParams;
  keren: KerenParams;
  indirectCosts: IndirectCostsParams;
  clientName: string;
}

// --- Result types ---

export interface BLResult {
  employeeLeumi: number;
  employeeHealth: number;
  employeeTotal: number;
  employerBL: number;
}

export interface IRBracketLine {
  rate: number;
  base: number;
  tax: number;
}

export interface IRResult {
  taxableIncome: number;
  bracketLines: IRBracketLine[];
  bracketTax: number;
  surtax: number;
  creditPointsTotal: number;
  creditPointsValue: number;
  pensionCredit: number;
  grossTax: number;
  netTax: number;
}

export interface PensionResult {
  employeeContrib: number;
  employerTagmoulim: number;
  employerPitsouim: number;
  employerTotal: number;
  employeeZikuy: number;
}

export interface KerenResult {
  employeeContrib: number;
  employerContrib: number;
  employerTaxableExcess: number;
}

export interface IndirectCostsResult {
  havaraMonthly: number;
  holidaysMonthly: number;
  publicHolidaysMonthly: number;
  totalMonthly: number;
}

export interface CreditPointLine {
  label: string;
  points: number;
}

export interface SalarieResult {
  brut: number;
  net: number;
  bl: BLResult;
  ir: IRResult;
  pension: PensionResult;
  keren: KerenResult;
  creditPointLines: CreditPointLine[];
  indirect: IndirectCostsResult;
  totalEmployeeDeductions: number;
  totalEmployerDirectCosts: number;
  totalEmployerIndirect: number;
  totalEmployerCost: number;
  netToCostRatio: number;
  solverConverged: boolean;
  solverIterations: number;
}
