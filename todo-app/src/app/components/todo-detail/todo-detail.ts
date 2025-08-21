import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Todo, TodoCreateRequest, TodoUpdateRequest } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-detail.html',
  styleUrl: './todo-detail.css'
})
export class TodoDetailComponent implements OnInit, OnDestroy {
  todo$: Observable<Todo | null>;
  currentTodo: Todo | null = null;
  isNewTodo = false;
  isEditing = false;
  private subscription = new Subscription();
  
  editForm = {
    title: '',
    description: '',
    status: 'open' as 'open' | 'done' | 'deleted'
  };

  constructor(
    private router: Router,
    private todoService: TodoService
  ) {
    this.todo$ = this.todoService.selectedTodo$;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.todo$.subscribe(todo => {
        this.currentTodo = todo;
        if (todo && !this.isEditing) {
          this.isNewTodo = false;
          this.editForm = {
            title: todo.title,
            description: todo.description,
            status: todo.status
          };
        } else if (!todo) {
          this.isNewTodo = true;
          this.isEditing = true;
          this.editForm = { title: '', description: '', status: 'open' };
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.isNewTodo) {
      this.goBack();
    } else if (this.currentTodo) {
      this.editForm = {
        title: this.currentTodo.title,
        description: this.currentTodo.description,
        status: this.currentTodo.status
      };
    }
  }

  saveTodo(): void {
    if (this.isNewTodo) {
      if (this.editForm.title.trim() && this.editForm.description.trim()) {
        const createRequest: TodoCreateRequest = {
          title: this.editForm.title.trim(),
          description: this.editForm.description.trim()
        };
        this.todoService.addTodo(createRequest);
        this.goBack();
      }
    } else {
      if (this.editForm.title.trim() && this.editForm.description.trim()) {
        const updateRequest: TodoUpdateRequest = {
          title: this.editForm.title.trim(),
          description: this.editForm.description.trim(),
          status: this.editForm.status
        };
        this.todoService.updateSelectedTodo(updateRequest);
        this.isEditing = false;
      }
    }
  }

  deleteTodo(): void {
    if (!this.isNewTodo) {
      this.todoService.deleteSelectedTodo();
      this.goBack();
    }
  }

  goBack(): void {
    this.todoService.clearSelectedTodo();
    this.router.navigate(['/']);
  }

  isFormValid(): boolean {
    return this.editForm.title.trim().length > 0 && 
           this.editForm.description.trim().length > 0;
  }
}
