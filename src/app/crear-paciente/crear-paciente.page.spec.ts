import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPacientePage } from './crear-paciente.page';

describe('CrearPacientePage', () => {
  let component: CrearPacientePage;
  let fixture: ComponentFixture<CrearPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
