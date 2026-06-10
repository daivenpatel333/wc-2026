import type { FantasyPosition } from "#/domain/types";
import { POSITION_LABELS } from "#/domain/positions";

export default function PositionBadge({ position }: { position: FantasyPosition }) {
  return (
    <span className={`pos-badge pos-${position}`} title={POSITION_LABELS[position]}>
      {position}
    </span>
  );
}
