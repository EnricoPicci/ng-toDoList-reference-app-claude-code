import { Routes } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list';
import { TodoDetailComponent } from './components/todo-detail/todo-detail';

export const routes: Routes = [
  { path: '', component: TodoListComponent },
  { path: 'todo', component: TodoDetailComponent },
  { path: '**', redirectTo: '' }
];
