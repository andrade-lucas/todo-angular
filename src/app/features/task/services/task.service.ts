import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Task } from '../model/task.model';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _httpClient = inject(HttpClient);

  public tasks = signal<Task[]>([]);
  public numberOfTasks = computed(() => this.tasks().length);

  public getTasks(): Observable<Task[]> {
    return this._httpClient.get<Task[]>(`${this._apiUrl}/tasks`)
      .pipe(tap(tasks => {
        let sortedTasks = this.getSortedTasks(tasks);
        this.tasks.set(sortedTasks);
      }));
  }

  public createTask(task: Partial<Task>): Observable<Task> {
    return this._httpClient.post<Task>(`${this._apiUrl}/tasks`, task);
  }

  public insertATaskInTheTasksList(newTask: Task): void {
    let updatedTasks = [...this.tasks(), newTask];
    let sortedTasks = this.getSortedTasks(updatedTasks);
    this.tasks.set(sortedTasks);
  }

  public updateTask(updatedTask: Task): Observable<Task> {
    return this._httpClient.put<Task>(
      `${this._apiUrl}/tasks/${updatedTask.id}`,
      updatedTask
    );
  }

  public updateIsCompletedStatus(taskId: string, isCompleted: boolean): Observable<Task> {
    return this._httpClient.patch<Task>(`${this._apiUrl}/tasks/${taskId}`, {
      isCompleted
    });
  }

  public updateATaskInTheTasksList(updatedTask: Task): void {
    this.tasks.update(tasks => {
      let allTasksWithUpdatedTaskRemoved = tasks.filter(task => task.id !== updatedTask.id);
      let updatedTaskList = [...allTasksWithUpdatedTaskRemoved, updatedTask];

      return this.getSortedTasks(updatedTaskList);
    });
  }

  public deleteTask(taskId: string): Observable<Task> {
    return this._httpClient.delete<Task>(`${this._apiUrl}/tasks/${taskId}`);
  }

  public deleteATaskInTheTasksList(taskId: string): void {
    this.tasks.update(tasks => tasks.filter(task => task.id !== taskId));
  }

  public getSortedTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => a.title.localeCompare(b.title));
  }
}
