import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FichaMedicaPage } from './ficha-medica.page';

describe('FichaMedicaPage', () => {
  let component: FichaMedicaPage;
  let fixture: ComponentFixture<FichaMedicaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FichaMedicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
