import {
  MarkdownToolbar,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import { useCallback, useState } from 'react';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  DropCursorExtension,
  GapCursorExtension,
  HardBreakExtension,
  HeadingExtension,
  HistoryExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  UnderlineExtension,
} from 'remirror/extensions';

// import 'remirror/styles/all.css';

export function Editor(props: { content: string, onContentChange: (content: string) => void }) {
  const [content, setContent] = useState(props.content);
  const { manager, state, onChange } = useRemirror({
    extensions: () => [
      new BoldExtension({}),
      new ItalicExtension(),
      new UnderlineExtension(),
      new StrikeExtension(),
      new CodeExtension(),
      new HeadingExtension({ levels: [1, 2, 3, 4, 5] }),
      new BulletListExtension({}),
      new OrderedListExtension(),
      new ListItemExtension({}),
      new BlockquoteExtension(),
      new HardBreakExtension(),
      new HorizontalRuleExtension({}),
      new LinkExtension({}),
      new ImageExtension({}),
      new CodeBlockExtension({}),
      new TableExtension({}),
      new TrailingNodeExtension({}),
      new GapCursorExtension(),
      new DropCursorExtension({}),
      new PlaceholderExtension({}),
      new HistoryExtension({}),
      //   new CollaborationExtension({}),
      new MarkdownExtension({}),
      //   new BaseKeymapExtension(),
    ],
    content: props.content,
    stringHandler: 'markdown',
  });

  // Debounce function
  function debounce(func: any, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(args), wait);
    };
  }

  // Example save function
  function saveContent() {
    // console.log('Saving content:', content);
    // Add your save logic here
    props.onContentChange(content);
  }

  // Debounced save function
  const debouncedSave = useCallback(debounce(saveContent, 5000), []);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(newContent);
  };

  return (
    <AllStyledComponent>
      <ThemeProvider className='bg-blue-300'>
        <Remirror
          manager={manager}
          state={state}
          onChange={(params) => {
            onChange(params);
            const newContent = params.state.doc.toString()
            if (newContent !== props.content) {
              handleChange(newContent);
            }
          }}
          autoRender='end'>
          <MarkdownToolbar />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
}
