//testaments types
export interface TestamentContent {
  verse_id: {
    creator_id: string;
    N: string;
    W: string;
    S: string;
    E: string;
  };
}

export interface TestamentMembers {
  user_id: string;
}

export interface Testament {
  id: string;
  title: string;
  content: TestamentContent;
  members: { [id: string]: TestamentMembers };
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
