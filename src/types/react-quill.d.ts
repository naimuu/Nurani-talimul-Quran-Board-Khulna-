declare module 'react-quill' {
  import React from 'react';

  export interface ReactQuillProps {
    theme?: string;
    value?: string;
    defaultValue?: string;
    readOnly?: boolean;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    className?: string;
    modules?: any;
    formats?: string[];
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}
