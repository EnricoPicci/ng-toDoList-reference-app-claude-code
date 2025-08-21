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
  todo$: Observable<Todo | undefined>;
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
    this.todo$ = of(undefined);
  }

  ngOnInit(): void {
    this.todo$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id === 'new') {
          this.isNewTodo = true;
          this.isEditing = true;
          this.editForm = { title: '', description: '', status: 'open' };
          return of(undefined);
        } else if (id) {
          this.isNewTodo = false;
          return this.todoService.getTodoById(id);
        }
        return of(undefined);
      })
    );

    this.todo$.subscribe(todo => {
      if (todo && !this.isEditing) {
        this.editForm = {
          title: todo.title,
          description: todo.description,
          status: todo.status
        };
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
      const id = this.route.snapshot.paramMap.get('id');
      if (id && this.editForm.title.trim() && this.editForm.description.trim()) {
        const updateRequest: TodoUpdateRequest = {
          title: this.editForm.title.trim(),
          description: this.editForm.description.trim(),
          status: this.editForm.status
        };
        this.todoService.updateTodo(id, updateRequest);
        this.isEditing = false;
      }
    }
  }

  deleteTodo(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.isNewTodo) {
      this.todoService.deleteTodo(id);
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  isFormValid(): boolean {
    return this.editForm.title.trim().length > 0 && 
           this.editForm.description.trim().length > 0;
  }
}
