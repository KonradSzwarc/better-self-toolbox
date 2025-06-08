import en from './en.json';
import pl from './pl.json';

export const messages = { en, pl };

export type Messages = typeof en;

export type MessageKey = keyof Messages;
