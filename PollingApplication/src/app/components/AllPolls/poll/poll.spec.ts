import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poll } from './poll';

describe('Poll', () => {
  let component: Poll;
  let fixture: ComponentFixture<Poll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Poll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
