import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Useradd } from './useradd';

describe('Useradd', () => {
  let component: Useradd;
  let fixture: ComponentFixture<Useradd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Useradd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Useradd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
