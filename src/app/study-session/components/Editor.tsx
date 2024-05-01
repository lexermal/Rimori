import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { useEffect } from 'react';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  CollaborationExtension,
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

export function Editor(props:{content:string}) {
  const { manager, state, onChange, setState } = useRemirror({
    extensions: () => [
      new BoldExtension({}),
      new ItalicExtension(),
      new UnderlineExtension(),
      new StrikeExtension(),
      new CodeExtension(),
      new HeadingExtension({ levels: [1, 2, 3,4,5]}),
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

  return (
    <ThemeProvider className='bg-blue-300' >
      <Remirror
        manager={manager}
        state={state}
        onChange={onChange}
        autoRender='start'
        
      />
    </ThemeProvider>
  );
}