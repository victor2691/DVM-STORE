import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLayoutA } from './admin-layout-a';

describe('AdminLayoutA', () => {
  let component: AdminLayoutA;
  let fixture: ComponentFixture<AdminLayoutA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutA);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
