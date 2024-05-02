import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
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

export function Editor(props: { content: string }) {
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

  return (
    <AllStyledComponent>
      <ThemeProvider className='bg-blue-300'>
        <Remirror
          manager={manager}
          state={state}
          onChange={onChange}
          autoRender='start'
        />
      </ThemeProvider>
    </AllStyledComponent>
  );
}
