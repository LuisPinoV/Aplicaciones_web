import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FichasMedicasPage } from './fichas-medicas.page';

describe('FichasMedicasPage', () => {
  let component: FichasMedicasPage;
  let fixture: ComponentFixture<FichasMedicasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FichasMedicasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
