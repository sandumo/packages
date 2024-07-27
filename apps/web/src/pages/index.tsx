import { TableRangePicker } from '@sandumo/ui';

export default function Home() {
  return (
    <div className="p-4 bg-red-500">
      <p className="text-4xl font-bold underline bg-blue-500">Home</p>

      <div>
        <TableRangePicker />
      </div>
    </div>
  );
}
