import { useEffect, useState } from 'react';

interface Props {
  items: { [key: string]: string[] };
  onSelected: (id: string) => void;
}

export default function HomePage({ items, onSelected }: Props) {
  const [openAccordion, setOpenAccordion] = useState('');
  const [selectedEntry, setSelectedEntry] = useState('');

  const handleEntryClick = (id: string) => {
    setSelectedEntry(id);
    setOpenAccordion(id.split('-')[0]);
    onSelected(id);
    console.log(id);
  };

  return (
    <div className='bg-gray-300 rounded-lg p-4'>
      {Object.keys(items).map((key, index) => (
        <AccordionList
          key={index}
          title={key}
          close={openAccordion !== `${index}`}
          onSelected={handleEntryClick}
          selectionIndex={selectedEntry}
          items={items[key]}
          id={key}
        />
      ))}
    </div>
  );
}

function AccordionList({
  title,
  close,
  onSelected,
  selectionIndex,
  items,
  id,
}: any) {
  const [isOpen, setIsOpen] = useState(!!close);

  useEffect(() => {
    setIsOpen(!close);
  }, [close]);

  return (
    <div className='accordion mb-1'>
      <div className='accordion-header'>
        <div className='accordion-icon' onClick={() => setIsOpen(!isOpen)}>
          {items.length > 0 ? (
            <MyButton
              titleSelected={selectionIndex === id}
              id={id}
              onSelected={(value:string) => onSelected(value)}
            />
          ) : (
            ''
          )}
        </div>
        <p
          className={`title cursor-pointer px-5 py-1 ${selectionIndex === `${id}-title` ? 'selected bg-blue-400 font-bold rounded-lg' : ''}`}
          onClick={() => onSelected(id)}
        >
          {title}
        </p>
      </div>
      <div className={`accordion-body ${isOpen ? 'open' : 'hidden'}`}>
        {items.map((item: any, index: number) => {
          const entryID = `${id}-${index}`;
          return (
            <p
              key={index}
              className={`entry ${selectionIndex === entryID ? 'selected bg-blue-600' : ''}`}
              onClick={() => onSelected(entryID)}
            >
              {item}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function MyButton({
  titleSelected,
  onSelected,
  id,
}: any
) {
  return (
    <p
      className={`title ${titleSelected ? 'selected bg-blue-600' : ''}`}
      onClick={() => onSelected(`${id}-title`)}
    >
      (toggle icon here)
    </p>
  );
}
