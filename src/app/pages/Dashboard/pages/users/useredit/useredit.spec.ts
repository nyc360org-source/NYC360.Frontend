import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Useredit } from './useredit';

describe('Useredit', () => {
  let component: Useredit;
  let fixture: ComponentFixture<Useredit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Useredit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Useredit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
