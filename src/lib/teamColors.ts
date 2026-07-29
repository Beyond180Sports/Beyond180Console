import type { TeamColor } from '../../types/db';

const TEAM_COLOR_HEX: Record<TeamColor, string> = {
  RED: '#C62828',
  PINK: '#D81B60',
  PURPLE: '#7B1FA2',
  YELLOW: '#F9A825',
  ORANGE: '#EF6C00',
  LIGHT_BLUE: '#039BE5',
  DARK_BLUE: '#1565C0',
  LIGHT_GREEN: '#43A047',
  DARK_GREEN: '#2E7D32',
};

const FALLBACK_SQUAD_COLOR = '#1E6FE8';

export function squadColorHex(color: TeamColor | null | undefined): string {
  if (!color) {
    return FALLBACK_SQUAD_COLOR;
  }
  return TEAM_COLOR_HEX[color] ?? FALLBACK_SQUAD_COLOR;
}
