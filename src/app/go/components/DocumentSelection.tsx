import { useEffect, useState } from 'react';

interface Props {
  items: { [key: string]: string[] };
  onSelected: (id: string) => void;
  onNewDocument: () => void;
}

export default function HomePage({ items, onSelected, onNewDocument }: Props) {
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
      <button onClick={onNewDocument}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 448 512'
          className='h-5 mr-2 float-left pl-4'
        >
          {/* <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
          <path d='M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z' />
        </svg>
        <i>Create new document</i>
      </button>
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
              onSelected={(value: string) => onSelected(value)}
            />
          ) : (
            ''
          )}
        </div>
        <p
          className={`title cursor-pointer px-5 py-1 ${
            selectionIndex === id
              ? 'selected bg-blue-400 font-bold rounded-lg'
              : ''
          }`}
          onClick={() => onSelected(id)}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 384 512'
            className='h-5 mr-2 float-left'
          >
            {/* <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
            <path d='M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z' />
          </svg>
          <i>{title}</i>
        </p>
      </div>
      <div className={`accordion-body ${isOpen ? 'open' : 'hidden'}`}>
        {items.map((item: any, index: number) => {
          const entryID = `${id}-${index}`;
          return (
            <p
              key={index}
              className={`entry ${
                selectionIndex === entryID ? 'selected bg-blue-600' : ''
              }`}
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

function MyButton({ titleSelected, onSelected, id }: any) {
  return (
    <p
      className={`title ${titleSelected ? 'selected bg-blue-600' : ''}`}
      onClick={() => onSelected(id)}
    >
      (toggle icon here)
    </p>
  );
}
