import { mean, round } from 'lodash-es';
import { useId, useState } from 'preact/hooks';
import { Fragment } from 'preact/jsx-runtime';

const MIN_VALUE = 1;

export interface LikertTableProps {
  totalLabel: string;
  max: number;
  items: {
    label: string;
    isReversed?: boolean;
  }[];
}

export function LikertTablePreact({ totalLabel, max, items }: LikertTableProps) {
  const [values, setValues] = useState<number[]>(items.map(() => 0));

  return (
    <div class="grid grid-cols-[1fr_80px] border-t text-foreground [&_p]:m-0 [&_p]:p-2">
      {items.map((item, i) => (
        <LikertTableItem
          key={item.label}
          item={item}
          max={max}
          value={values[i] ?? 0}
          onChange={(value) => setValues(values.map((v, j) => (j === i ? value : v)))}
        />
      ))}
      <p class="border-x border-b font-bold">
        {totalLabel} (${MIN_VALUE}-{max})
      </p>
      <p class="border-r border-b text-center font-bold">
        {round(
          mean(
            values
              .map((value, index) => (items[index]?.isReversed && value > 0 ? max + MIN_VALUE - value : value))
              .filter(Boolean),
          ),
          2,
        ) || '-'}
      </p>
    </div>
  );
}

interface LikertTableItemProps {
  item: LikertTableProps['items'][number];
  max: number;
  value: number;
  onChange: (value: number) => void;
}

function LikertTableItem({ item, max, value, onChange }: LikertTableItemProps) {
  const id = useId();

  return (
    <Fragment>
      <p class="border-x border-b">{item.label}</p>
      <input
        id={id}
        name={id}
        type="number"
        class="border-r border-b p-2 text-center"
        placeholder={`${MIN_VALUE}-${max}`}
        max={max}
        min={MIN_VALUE}
        value={value || ''}
        onInput={(e) => {
          const newValue = Number(e.currentTarget.value);

          if (!Number.isInteger(newValue) || newValue < MIN_VALUE || newValue > max) {
            onChange(0);
          } else {
            onChange(newValue);
          }
        }}
      />
    </Fragment>
  );
}
