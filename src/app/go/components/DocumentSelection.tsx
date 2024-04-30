import {  useEffect, useState } from 'react';

interface Props {
    items:{[key: string]: string[]};
    onSelected: (id: string) => void;
}

export default function HomePage({items, onSelected}: Props) {
  const [openAccordion, setOpenAccordion] = useState('');
  const [selectedEntry, setSelectedEntry] = useState('');

  const handleEntryClick = (id: string) => {
    setSelectedEntry(id);
    setOpenAccordion(id.split('-')[0]);
    onSelected(id);
    console.log(id);
  };

  return (
    <div>
      <h1>Accordion Example</h1>


        {Object.keys(items).map((key, index) => (
            <AccordionList
            key={index}
            title={key}
            close={openAccordion !== `${index}`}
            onSelected={handleEntryClick}
            selectionIndex={selectedEntry}
            items={items[key]}
            id={`${index}`}
            />
        ))}
      {/* <AccordionList
        title='Accordion 1'
        close={openAccordion !== '0'}
        onSelected={handleEntryClick}
        selectionIndex={selectedEntry}
        items={['Entry 1', 'Entry 2']}
        id='0'
      />
      <AccordionList
        title='Accordion 2'
        close={openAccordion !== '1'}
        onSelected={handleEntryClick}
        selectionIndex={selectedEntry}
        items={['Entry 1', 'Entry 2', 'Entry 3']}
        id='1'
      /> */}
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
    <div className='accordion'>
      <div className='accordion-header'>
        <div className='accordion-icon' onClick={() => setIsOpen(!isOpen)}>
          <p
            className={`title ${selectionIndex === `${id}-title` ? 'selected bg-blue-600' : ''}`}
            onClick={() => onSelected(`${id}-title`)}
          >
            (toggle icon here)
          </p>
        </div>
        <p
          className={`title ${selectionIndex === `${id}-title` ? 'selected bg-blue-600' : ''}`}
          onClick={() => onSelected(`${id}-title`)}
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
