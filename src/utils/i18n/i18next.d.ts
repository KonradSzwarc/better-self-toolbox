import type messages from './messages/en.json';

import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof messages;
    };
  }
}
