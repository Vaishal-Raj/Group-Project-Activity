import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterModerator } from './register-moderator';

describe('RegisterModerator', () => {
  let component: RegisterModerator;
  let fixture: ComponentFixture<RegisterModerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterModerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterModerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
