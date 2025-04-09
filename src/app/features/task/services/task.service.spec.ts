import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { TaskService } from "./task.service";
import { task, TASK_INTERNAL_SERVER_ERROR_RESPONSE, TASK_UNPROCESSIBLE_ENTITY_RESPONSE, tasks } from "../../../__mocks__/tasks";
import { Task } from "../model/task.model";

describe('TaskService', () => {
    let taskService: TaskService;
    let httpTestingController: HttpTestingController;

    const MOCKED_TASKS = tasks;
    const MOCKED_TASK = task;
    const apiUrl = 'http://localhost:3000';
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });

        taskService = TestBed.inject(TaskService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('creates service', () => {
        expect(taskService).toBeTruthy();
    });

    it('getSortedTasks', () => {
        const sortedTasks = taskService.getSortedTasks(MOCKED_TASKS);
        expect(sortedTasks[0].title).toEqual('Comprar pão na padaria');
    });

    describe('getTasks', () => {
        it('should return a list of tasks', (() => {
            let tasks!: Task[];

            taskService.getTasks().subscribe(response => {
                tasks = response;
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks`);

            req.flush(MOCKED_TASKS);

            expect(tasks).toEqual(MOCKED_TASKS);
            expect(taskService.tasks()).toEqual(MOCKED_TASKS);
            expect(req.request.method).toEqual('GET');
        }));

        it('should throw an error when server returns Internal Server Error', waitForAsync(() => {
            let httpErrorResponse: HttpErrorResponse | undefined;
            
            taskService.getTasks().subscribe({
                next: () => {
                    fail('failed to fetch the tasks list');
                },
                error: (error: HttpErrorResponse) => {
                    httpErrorResponse = error;
                }
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks`);

            req.flush('Internal Server Error', TASK_INTERNAL_SERVER_ERROR_RESPONSE);

            if (!httpErrorResponse) {
                throw new Error('Error needs to be defined');
            }

            expect(httpErrorResponse.status).toEqual(500);
            expect(httpErrorResponse.statusText).toBe('Internal Server Error');
        }));
    });

    describe('createTask', () => {
        it('should create a new task', waitForAsync(() => {
            taskService.createTask(MOCKED_TASK).subscribe(() => {
                expect(taskService.tasks().length).toEqual(1);
                expect(taskService.tasks()[0]).toEqual(MOCKED_TASK);
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks`);

            req.flush(MOCKED_TASK);

            expect(req.request.method).toEqual('POST');
        }));

        it('should throw unprocessible entity with invalid body when create a task', waitForAsync(() => {
            let httpErrorResponse: HttpErrorResponse | undefined;
            
            taskService.createTask(MOCKED_TASK).subscribe({
                next: () => {
                    fail('failed to add a new task');
                },
                error: (error: HttpErrorResponse) => {
                    httpErrorResponse = error;
                }
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks`);

            req.flush('Unprocessable Entity', TASK_UNPROCESSIBLE_ENTITY_RESPONSE);

            if (!httpErrorResponse) {
                throw new Error('Error needs to be defined');
            }

            expect(httpErrorResponse.status).toEqual(422);
            expect(httpErrorResponse.statusText).toBe('Unprocessable Entity');
        }));
    });

    describe('updateTask', () => {
        it('should update a task', waitForAsync(() => {
            taskService.tasks.set([MOCKED_TASK]);

            let updatedTask = MOCKED_TASK;
            updatedTask.title = 'Ir na academia treinar perna';
            
            taskService.updateTask(updatedTask).subscribe(() => {
                expect(taskService.tasks()[0].title).toEqual('Ir na academia treinar perna');
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${updatedTask.id}`);

            req.flush(MOCKED_TASK);

            expect(req.request.method).toEqual('PUT');
        }));

        it('should throw unprocessible entity with invalid body when update a task', waitForAsync(() => {
            let httpErrorResponse: HttpErrorResponse | undefined;
            taskService.tasks.set([MOCKED_TASK]);

            let updatedTask = MOCKED_TASK;
            updatedTask.title = 'Ir na academia treinar perna';
            
            taskService.updateTask(updatedTask).subscribe({
                next: () => {
                    fail('failed to update a task');
                },
                error: (error: HttpErrorResponse) => {
                    httpErrorResponse = error;
                }
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${MOCKED_TASK.id}`);

            req.flush('Unprocessable Entity', TASK_UNPROCESSIBLE_ENTITY_RESPONSE);

            if (!httpErrorResponse) {
                throw new Error('Error needs to be defined');
            }

            expect(httpErrorResponse.status).toEqual(422);
            expect(httpErrorResponse.statusText).toBe('Unprocessable Entity');
        }));
    });

    describe('updateIsCompletedStatus', () => {
        it('should update IsCompletedStatus of a task', waitForAsync(() => {
            taskService.tasks.set(MOCKED_TASKS);

            let updatedTask = MOCKED_TASK;
            
            taskService.updateIsCompletedStatus(updatedTask.id, true).subscribe(() => {
                expect(taskService.tasks()[0].isCompleted).toBeTruthy();
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${updatedTask.id}`);

            req.flush({
                isCompleted: true
            });

            expect(req.request.method).toEqual('PATCH');
        }));

        it('should throw when update a task IsCompletedStatus', waitForAsync(() => {
            let httpErrorResponse: HttpErrorResponse | undefined;
            taskService.tasks.set(MOCKED_TASKS);

            let updatedTask = MOCKED_TASK;
            
            taskService.updateIsCompletedStatus(updatedTask.id, true).subscribe({
                next: () => {
                    fail('failed to update IsCompletedStatus of a task');
                },
                error: (error: HttpErrorResponse) => {
                    httpErrorResponse = error;
                }
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${MOCKED_TASK.id}`);

            req.flush('Unprocessable Entity', TASK_UNPROCESSIBLE_ENTITY_RESPONSE);

            if (!httpErrorResponse) {
                throw new Error('Error needs to be defined');
            }

            expect(httpErrorResponse.status).toEqual(422);
            expect(httpErrorResponse.statusText).toBe('Unprocessable Entity');
        }));
    });

    describe('updateIsCompletedStatus', () => {
        it('should delete a task', waitForAsync(() => {
            taskService.tasks.set([MOCKED_TASK]);

            taskService.deleteTask(MOCKED_TASK.id).subscribe(() => {
                expect(taskService.tasks().length).toEqual(0);
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${MOCKED_TASK.id}`);

            req.flush(null);

            expect(req.request.method).toEqual('DELETE');
        }));

        it('should throw an error when delete task', waitForAsync(() => {
            let httpErrorResponse: HttpErrorResponse | undefined;
            taskService.tasks.set([MOCKED_TASK]);
            
            taskService.deleteTask(MOCKED_TASK.id).subscribe({
                next: () => {
                    fail('failed to delete a task');
                },
                error: (error: HttpErrorResponse) => {
                    httpErrorResponse = error;
                }
            });

            const req = httpTestingController.expectOne(`${apiUrl}/tasks/${MOCKED_TASK.id}`);

            req.flush('Unprocessable Entity', TASK_UNPROCESSIBLE_ENTITY_RESPONSE);

            if (!httpErrorResponse) {
                throw new Error('Error needs to be defined');
            }

            expect(httpErrorResponse.status).toEqual(422);
            expect(httpErrorResponse.statusText).toBe('Unprocessable Entity');
        }));
    });
});
