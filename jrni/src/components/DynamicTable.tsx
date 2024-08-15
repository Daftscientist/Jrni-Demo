import React from 'react';

interface TableProps {
  titles: React.ReactNode[];
  bodies: React.ReactNode[][];
  onRowItemClick?: (item: React.ReactNode, rowIndex: number, itemIndex: number) => void;
}

const DynamicTable: React.FC<TableProps> = ({ titles, bodies, onRowItemClick }) => {
  return (
    <div className='relative overflow-x-auto rounded-lg table-container'>
      <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg table-responsive'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr>
            {titles.map((title, index) => (
              <th key={index} scope='col' className='px-6 py-3'>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodies.map((body, rowIndex) => (
            <tr
              key={rowIndex}
              className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
            >
              {body.map((item, itemIndex) => (
                <td
                  key={itemIndex}
                  className='px-6 py-4'
                  onClick={() => onRowItemClick && onRowItemClick(item, rowIndex, itemIndex)}
                >
                  {item}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
