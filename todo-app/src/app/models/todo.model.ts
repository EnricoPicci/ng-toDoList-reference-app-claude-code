export interface Todo {
  id: string;
  title: string;
  description: string;
  creationDate: Date;
  status: 'open' | 'done' | 'deleted';
}

export interface TodoCreateRequest {
  title: string;
  description: string;
}

export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'done' | 'deleted';
}