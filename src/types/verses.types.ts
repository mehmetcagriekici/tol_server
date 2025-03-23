//verses types
export interface VerseContent {
  text: string;
  N: string;
  W: string;
  S: string;
  E: string;
}

export interface VerseSubscribers {
  user_id: string;
}

export interface Verse {
  id: string;
  subtitle: string;
  content: VerseContent;
  created_by: string;
  subscribers: { [id: string]: VerseSubscribers };
  testament_id: string;
  created_at: Date;
  updated_at: Date;
}
