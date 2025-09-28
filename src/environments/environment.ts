// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  servicios: {
    pacientes: 'http://localhost:4002/pacientes',
    diagnosticos: 'http://localhost:4003/diagnosticos',
    hospitalizaciones: 'http://localhost:4004/hospitalizaciones',
    consultas: 'http://localhost:4005/consultas',
    alergias: 'http://localhost:4006/alergias',
    procedimientos: 'http://localhost:4007/procedimientos',
    medicamentos: 'http://localhost:4008/medicamentos',
    examenes: 'http://localhost:4009/examenes',
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
