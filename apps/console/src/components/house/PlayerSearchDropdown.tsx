import FilterDropdown from './FilterDropdown';
import type { FilterOption } from './types';

type PlayerSearchDropdownProps = {
  options: FilterOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder?: string;
  style?: object;
};

/** Searchable single-player filter used by the House board. */
export default function PlayerSearchDropdown({
  options,
  selectedId,
  onSelect,
  placeholder = 'All Players',
  style,
}: PlayerSearchDropdownProps) {
  return (
    <FilterDropdown
      options={options}
      selectedId={selectedId}
      onSelect={onSelect}
      placeholder={placeholder}
      enableSearch
      style={style}
    />
  );
}
