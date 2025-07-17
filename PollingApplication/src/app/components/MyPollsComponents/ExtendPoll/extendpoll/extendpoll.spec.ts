import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Extendpoll } from './extendpoll';

describe('Extendpoll', () => {
  let component: Extendpoll;
  let fixture: ComponentFixture<Extendpoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Extendpoll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Extendpoll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
