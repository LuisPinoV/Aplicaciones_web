<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consulta extends Model
{
    protected $table = 'Consulta';
    protected $primaryKey = 'idConsulta';
    protected $fillable = ['fecha','idMedico','idFichaMedica','institucionMedica','descripcion'];

    public function medico()
    {
        return $this->belongsTo(Medico::class, 'idMedico');
    }

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }

    public function ConsultaMedicamentos()
    {
        return $this->hasMany(ConsultaMedicamento::class, 'idConsulta');
    }

    public function ConsultaExamenes()
    {
        return $this->hasMany(ConsultaExamen::class, 'idConsulta');
    }
}
