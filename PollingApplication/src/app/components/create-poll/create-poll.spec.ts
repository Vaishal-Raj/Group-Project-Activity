import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreatePoll } from './create-poll'; // 👈 standalone component
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PollService } from '../../services/pollService/poll-service';
import { DashboardState } from '../../services/dashboardService/dashboard-state';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

describe('CreatePoll Component', () => {
  let component: CreatePoll;
  let fixture: ComponentFixture<CreatePoll>;
  let mockPollService: jasmine.SpyObj<PollService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockPollService = jasmine.createSpyObj('PollService', ['createPoll']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CreatePoll, // ✅ Standalone component is added to imports not declarations
        ReactiveFormsModule,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: PollService, useValue: mockPollService },
        { provide: DashboardState, useValue: {} },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePoll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the CreatePoll component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the poll form with default values', () => {
    expect(component.pollForm.get('question')).toBeTruthy();
    expect(component.options.length).toBe(2);
  });

  it('should not allow poll submission if form is invalid', () => {
    component.pollForm.patchValue({ question: '', options: ['', ''] });
    expect(component.pollForm.invalid).toBeTrue();
  });

  it('should add a new option to the poll form', () => {
    const initialLength = component.options.length;
    component.addOption();
    expect(component.options.length).toBe(initialLength + 1);
  });

  it('should remove an option if more than two are present', () => {
    component.addOption(); // now 3 options
    const initialLength = component.options.length;
    component.removeOption(2);
    expect(component.options.length).toBe(initialLength - 1);
  });

  it('should not remove an option if only two options exist', () => {
    const initialLength = component.options.length;
    component.removeOption(0);
    expect(component.options.length).toBe(initialLength); // still 2
  });

  it('should submit the form successfully and navigate to dashboard', fakeAsync(() => {
    spyOn(Swal, 'fire');
    mockPollService.createPoll.and.returnValue(of({ success: true }));

    component.pollForm.patchValue({
      question: 'Favorite framework?',
      options: ['Angular', 'React'],
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });

    component.submitPoll();
    tick();

    expect(mockPollService.createPoll).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith('Successfully created a poll');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['dashboard']);
  }));

  it('should handle errors from the poll service', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'log');
    mockPollService.createPoll.and.returnValue(throwError(() => new Error('Server error')));

    component.pollForm.patchValue({
      question: 'Fail case',
      options: ['A', 'B']
    });

    component.submitPoll();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith(jasmine.any(Error));
  }));
});
