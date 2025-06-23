import { mean, round } from 'lodash-es';
import { useId, useState } from 'preact/hooks';
import { Fragment } from 'preact/jsx-runtime';

export interface LikertTableProps {
  totalLabel: string;
  scale: {
    from: number;
    to: number;
  };
  items: {
    label: string;
    isReversed?: boolean;
  }[];
}

export function LikertTablePreact({ totalLabel, scale, items }: LikertTableProps) {
  const [values, setValues] = useState<Record<string, number>>({});

  return (
    <div class="grid grid-cols-[1fr_80px] border-t text-foreground [&_p]:m-0 [&_p]:p-2">
      {items.map((item) => (
        <LikertTableItem
          key={item.label}
          item={item}
          scale={scale}
          onChange={(name, value) =>
            setValues((prev) => {
              if (value === null) {
                const { [name]: _, ...rest } = prev;
                return rest;
              }
              return { ...prev, [name]: value };
            })
          }
        />
      ))}
      <p class="border-x border-b font-bold">
        {totalLabel} ({scale.from}-{scale.to})
      </p>
      <p class="border-r border-b text-center font-bold">{round(mean(Object.values(values)), 2) || 0}</p>
    </div>
  );
}

interface LikertTableItemProps {
  item: LikertTableProps['items'][number];
  scale: LikertTableProps['scale'];
  onChange: (name: string, value: number | null) => void;
}

function LikertTableItem({ item, scale, onChange }: LikertTableItemProps) {
  const id = useId();

  return (
    <Fragment>
      <p class="border-x border-b">{item.label}</p>
      <input
        id={id}
        type="number"
        class="border-r border-b p-2 text-center"
        placeholder={`${scale.from}-${scale.to}`}
        min={scale.from}
        max={scale.to}
        onInput={(e) => {
          const newValue = Number(e.currentTarget.value);

          if (Number.isNaN(newValue) || newValue < scale.from || newValue > scale.to) {
            onChange(id, null);
          }

          if (item.isReversed) {
            onChange(id, scale.to + scale.from - newValue);
          } else {
            onChange(id, newValue);
          }
        }}
      />
    </Fragment>
  );
}
