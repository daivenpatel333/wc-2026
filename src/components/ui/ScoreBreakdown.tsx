import type { PlayerScore } from "#/domain/types";
import { formatPoints, formatSignedPoints } from "#/lib/format";

/**
 * Per-statistic score breakdown table. Zero-value rows are hidden so the
 * story of the score stays readable; the adjustment and total rows always
 * show.
 */
export default function ScoreBreakdown({ score }: { score: PlayerScore }) {
  const activeEntries = score.entries.filter((entry) => entry.statValue !== 0);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th className="kicker pb-1.5 font-normal">Statistic</th>
          <th className="kicker pb-1.5 text-right font-normal">Qty</th>
          <th className="kicker pb-1.5 text-right font-normal">Per</th>
          <th className="kicker pb-1.5 text-right font-normal">Pts</th>
        </tr>
      </thead>
      <tbody>
        {activeEntries.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-2 text-[var(--ink-faint)]">
              No scoring statistics yet.
            </td>
          </tr>
        ) : (
          activeEntries.map((entry) => (
            <tr key={entry.label} className="border-t border-dashed border-[var(--line)]">
              <td className="py-1.5 text-[var(--ink-soft)]">{entry.label}</td>
              <td className="mono py-1.5 text-right">{formatPoints(entry.statValue)}</td>
              <td className="mono py-1.5 text-right text-[var(--ink-faint)]">
                {formatSignedPoints(entry.pointValue)}
              </td>
              <td
                className={`points py-1.5 text-right ${entry.points < 0 ? "text-[var(--danger)]" : ""}`}
              >
                {formatPoints(entry.points)}
              </td>
            </tr>
          ))
        )}
        {score.adjustmentPoints !== 0 ? (
          <tr className="border-t border-dashed border-[var(--line)]">
            <td className="py-1.5 text-[var(--gold)]">Admin adjustment</td>
            <td />
            <td />
            <td className="points py-1.5 text-right text-[var(--gold)]">
              {formatSignedPoints(score.adjustmentPoints)}
            </td>
          </tr>
        ) : null}
        <tr className="border-t-2 border-[var(--line-strong)]">
          <td className="py-1.5 font-bold">Total</td>
          <td />
          <td />
          <td className="points py-1.5 text-right text-base">{formatPoints(score.totalPoints)}</td>
        </tr>
      </tbody>
    </table>
  );
}
