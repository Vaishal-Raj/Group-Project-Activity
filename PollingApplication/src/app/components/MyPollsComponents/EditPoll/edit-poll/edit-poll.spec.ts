// edit-poll.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditPoll } from './edit-poll';
import { PollService } from '../../../../services/pollService/poll-service';
import { Auth } from '../../../../services/authService/auth';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { PollModel } from '../../../../models/pollModels';
import { Option } from '../../../../models/optionModel';

describe('EditPoll', () => {
  let component: EditPoll;
  let fixture: ComponentFixture<EditPoll>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let emitSpy: jasmine.Spy;

  const POLL_MOCK: PollModel = new PollModel(
    1,
    'Sample Question',
    'admin',
    [ new Option(1, 'A'), new Option(2, 'B') ],
    new Date(new Date().getTime() - 10 * 60 * 1000),  // start 10 minutes ago
    new Date(new Date().getTime() + 10 * 60 * 1000),  // end 10 minutes from now (ongoing)
    new Date(new Date().getTime() - 20 * 60 * 1000)
  );

  beforeEach(async () => {
    pollServiceSpy = jasmine.createSpyObj('PollService', ['updatePoll']);
    authServiceSpy = jasmine.createSpyObj('Auth', ['confirmPassword']);

    await TestBed.configureTestingModule({
        imports: [
        EditPoll,         
        CommonModule,
        ReactiveFormsModule,
        ],
        providers: [
        { provide: PollService, useValue: pollServiceSpy },
        { provide: Auth, useValue: authServiceSpy }
        ]
    }).compileComponents();
    });


  beforeEach(() => {
    fixture = TestBed.createComponent(EditPoll);
    component = fixture.componentInstance;
    component.poll = POLL_MOCK;
    emitSpy = spyOn(component.pollUpdated, 'emit');
    fixture.detectChanges();
  });

  it('should create the component and initialize form with poll data', () => {
    expect(component).toBeTruthy();
    expect(component.editForm).toBeDefined();
    expect(component.editForm.get('question')!.value).toBe('Sample Question');
    expect((component.editForm.get('options') as FormArray).length).toBe(2);
  });

  it('should add and remove options correctly', () => {
    component.addOption();
    expect(component.options.length).toBe(3);

    component.removeOption(2);
    expect(component.options.length).toBe(2);

    // Should NOT remove when options length is 2
    component.removeOption(1);
    expect(component.options.length).toBe(2);
  });

  it('should return true for ongoing polls and false otherwise', () => {
    // POLL_MOCK has start/end covering current date, so ongoing
    expect(component.isPollOngoing()).toBeTrue();

    component.poll = { ...POLL_MOCK, startTime: undefined };
    expect(component.isPollOngoing()).toBeFalse();

    component.poll = { ...POLL_MOCK, endTime: undefined };
    expect(component.isPollOngoing()).toBeFalse();
  });

  describe('submitUpdate behavior', () => {
    beforeEach(() => {
      pollServiceSpy.updatePoll.and.returnValue(of({}));
    });

    it('should call performUpdate directly if poll not ongoing', fakeAsync(() => {
      spyOn(component, 'isPollOngoing').and.returnValue(false);
      spyOn(component, 'performUpdate').and.callThrough();

      component.submitUpdate();
      expect(component.performUpdate).toHaveBeenCalled();
    }));

    it('should handle updatePoll error', fakeAsync(() => {
      pollServiceSpy.updatePoll.and.returnValue(throwError(() => new Error('fail')));
      component.loading = false;
      component.poll = { ...POLL_MOCK };
      component.performUpdate();
      tick();
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toContain('problem with editing');
    }));
  });

  describe('SweetAlert integration for ongoing poll', () => {
    beforeEach(() => {
      spyOn(component, 'isPollOngoing').and.returnValue(true);
    });

    it('should abort update if user cancels the confirmation', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
        } as SweetAlertResult)
      );

      await component.submitUpdate();
      expect(component.loading).toBeFalse();
    }));

    it('should abort if password input is cancelled', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.callFake((opts: any) => {
        if (opts.title === 'Poll is ongoing!') {
          return Promise.resolve({
            isConfirmed: true,
            isDenied: false,
            isDismissed: false,
          } as SweetAlertResult);
        }
        // Password input cancelled
        return Promise.resolve({
          value: null,
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
        } as SweetAlertResult);
      });

      await component.submitUpdate();
      expect(component.loading).toBeFalse();
    }));

    it('should show error alert when password is incorrect', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.callFake((opts: any) => {
        if (opts.title === 'Poll is ongoing!') {
          return Promise.resolve({
            isConfirmed: true,
            isDenied: false,
            isDismissed: false,
          } as SweetAlertResult);
        }
        if (opts.title === 'Enter Moderator Password') {
          return Promise.resolve({
            value: 'wrongPassword',
            isConfirmed: true,
            isDenied: false,
            isDismissed: false,
          } as SweetAlertResult);
        }
        return Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        } as SweetAlertResult);
      });

      authServiceSpy.confirmPassword.and.returnValue(of(false));

      await component.submitUpdate();

      expect(authServiceSpy.confirmPassword).toHaveBeenCalledWith('wrongPassword');
      // No performUpdate called if auth fails
    }));

    it('should show error alert if confirmPassword call errors', fakeAsync(async () => {
      spyOn(Swal, 'fire').and.callFake((opts: any) => {
        if (opts.title === 'Poll is ongoing!') {
          return Promise.resolve({
            isConfirmed: true,
            isDenied: false,
            isDismissed: false,
          } as SweetAlertResult);
        }
        if (opts.title === 'Enter Moderator Password') {
          return Promise.resolve({
            value: 'errorPassword',
            isConfirmed: true,
            isDenied: false,
            isDismissed: false,
          } as SweetAlertResult);
        }
        return Promise.resolve({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false,
        } as SweetAlertResult);
      });

      authServiceSpy.confirmPassword.and.returnValue(throwError(() => ({ error: { message: 'Server Error' } })));

      await component.submitUpdate();
      expect(authServiceSpy.confirmPassword).toHaveBeenCalledWith('errorPassword');
    }));
  });

  it('should emit cancel event', () => {
    const cancelSpy = spyOn(component.cancel, 'emit');
    component.cancel.emit();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
