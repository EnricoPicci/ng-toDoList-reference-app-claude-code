# Angular Todo App - Reference Architecture

This is a reference Angular application that demonstrates a clean, layered architecture approach for building maintainable and scalable Angular applications. This reference app serves as a practical example of how to structure Angular projects following clear architectural principles and best practices.

## Key Architectural Principles

This application is built following a **three-layer architecture pattern** that promotes separation of concerns, maintainability, and testability:

### 1. Layer Structure

- **Model Layer**: Contains TypeScript interfaces, types, and classes that describe the application's data structures. This layer has no dependencies on Angular and can import only TypeScript/JavaScript libraries.

- **Service Layer**: Contains Angular services (classes with `@Injectable` annotation) that manage business logic and data operations. This layer can import from the Model Layer.

- **View Layer**: Contains Angular components (classes with `@Component` annotation) and other view-related classes like guards. This layer can import from both Service and Model layers.

### 2. Dependency Rules

The layers follow a strict dependency hierarchy:
- **Model Layer** → No Angular dependencies, only TypeScript/JavaScript libraries
- **Service Layer** → Can depend on Model Layer + Angular core services
- **View Layer** → Can depend on both Service Layer and Model Layer

### 3. Responsibility Distribution

- **Components (View Layer)**:
  - Intercept user events and convert them into Service Layer API calls
  - Subscribe to Observable streams from services to update the view reactively
  - Keep components light with minimal logic

- **Services (Service Layer)**:
  - Provide methods that the View Layer calls in response to events
  - Expose Observable streams that components subscribe to for reactive updates
  - Contain all business logic and state management

- **Models (Model Layer)**:
  - Define data structures (interfaces, types, classes)
  - May contain application logic that runs on the frontend
  - Remain framework-agnostic

## Application Overview

This is a **Todo Management Application** that allows users to:
- View a list of active todos
- Create new todos with title and description
- Edit existing todos (title, description, status)
- Mark todos as complete or incomplete
- Delete todos (soft delete)
- Navigate between list and detail views

The application demonstrates reactive programming patterns using RxJS and showcases how components communicate through services using Observable streams.

## Architecture Implementation in This Reference App

### Model Layer (`src/app/models/`)

The Model Layer defines the core data structures:

```typescript
// todo.model.ts
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
```

**Key Points:**
- Pure TypeScript interfaces with no Angular dependencies
- Clear separation between the main entity (`Todo`) and operation DTOs
- Type-safe status enumeration

### Service Layer (`src/app/services/`)

The Service Layer manages all business logic and state:

```typescript
// todo.service.ts - Key patterns demonstrated
export class TodoService {
  // Private subjects for internal state management
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private selectedTodoSubject = new BehaviorSubject<Todo | null>(null);

  // Public observables for components to subscribe to
  public readonly todos$ = this.todosSubject.asObservable();
  public readonly selectedTodo$ = this.selectedTodoSubject.asObservable();
  public readonly activeTodos$ = this.todos$.pipe(
    map(todos => todos.filter(todo => todo.status !== 'deleted'))
  );

  // Methods for components to call
  addTodo(request: TodoCreateRequest): void { /* ... */ }
  updateTodo(id: string, updates: TodoUpdateRequest): void { /* ... */ }
  selectTodo(todo: Todo): void { /* ... */ }
}
```

**Key Patterns:**
- **BehaviorSubject** used for state that needs default values (`todos$`, `selectedTodo$`)
- Private subjects for internal state, public observables for external consumption
- Derived observables using RxJS operators (`activeTodos$`)
- Methods that modify state and emit new values
- Clear API separation between read operations (observables) and write operations (methods)

### View Layer (`src/app/components/`)

Components are kept light and focused on view responsibilities:

```typescript
// todo-list.component.ts - List Component Pattern
export class TodoListComponent implements OnInit {
  todos$: Observable<Todo[]>;

  constructor(
    private todoService: TodoService,
    private router: Router
  ) {
    // Subscribe to service observables
    this.todos$ = this.todoService.activeTodos$;
  }

  // Event handlers that delegate to services
  onTodoClick(todo: Todo): void {
    this.todoService.selectTodo(todo);
    this.router.navigate(['/todo']);
  }

  onToggleStatus(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.todoService.toggleTodoStatus(todo.id);
  }
}
```

**Key Patterns:**
- Components subscribe to service observables in constructor or ngOnInit
- Event handlers are simple delegations to service methods
- No business logic in components
- Use of `async` pipe in templates for reactive rendering

## How to Build This Reference App Step by Step

### Step 1: Set up the Project Structure

Create the three-layer folder structure:
```
src/app/
├── models/           # Model Layer
├── services/         # Service Layer
└── components/       # View Layer
```

### Step 2: Define the Model Layer

Start with data structures that are framework-agnostic:
- Define core entities (`Todo` interface)
- Create operation DTOs (`TodoCreateRequest`, `TodoUpdateRequest`)
- Ensure no Angular imports

### Step 3: Build the Service Layer

Create services that manage state and business logic:
- Use BehaviorSubject for state that needs default values
- Expose public observables for components to subscribe to
- Create methods for state modifications
- Implement derived observables using RxJS operators

### Step 4: Implement the View Layer

Create components that are reactive and light:
- Subscribe to service observables for data
- Handle user events by calling service methods
- Use async pipe in templates for automatic subscription management
- Keep components focused on presentation logic only

### Step 5: Set up Routing and Navigation

Configure routes and navigation between components:
- Define routes in `app.routes.ts`
- Use router for navigation between views
- Pass data between routes through services, not route parameters

## How to Run the Application

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Angular CLI (optional, but recommended)

### Setup and Run

1. **Navigate to the project directory:**
   ```bash
   cd todo-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open the application:**
   Open [http://localhost:4200](http://localhost:4200) in your browser

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build in watch mode

## Understanding RxJS Subjects: When to Use Which Type

In Angular services following this architecture, Observable streams are crucial for reactive communication between services and components. Understanding when to use different types of Subjects is essential for building robust applications.

### BehaviorSubject: Use When You Need Default Values

**When to use:**
- The Observable stream must provide a default/initial value when a component subscribes
- Late subscribers should immediately receive the most recent value
- You have a meaningful default state

**Example Use Cases:**
```typescript
// User authentication status - default is "not logged in"
private authStatusSubject = new BehaviorSubject<'logged' | 'not-logged'>('not-logged');
public authStatus$ = this.authStatusSubject.asObservable();

// Selected todo - default is null (no selection)
private selectedTodoSubject = new BehaviorSubject<Todo | null>(null);
public selectedTodo$ = this.selectedTodoSubject.asObservable();

// Application theme - default is 'light'
private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
public theme$ = this.themeSubject.asObservable();
```

**Key Characteristics:**
- Stores the last emitted value
- New subscribers immediately receive the current value (or default if nothing was emitted)
- Perfect for representing current state
- Requires an initial value in the constructor

### ReplaySubject: Use When You Need Recent Values Without Defaults

**When to use:**
- You need to replay the last N values to new subscribers
- There's no meaningful default value, but late subscribers need recent data
- You want to cache values for a specific time window

**Example Use Cases:**
```typescript
// Application configuration fetched at startup
// No default value makes sense, but all components need the same config
private configSubject = new ReplaySubject<AppConfig>(1); // Replay last 1 value
public config$ = this.configSubject.asObservable();

// Recent notifications (keep last 5)
private notificationsSubject = new ReplaySubject<Notification>(5);
public recentNotifications$ = this.notificationsSubject.asObservable();

// Chat messages in a room (replay last 50 messages for new subscribers)
private messagesSubject = new ReplaySubject<Message>(50);
public messages$ = this.messagesSubject.asObservable();
```

**Key Characteristics:**
- Replays the last N values to new subscribers
- Can specify a time window for how long to keep values
- No initial value required
- More memory-intensive than BehaviorSubject

### Subject: Use When You Need Fresh Values Only

**When to use:**
- No default value makes sense
- Only current and future values should be received by subscribers
- Events or notifications that should only be processed by active subscribers

**Example Use Cases:**
```typescript
// Error notifications - only active subscribers should see new errors
private errorSubject = new Subject<string>();
public errors$ = this.errorSubject.asObservable();

// Form submission events - only process if component is currently active
private formSubmitSubject = new Subject<FormData>();
public formSubmissions$ = this.formSubmitSubject.asObservable();

// Real-time data updates - only fresh data matters
private liveDataSubject = new Subject<LiveData>();
public liveData$ = this.liveDataSubject.asObservable();
```

**Key Characteristics:**
- No initial value
- New subscribers only receive values emitted after subscription
- Most memory-efficient
- Perfect for event streams

### Decision Tree for Subject Selection

1. **Do you have a meaningful default value?**
   - Yes → Use **BehaviorSubject**
   - No → Continue to step 2

2. **Do late subscribers need to receive recent values?**
   - Yes → Use **ReplaySubject**
   - No → Use **Subject**

3. **How many recent values should be replayed?**
   - One value → Consider **BehaviorSubject** with a default
   - Multiple values → Use **ReplaySubject** with buffer size
   - Time-based → Use **ReplaySubject** with time window

### Practical Examples in This Todo App

In the TodoService, we use **BehaviorSubject** because:

```typescript
// We have meaningful default values
private todosSubject = new BehaviorSubject<Todo[]>([]); // Default: empty array
private selectedTodoSubject = new BehaviorSubject<Todo | null>(null); // Default: no selection

// When components subscribe, they immediately get the current state
// This ensures the UI always shows the current data, even for late subscribers
```

If we had used **Subject** instead, components subscribing after data was loaded would see nothing until the next change occurred. If we used **ReplaySubject**, we'd need to manage memory for potentially large todo arrays without getting the benefit of immediate default values.

This choice demonstrates how the right Subject type ensures components always have the data they need for proper rendering, following our architecture principle of reactive, state-driven UIs.
