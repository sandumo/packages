const records = [
  ['14.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['15.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['16.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['17.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['18.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['19.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
  ['20.03.2024', 'a', 'b', '100', 'c', '200', 'd'],
];

export default function TableRangePicker() {
  return (
    <div className="bg-red-500">
      {records.map((record, recordIndex) => (
        <div key={recordIndex} className="flex bg-red-500">
          {record.map((cell, cellIndex) => (
            <div key={cellIndex} className="border border-black w-10 flex">
              {cell} e
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
