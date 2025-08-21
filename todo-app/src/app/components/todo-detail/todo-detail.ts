import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, switchMap, of } from 'rxjs';
import { Todo, TodoCreateRequest, TodoUpdateRequest } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-detail.html',
  styleUrl: './todo-detail.css'
})
export class TodoDetailComponent implements OnInit {
  todo$: Observable<Todo | null>;
  isNewTodo = false;
  isEditing = false;
  
  editForm = {
    title: '',
    description: '',
    status: 'open' as 'open' | 'done' | 'deleted'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoService: TodoService
  ) {
    this.todo$ = this.todoService.selectedTodo$;
  }

  ngOnInit(): void {
    this.todo$.subscribe(todo => {
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
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.isNewTodo) {
      this.goBack();
    }
    this.todo$.subscribe(todo => {
      if (todo) {
        this.editForm = {
          title: todo.title,
          description: todo.description,
          status: todo.status
        };
      }
    });
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
      this.todo$.subscribe(todo => {
        if (todo && this.editForm.title.trim() && this.editForm.description.trim()) {
          const updateRequest: TodoUpdateRequest = {
            title: this.editForm.title.trim(),
            description: this.editForm.description.trim(),
            status: this.editForm.status
          };
          this.todoService.updateTodo(todo.id, updateRequest);
          this.isEditing = false;
        }
      }).unsubscribe();
    }
  }

  deleteTodo(): void {
    this.todo$.subscribe(todo => {
      if (todo && !this.isNewTodo) {
        this.todoService.deleteTodo(todo.id);
        this.goBack();
      }
    }).unsubscribe();
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
