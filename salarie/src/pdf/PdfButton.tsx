import { useState } from 'react';
import type { SalarieResult, SalarieInput } from '../engine/types';

interface Props {
  result: SalarieResult;
  input: SalarieInput;
  year: number;
}

export function PdfButton({ result, input, year }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { SalarieReport } = await import('./SalarieReport');
      const blob = await pdf(<SalarieReport result={result} input={input} year={year} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const clientPart = input.clientName ? `_${input.clientName.replace(/\s+/g, '-')}` : '';
      a.href = url;
      a.download = `KE_Charges_Salariales_${year}${clientPart}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-secondary flex items-center gap-2 text-sm"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span> Génération PDF…
        </>
      ) : (
        <>
          <span>↓</span> Exporter PDF client
        </>
      )}
    </button>
  );
}
