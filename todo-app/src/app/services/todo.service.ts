import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Todo, TodoCreateRequest, TodoUpdateRequest } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private selectedTodoSubject = new BehaviorSubject<Todo | null>(null);
  private nextId = 1;

  public readonly todos$ = this.todosSubject.asObservable();
  public readonly selectedTodo$ = this.selectedTodoSubject.asObservable();
  
  public readonly activeTodos$ = this.todos$.pipe(
    map(todos => todos.filter(todo => todo.status !== 'deleted'))
  );

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData(): void {
    const sampleTodos: Todo[] = [
      {
        id: '1',
        title: 'Learn Angular',
        description: 'Complete the Angular tutorial and build a todo app',
        creationDate: new Date('2024-01-15'),
        status: 'open'
      },
      {
        id: '2',
        title: 'Buy groceries',
        description: 'Milk, eggs, bread, and vegetables',
        creationDate: new Date('2024-01-16'),
        status: 'done'
      }
    ];
    this.todosSubject.next(sampleTodos);
    this.nextId = 3;
  }

  getTodoById(id: string): Observable<Todo | undefined> {
    return this.todos$.pipe(
      map(todos => todos.find(todo => todo.id === id))
    );
  }

  addTodo(request: TodoCreateRequest): void {
    const currentTodos = this.todosSubject.value;
    const newTodo: Todo = {
      id: this.nextId.toString(),
      title: request.title,
      description: request.description,
      creationDate: new Date(),
      status: 'open'
    };
    
    this.nextId++;
    this.todosSubject.next([...currentTodos, newTodo]);
  }

  updateTodo(id: string, updates: TodoUpdateRequest): void {
    const currentTodos = this.todosSubject.value;
    const updatedTodos = currentTodos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    this.todosSubject.next(updatedTodos);
  }

  deleteTodo(id: string): void {
    this.updateTodo(id, { status: 'deleted' });
  }

  toggleTodoStatus(id: string): void {
    const currentTodos = this.todosSubject.value;
    const todo = currentTodos.find(t => t.id === id);
    if (todo && todo.status !== 'deleted') {
      const newStatus = todo.status === 'open' ? 'done' : 'open';
      this.updateTodo(id, { status: newStatus });
    }
  }

  selectTodo(todo: Todo): void {
    this.selectedTodoSubject.next(todo);
  }

  clearSelectedTodo(): void {
    this.selectedTodoSubject.next(null);
  }

  deleteSelectedTodo(): void {
    const selectedTodo = this.selectedTodoSubject.value;
    if (selectedTodo) {
      this.deleteTodo(selectedTodo.id);
      this.clearSelectedTodo();
    }
  }

  updateSelectedTodo(updates: TodoUpdateRequest): void {
    const selectedTodo = this.selectedTodoSubject.value;
    if (selectedTodo) {
      this.updateTodo(selectedTodo.id, updates);
      // Update the selected todo with the new data
      this.selectedTodoSubject.next({ ...selectedTodo, ...updates });
    }
  }
}