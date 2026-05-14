import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: unknown;
    }
  }
}

export {};