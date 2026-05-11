import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaProductos } from './categoria-productos';

describe('CategoriaProductos', () => {
  let component: CategoriaProductos;
  let fixture: ComponentFixture<CategoriaProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
