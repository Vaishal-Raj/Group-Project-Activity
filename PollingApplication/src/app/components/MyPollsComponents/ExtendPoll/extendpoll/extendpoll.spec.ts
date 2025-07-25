import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExtendpollComponent } from './extendpoll';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { PollService } from '../../../../services/pollService/poll-service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';

describe('ExtendpollComponent', () => {
  let component: ExtendpollComponent;
  let fixture: ComponentFixture<ExtendpollComponent>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PollService', ['extendPoll']);

    await TestBed.configureTestingModule({
      imports: [ExtendpollComponent, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: PollService, useValue: spy },
        provideHttpClient()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    pollServiceSpy = TestBed.inject(PollService) as jasmine.SpyObj<PollService>;
    fixture = TestBed.createComponent(ExtendpollComponent);
    component = fixture.componentInstance;

    component.pollId = 1;
    component.currentEndTime = new Date('2025-07-16T12:00:00');
    component.extensionCount = 0;
    component.maxExtensions = 2;

    fixture.detectChanges();
  });

  it('should create the component and form initialized', () => {
    expect(component).toBeTruthy();
    expect(component.extendForm).toBeDefined();
    expect(component.extendForm.controls['newEndTime']).toBeDefined();
  });

  it('should mark extensionLimitReached if extensionCount >= maxExtensions', () => {
    component.extensionCount = 3;
    component.maxExtensions = 3;
    component.ngOnInit();
    expect(component.extensionLimitReached).toBeTrue();
  });

  it('should not call extendPoll if form is invalid', () => {
    component.extendForm.setValue({ newEndTime: null });
    component.extendPoll();
    expect(pollServiceSpy.extendPoll).not.toHaveBeenCalled();
  });

  it('should show error if newEndTime is before or equal to currentEndTime', () => {
    const invalidDate = new Date('2025-07-16T11:00:00');
    component.extendForm.setValue({ newEndTime: invalidDate.toISOString() });
    component.extendPoll();
    expect(component.errorMessage).toContain('New end time must be greater');
  });

  it('should call pollService.extendPoll and emit onExtended on success', fakeAsync(() => {
    const validDate = new Date('2025-07-17T12:00:00');
    component.extendForm.setValue({ newEndTime: validDate.toISOString() });
    spyOn(Swal, 'fire');
    spyOn(component.onExtended, 'emit');
    pollServiceSpy.extendPoll.and.returnValue(of({}));

    component.extendPoll();
    tick();

    expect(pollServiceSpy.extendPoll).toHaveBeenCalledWith(1, validDate);
    expect(Swal.fire).toHaveBeenCalled();
    expect(component.onExtended.emit).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('should handle pollService.extendPoll error', fakeAsync(() => {
    const validDate = new Date('2025-07-17T12:00:00');
    component.extendForm.setValue({ newEndTime: validDate.toISOString() });
    pollServiceSpy.extendPoll.and.returnValue(throwError(() => ({ error: { message: 'Error occurred' } })));

    component.extendPoll();
    tick();

    expect(component.errorMessage).toBe('Error occurred');
    expect(component.loading).toBeFalse();
  }));

  it('should emit cancel when cancel button is clicked', () => {
    spyOn(component.cancel, 'emit');
    component.cancel.emit();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should disable submit button if extension limit is reached', () => {
    component.extensionCount = 2;
    component.maxExtensions = 2;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.extensionLimitReached).toBeTrue();
  });
});
