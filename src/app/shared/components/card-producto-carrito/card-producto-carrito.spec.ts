import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProductoCarrito } from './card-producto-carrito';

describe('CardProductoCarrito', () => {
  let component: CardProductoCarrito;
  let fixture: ComponentFixture<CardProductoCarrito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProductoCarrito],
    }).compileComponents();

    fixture = TestBed.createComponent(CardProductoCarrito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
