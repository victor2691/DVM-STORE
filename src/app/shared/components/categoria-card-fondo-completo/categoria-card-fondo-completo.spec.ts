import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaCardFondoCompleto } from './categoria-card-fondo-completo';

describe('CategoriaCardFondoCompleto', () => {
  let component: CategoriaCardFondoCompleto;
  let fixture: ComponentFixture<CategoriaCardFondoCompleto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaCardFondoCompleto],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaCardFondoCompleto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
