import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPoll } from './my-poll';

describe('MyPoll', () => {
  let component: MyPoll;
  let fixture: ComponentFixture<MyPoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPoll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPoll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
