import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { SalarieResult, SalarieInput } from '../engine/types';
import { formatCurrency, formatPercent } from '../engine/format';

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
  page:       { fontFamily: 'Rubik', fontSize: 9, color: '#222', backgroundColor: '#fff', padding: 36 },
  header:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: NAVY, margin: -36, padding: 24, paddingBottom: 16 },
  mono:       { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  monoTxt:    { color: NAVY, fontWeight: 700, fontSize: 14 },
  hTitle:     { color: '#fff', fontWeight: 700, fontSize: 14 },
  hSub:       { color: GOLD, fontSize: 9, marginTop: 2 },
  meta:       { marginTop: 28, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#555' },
  block:      { marginBottom: 10, borderLeftWidth: 3, borderLeftColor: NAVY, paddingLeft: 8 },
  blockGold:  { marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 8 },
  blockTitle: { fontWeight: 700, fontSize: 9, color: NAVY, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5 },
  rowIndent:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1, paddingLeft: 10 },
  rowTotal:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontWeight: 700, borderTopWidth: 0.5, borderTopColor: '#ccc', marginTop: 2 },
  label:      { color: '#444', flex: 1 },
  val:        { fontWeight: 700, textAlign: 'right' },
  valSmall:   { color: '#666', textAlign: 'right' },
  synthBox:   { backgroundColor: NAVY, borderRadius: 6, padding: 14, marginBottom: 10 },
  synthTitle: { color: GOLD, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', marginBottom: 8 },
  synthGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  synthCell:  { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: 8 },
  synthLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 7, marginBottom: 2 },
  synthVal:   { color: '#fff', fontWeight: 700, fontSize: 11 },
  bigBox:     { backgroundColor: 'rgba(201,162,75,0.2)', borderRadius: 4, padding: 10, marginBottom: 8, alignItems: 'center' },
  bigLabel:   { color: GOLD, fontSize: 7, textTransform: 'uppercase', marginBottom: 3 },
  bigVal:     { color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'center' },
  hyp:        { backgroundColor: LIGHT, borderRadius: 4, padding: 8, marginBottom: 10, fontSize: 8 },
  hypTitle:   { fontWeight: 700, marginBottom: 3, color: NAVY },
  div:        { borderTopWidth: 0.5, borderTopColor: '#eee', marginVertical: 3 },
  disclaimer: { fontSize: 7, color: '#888', borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 8, marginTop: 12, lineHeight: 1.5 },
});

interface Props { result: SalarieResult; input: SalarieInput; year: number; }

function Row({ label, value, indent = false }: { label: string; value: string; indent?: boolean }) {
  return (
    <View style={indent ? s.rowIndent : s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.valSmall}>{value}</Text>
    </View>
  );
}
function RowT({ label, value }: { label: string; value: string }) {
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
        <View style={s.header}>
          <View style={s.mono}><Text style={s.monoTxt}>KE</Text></View>
          <View>
            <Text style={s.hTitle}>Simulateur de Charges Salariales</Text>
            <Text style={s.hSub}>Cabinet Krief Expertise · ירושלים · שכיר {year}</Text>
          </View>
        </View>

        <View style={s.meta}>
          <Text>Date : {date}</Text>
          {input.clientName ? <Text>Client / Salarié : {input.clientName}</Text> : null}
          <Text>Année fiscale : {year}</Text>
        </View>

        <View style={s.hyp}>
          <Text style={s.hypTitle}>Hypothèses de calcul</Text>
          <Text>Salaire {input.mode === 'brut' ? 'brut' : 'net'} : {formatCurrency(input.salaryInput)} · Taux emploi : {Math.round(input.employmentRate * 100)} %</Text>
          <Text>Pension : tagmoulim employé {formatPercent(input.pension.employeeTagmoulimRate)} · employeur {formatPercent(input.pension.employerTagmoulimRate)} · pitsouim {formatPercent(input.pension.employerPitsouimRate)}</Text>
          {input.keren.enabled ? (
            <Text>קרן השתלמות : employé {formatPercent(input.keren.employeeRate)} · employeur {formatPercent(input.keren.employerRate)}</Text>
          ) : null}
          <Text>נקודות זיכוי : {creditPointLines.map(l => `${l.label} (${l.points} pts)`).join(' · ')}</Text>
          {indirect.totalMonthly > 0 ? <Text>Provisions indirectes incluses · ancienneté {input.indirectCosts.seniority} ans</Text> : null}
        </View>

        <View style={s.block}>
          <Text style={s.blockTitle}>Côté employé — du brut au net</Text>
          <Row label="Salaire brut" value={formatCurrency(brut)} />
          <View style={s.div} />
          <Row label="ביטוח לאומי" value={`− ${formatCurrency(bl.employeeLeumi)}`} indent />
          <Row label="ביטוח בריאות" value={`− ${formatCurrency(bl.employeeHealth)}`} indent />
          <Row label={`Pension employé (${formatPercent(input.pension.employeeTagmoulimRate)})`} value={`− ${formatCurrency(pension.employeeContrib)}`} indent />
          {keren.employeeContrib > 0 ? <Row label={`קרן השתלמות employé (${formatPercent(input.keren.employeeRate)})`} value={`− ${formatCurrency(keren.employeeContrib)}`} indent /> : null}
          <View style={s.div} />
          <Row label={`IR — imposable ${formatCurrency(ir.taxableIncome)} — tranches progressives`} value={formatCurrency(ir.bracketTax)} />
          {ir.surtax > 0 ? <Row label="מס יסף (3 %)" value={formatCurrency(ir.surtax)} indent /> : null}
          <Row label={`− נקודות זיכוי (${ir.creditPoints.toFixed(2)} pts × 242 ₪)`} value={`− ${formatCurrency(ir.creditPointsValue)}`} indent />
          {ir.pensionCredit > 0 ? <Row label="− זיכוי pension §45א" value={`− ${formatCurrency(ir.pensionCredit)}`} indent /> : null}
          <Row label="Impôt net" value={`− ${formatCurrency(ir.netTax)}`} />
          <RowT label="NET À PAYER" value={formatCurrency(net)} />
        </View>

        <View style={s.block}>
          <Text style={s.blockTitle}>Charges employeur directes</Text>
          <Row label="Salaire brut" value={formatCurrency(brut)} />
          <Row label="BL employeur" value={`+ ${formatCurrency(bl.employerBL)}`} indent />
          <Row label={`Tagmoulim employeur (${formatPercent(input.pension.employerTagmoulimRate)})`} value={`+ ${formatCurrency(pension.employerTagmoulim)}`} indent />
          <Row label={`Pitsouim (${formatPercent(input.pension.employerPitsouimRate)})`} value={`+ ${formatCurrency(pension.employerPitsouim)}`} indent />
          {keren.employerContrib > 0 ? <Row label={`קרן השתלמות employeur (${formatPercent(input.keren.employerRate)})`} value={`+ ${formatCurrency(keren.employerContrib)}`} indent /> : null}
          <RowT label="Coût direct employeur" value={formatCurrency(result.totalEmployerDirectCosts)} />
        </View>

        {indirect.totalMonthly > 0 ? (
          <View style={s.blockGold}>
            <Text style={s.blockTitle}>Charges indirectes — provisions estimatives</Text>
            {indirect.havaraMonthly > 0 ? <Row label="דמי הבראה (mensuel)" value={`+ ${formatCurrency(indirect.havaraMonthly)}`} /> : null}
            {indirect.holidaysMonthly > 0 ? <Row label="Congés annuels" value={`+ ${formatCurrency(indirect.holidaysMonthly)}`} /> : null}
            {indirect.publicHolidaysMonthly > 0 ? <Row label="Jours fériés — חגים" value={`+ ${formatCurrency(indirect.publicHolidaysMonthly)}`} /> : null}
            <RowT label="Total provisions" value={formatCurrency(indirect.totalMonthly)} />
          </View>
        ) : null}

        <View style={s.synthBox}>
          <Text style={s.synthTitle}>Synthèse — עלות מעביד מלאה</Text>
          <View style={s.synthGrid}>
            {[
              { l: 'Salaire brut',                 v: formatCurrency(brut) },
              { l: 'Net perçu',                    v: formatCurrency(net) },
              { l: 'Charges directes employeur',   v: formatCurrency(result.totalEmployerDirectCosts) },
              { l: 'Provisions indirectes',        v: formatCurrency(result.totalEmployerIndirect) },
            ].map(({ l, v }) => (
              <View key={l} style={s.synthCell}>
                <Text style={s.synthLabel}>{l}</Text>
                <Text style={s.synthVal}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={s.bigBox}>
            <Text style={s.bigLabel}>Coût total employeur (עלות מעביד מלאה)</Text>
            <Text style={s.bigVal}>{formatCurrency(result.totalEmployerCost)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>
              Ratio Net / Coût : <Text style={{ color: GOLD, fontWeight: 700 }}>{formatPercent(result.netToCostRatio)}</Text>
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>
              Charges salarié / Brut : <Text style={{ color: GOLD, fontWeight: 700 }}>{formatPercent(result.totalEmployeeDeductions / brut)}</Text>
            </Text>
          </View>
        </View>

        <Text style={s.disclaimer}>
          Simulation indicative établie sur la base des paramètres {year} — ne constitue pas un bulletin de paie (תלוש שכר).
          Les charges indirectes sont des provisions estimatives. Plusieurs taux marqués "À VALIDER" — contrôler contre
          אגרת מעסיקים 651, חוזר BTL {year} et לוח עזר רשות המסים avant usage en production.{'\n'}
          Krief Expertise — ירושלים — {date}
        </Text>
      </Page>
    </Document>
  );
}
