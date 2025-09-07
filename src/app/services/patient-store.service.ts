import { Injectable } from '@angular/core';

export interface Patient {
  name: string;
  rut: string;
  avatarUrl: string | null;
  birthdate?: string;
  age?: number;
  sex?: 'F' | 'M' | string;
  bloodGroup?: string;
  phone?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientStoreService {
  private _patients: Patient[] = [
    {
      name: 'Ignacia Herrera',
      rut: '11.111.111-1',
      avatarUrl: null,
      birthdate: '2001-03-10',
      sex: 'F',
      bloodGroup: 'O+',
      phone: '+56 9 1234 5678',
      email: 'ignacia.herrera@gmail.com'
    },
    {
      name: 'Felipe Soto',
      rut: '12.345.678-9',
      avatarUrl: null,
      birthdate: '1998-07-22',
      sex: 'M',
      bloodGroup: 'A-',
      phone: '+56 9 9876 5432',
      email: 'felipe.soto@gmail.com'
    },
    {
      name: 'Álvaro Núñez',
      rut: '20.123.456-7',
      avatarUrl: null,
      birthdate: '1995-11-05',
      sex: 'M',
      bloodGroup: 'B+',
      phone: '+56 9 2345 6789',
      email: 'alvaro.nunez@gmail.com'
    },
    {
      name: 'Becky Armstrong',
      rut: '53.273.123-3',
      avatarUrl: null,
      birthdate: '2002-12-05',
      sex: 'F',
      bloodGroup: 'A-',
      phone: '+56 9 6246 1971',
      email: 'becky.armstrong@gmail.com'
    },
    {
      name: 'Charles Leclerc',
      rut: '12.823.302-1',
      avatarUrl: null,
      birthdate: '1997-10-16',
      sex: 'M',
      bloodGroup: 'B+',
      phone: '+56 9 3123 7352',
      email: 'charles.leclerc@gmail.com'
    },
    {
      name: 'Oscar Piastri',
      rut: '20.123.456-7',
      avatarUrl: null,
      birthdate: '2001-04-06',
      sex: 'M',
      bloodGroup: 'B+',
      phone: '+56 9 9921 85722',
      email: 'oscar.piastri@gmail.com'
    }
  ];

  all(): Patient[] {
    return this._patients;
  }

  getByRut(rut: string): Patient | null {
    const clean = this.cleanRut(rut);
    return this._patients.find(p => this.cleanRut(p.rut) === clean) ?? null;
  }

  private cleanRut(s: string): string {
    return (s || '')
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\-/g, '')
      .replace(/[^0-9k]/g, '');
  }

  add(p: Patient): void {
    const clean = this.cleanRut(p.rut);
    const exists = this._patients.some(x => this.cleanRut(x.rut) === clean);
    if (!exists) this._patients.push(p);
  }

}
