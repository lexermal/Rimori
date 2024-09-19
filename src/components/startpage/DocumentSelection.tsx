import { DocumentStatus } from '@/components/startpage/Startpage';
import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface Props {
  items: DocumentStatus[];
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
    // console.log(id);
  };

  //group items by document_id
  const groupedItems = items.reduce((acc: any, item: any) => {
    if (acc[item.document_id]) {
      acc[item.document_id].push(item);
    } else {
      acc[item.document_id] = [item];
    }
    return acc;
  }, {});

  // console.log(groupedItems);

  return (
    <div className='bg-gray-300 rounded-lg p-4 mx-auto' style={{ maxWidth: "500px" }}>
      {Object.keys(groupedItems).map((key, index) => {
        return (
          <AccordionList
            key={index}
            title={groupedItems[key][0].document_name}
            id={groupedItems[key][0].document_id}
            close={openAccordion !== `${index}`}
            onSelected={handleEntryClick}
            selectionIndex={selectedEntry}
            items={groupedItems[key].map((item: any) => ({ id: item.section_id, title: item.section_heading }))}
          />
        );
      })}
      {/* <button onClick={onNewDocument}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 448 512'
          className='h-5 mr-2 float-left pl-4'
        >
          <path d='M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z' />
        </svg>
        <i>Create new document</i>
      </button> */}
    </div>
  );
}

interface AccordionListProps {
  title: string;
  close: boolean;
  onSelected: (id: string) => void;
  selectionIndex: string;
  items: { id: string, title: string }[];
  id: string;
}

function AccordionList({
  title,
  close,
  onSelected,
  selectionIndex,
  items,
  id,
}: AccordionListProps) {
  // console.log('items', items);
  // console.log('selectionIndex', selectionIndex);
  const [isOpen, setIsOpen] = useState(!!close);

  useEffect(() => {
    setIsOpen(!close);
  }, [close]);

  return (
    <div className='accordion mb-1'>
      <div className='accordion-header'>
        <div className='flex' onClick={() => setIsOpen(!isOpen)}>

          <p
            className={`title cursor-pointer px-3 py-1 flex ${selectionIndex === id
              ? 'selected bg-blue-400 font-bold rounded-lg'
              : (selectionIndex.includes(id) ? 'font-bold' : '')
              }`}
            onClick={() => onSelected(id)}
          >
            {/* <FaRegFileLines /> */}
            {title}
            {items.length > 0 && (
              <MyButton
                isOpen={isOpen}
                id={id}
                onSelected={(value: string) => onSelected(value)}
              />
            )}
          </p>
        </div>
      </div>
      <div className={`accordion-body ${isOpen ? 'open' : 'hidden'}`}>
        {items.map((item: { id: string, title: string }, index: number) => {
          const entryID = `${id}_${item.id}`;
          return (
            <p
              key={index}
              className={`entry p-1 pl-5 rounded-md ml-5 cursor-pointer ${selectionIndex === entryID ? 'selected bg-blue-400 font-bold' : ''}`}
              onClick={() => onSelected(entryID)}>
              {item.title}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function MyButton({ isOpen, onSelected, id }: any) {
  return (
    <button
      className="title ml-3"
      onClick={() => onSelected(id)}
    >
      {!isOpen ? <FaChevronDown /> : <FaChevronUp />}
    </button>
  );
}
