import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarPacientePage } from './editar-paciente.page';

describe('EditarPacientePage', () => {
  let component: EditarPacientePage;
  let fixture: ComponentFixture<EditarPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
