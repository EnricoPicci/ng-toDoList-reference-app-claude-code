import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  imports: [CommonModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css'
})
export class TodoListComponent implements OnInit {
  todos$: Observable<Todo[]>;

  constructor(
    private todoService: TodoService,
    private router: Router
  ) {
    this.todos$ = this.todoService.activeTodos$;
  }

  ngOnInit(): void {}

  onTodoClick(todo: Todo): void {
    this.router.navigate(['/todo', todo.id]);
  }

  onToggleStatus(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.todoService.toggleTodoStatus(todo.id);
  }

  onDeleteTodo(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.todoService.deleteTodo(todo.id);
  }

  onAddNewTodo(): void {
    this.router.navigate(['/todo', 'new']);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
