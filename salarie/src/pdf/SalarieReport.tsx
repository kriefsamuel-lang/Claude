import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { SalarieResult, SalarieInput } from '../engine/types';
import { formatILS, formatPct } from '../engine/format';

Font.register({
  family: 'Rubik',
  fonts: [
    { src: '/fonts/Rubik-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Rubik-Bold.ttf',    fontWeight: 700 },
  ],
});

const NAVY = '#1A2138';
const GOLD  = '#C9A24B';
const LIGHT = '#F8F9FC';

const s = StyleSheet.create({
  page:    { fontFamily: 'Rubik', fontSize: 9, color: '#222', backgroundColor: '#fff', padding: 36 },
  header:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: NAVY, margin: -36, padding: 24, paddingBottom: 16 },
  mono:    { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  monoTxt: { color: NAVY, fontWeight: 700, fontSize: 14 },
  hTitle:  { color: '#fff', fontWeight: 700, fontSize: 14 },
  hSub:    { color: GOLD, fontSize: 9, marginTop: 2 },
  meta:    { marginTop: 28, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#555' },
  block:   { marginBottom: 10, borderLeftWidth: 3, borderLeftColor: NAVY, paddingLeft: 8 },
  blockGold: { marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 8 },
  blockTitle: { fontWeight: 700, fontSize: 9, color: NAVY, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5 },
  rowIndent: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1, paddingLeft: 10 },
  rowTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontWeight: 700, borderTopWidth: 0.5, borderTopColor: '#ccc', marginTop: 2 },
  label:   { color: '#444', flex: 1 },
  val:     { fontWeight: 700, textAlign: 'right' },
  valSmall: { color: '#666', textAlign: 'right' },
  synthBox: { backgroundColor: NAVY, borderRadius: 6, padding: 14, marginBottom: 10 },
  synthTitle: { color: GOLD, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', marginBottom: 8 },
  synthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  synthCell: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: 8 },
  synthCellLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 7, marginBottom: 2 },
  synthCellVal: { color: '#fff', fontWeight: 700, fontSize: 11 },
  bigVal:  { color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'center' },
  bigBox:  { backgroundColor: 'rgba(201,162,75,0.2)', borderRadius: 4, padding: 10, marginBottom: 8, alignItems: 'center' },
  bigLabel: { color: GOLD, fontSize: 7, textTransform: 'uppercase', marginBottom: 3 },
  disclaimer: { fontSize: 7, color: '#888', borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 8, marginTop: 12, lineHeight: 1.5 },
  hyp:     { backgroundColor: LIGHT, borderRadius: 4, padding: 8, marginBottom: 10, fontSize: 8 },
  hypTitle: { fontWeight: 700, marginBottom: 3, color: NAVY },
  div:     { borderTopWidth: 0.5, borderTopColor: '#eee', marginVertical: 3 },
});

interface Props {
  result: SalarieResult;
  input: SalarieInput;
  year: number;
}

function Row({ label, value, indent = false }: { label: string; value: string; indent?: boolean }) {
  return (
    <View style={indent ? s.rowIndent : s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.valSmall}>{value}</Text>
    </View>
  );
}
function RowTotal({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.rowTotal}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.val}>{value}</Text>
    </View>
  );
}

export function SalarieReport({ result, input, year }: Props) {
  const { brut, net, bl, ir, pension, keren, creditPointLines, indirect } = result;
  const date = new Date().toLocaleDateString('fr-FR');

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.mono}><Text style={s.monoTxt}>KE</Text></View>
          <View>
            <Text style={s.hTitle}>Simulateur de Charges Salariales</Text>
            <Text style={s.hSub}>Cabinet Krief Expertise · ירושלים · שכיר {year}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.meta}>
          <Text>Date : {date}</Text>
          {input.clientName && <Text>Client / Salarié : {input.clientName}</Text>}
          <Text>Année fiscale : {year}</Text>
        </View>

        {/* Hypothèses */}
        <View style={s.hyp}>
          <Text style={s.hypTitle}>Hypothèses de calcul</Text>
          <Text>Salaire {input.mode === 'brut' ? 'brut' : 'net'} de référence : {formatILS(input.salaryInput)} · Taux emploi : {Math.round(input.employmentRate * 100)} %</Text>
          <Text>Pension : tagmoulim employé {(input.pension.employeeTagmoulimRate * 100).toFixed(1)} % · employeur {(input.pension.employerTagmoulimRate * 100).toFixed(1)} % · pitsouim {(input.pension.employerPitsouimRate * 100).toFixed(1)} %</Text>
          {input.keren.enabled && (
            <Text>קרן השתלמות : employé {(input.keren.employeeRate * 100).toFixed(1)} % · employeur {(input.keren.employerRate * 100).toFixed(1)} %</Text>
          )}
          <Text>נקודות זיכוי : {creditPointLines.map(l => `${l.label} (${l.points} pts)`).join(' · ')}</Text>
          {(indirect.totalMonthly > 0) && (
            <Text>Provisions indirectes incluses · ancienneté {input.indirectCosts.seniority} ans</Text>
          )}
        </View>

        {/* Bloc 1 — Employé */}
        <View style={s.block}>
          <Text style={s.blockTitle}>Côté employé — du brut au net</Text>
          <Row label="Salaire brut" value={formatILS(brut)} />
          <View style={s.div} />
          <Row label="ביטוח לאומי (BL)" value={`− ${formatILS(bl.employeeLeumi)}`} indent />
          <Row label="ביטוח בריאות" value={`− ${formatILS(bl.employeeHealth)}`} indent />
          <Row label={`Pension employé (${(input.pension.employeeTagmoulimRate*100).toFixed(1)} %)`} value={`− ${formatILS(pension.employeeContrib)}`} indent />
          {keren.employeeContrib > 0 && (
            <Row label={`קרן השתלמות employé (${(input.keren.employeeRate*100).toFixed(1)} %)`} value={`− ${formatILS(keren.employeeContrib)}`} indent />
          )}
          <View style={s.div} />
          <Row label={`IR — revenu imposable ${formatILS(ir.taxableIncome)}`} value="" />
          {ir.bracketLines.map((line, i) => (
            <Row key={i} label={`  Tranche ${(line.rate*100).toFixed(0)} % × ${formatILS(line.base)}`} value={formatILS(line.tax)} indent />
          ))}
          {ir.surtax > 0 && <Row label="  מס יסף (3 %)" value={formatILS(ir.surtax)} indent />}
          <Row label={`  − Pts zikouy (${ir.creditPointsTotal.toFixed(2)} × 242 ₪)`} value={`− ${formatILS(ir.creditPointsValue)}`} indent />
          {ir.pensionCredit > 0 && <Row label="  − זיכוי pension §45א" value={`− ${formatILS(ir.pensionCredit)}`} indent />}
          <Row label="Impôt net" value={`− ${formatILS(ir.netTax)}`} />
          <RowTotal label="NET À PAYER" value={formatILS(net)} />
        </View>

        {/* Bloc 2 — Employeur direct */}
        <View style={s.block}>
          <Text style={s.blockTitle}>Charges employeur directes</Text>
          <Row label="Salaire brut" value={formatILS(brut)} />
          <Row label="BL employeur" value={`+ ${formatILS(bl.employerBL)}`} indent />
          <Row label={`Tagmoulim employeur (${(input.pension.employerTagmoulimRate*100).toFixed(1)} %)`} value={`+ ${formatILS(pension.employerTagmoulim)}`} indent />
          <Row label={`Pitsouim (${(input.pension.employerPitsouimRate*100).toFixed(1)} %)`} value={`+ ${formatILS(pension.employerPitsouim)}`} indent />
          {keren.employerContrib > 0 && (
            <Row label={`קרן השתלמות employeur (${(input.keren.employerRate*100).toFixed(1)} %)`} value={`+ ${formatILS(keren.employerContrib)}`} indent />
          )}
          <RowTotal label="Coût direct employeur" value={formatILS(result.totalEmployerDirectCosts)} />
        </View>

        {/* Bloc 3 — Indirects */}
        {indirect.totalMonthly > 0 && (
          <View style={s.blockGold}>
            <Text style={s.blockTitle}>Charges indirectes — provisions estimatives</Text>
            {indirect.havaraMonthly > 0 && <Row label="דמי הבראה (mensuel)" value={`+ ${formatILS(indirect.havaraMonthly)}`} />}
            {indirect.holidaysMonthly > 0 && <Row label="Congés annuels (provision)" value={`+ ${formatILS(indirect.holidaysMonthly)}`} />}
            {indirect.publicHolidaysMonthly > 0 && <Row label="Jours fériés — חגים" value={`+ ${formatILS(indirect.publicHolidaysMonthly)}`} />}
            <RowTotal label="Total provisions" value={formatILS(indirect.totalMonthly)} />
          </View>
        )}

        {/* Synthèse */}
        <View style={s.synthBox}>
          <Text style={s.synthTitle}>Synthèse — עלות מעביד מלאה</Text>
          <View style={s.synthGrid}>
            <View style={s.synthCell}>
              <Text style={s.synthCellLabel}>Salaire brut</Text>
              <Text style={s.synthCellVal}>{formatILS(brut)}</Text>
            </View>
            <View style={s.synthCell}>
              <Text style={s.synthCellLabel}>Net perçu</Text>
              <Text style={s.synthCellVal}>{formatILS(net)}</Text>
            </View>
            <View style={s.synthCell}>
              <Text style={s.synthCellLabel}>Charges directes employeur</Text>
              <Text style={s.synthCellVal}>{formatILS(result.totalEmployerDirectCosts)}</Text>
            </View>
            <View style={s.synthCell}>
              <Text style={s.synthCellLabel}>Provisions indirectes</Text>
              <Text style={s.synthCellVal}>{formatILS(result.totalEmployerIndirect)}</Text>
            </View>
          </View>
          <View style={s.bigBox}>
            <Text style={s.bigLabel}>Coût total employeur (עלות מעביד מלאה)</Text>
            <Text style={s.bigVal}>{formatILS(result.totalEmployerCost)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>
              Ratio Net / Coût total : <Text style={{ color: GOLD, fontWeight: 700 }}>{formatPct(result.netToCostRatio)}</Text>
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>
              Charges salarié / Brut : <Text style={{ color: GOLD, fontWeight: 700 }}>{formatPct(result.totalEmployeeDeductions / brut)}</Text>
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          Simulation indicative établie sur la base des paramètres {year} — ne constitue pas un bulletin de paie (תלוש שכר).
          Les charges indirectes sont des provisions estimatives. Plusieurs taux sont marqués "À VALIDER" et doivent être
          contrôlés contre אגרת מעסיקים 651, חוזר BTL {year} (btl.gov.il) et לוח עזר רשות המסים avant usage en production.{'\n'}
          Krief Expertise — ירושלים — {date}
        </Text>
      </Page>
    </Document>
  );
}
