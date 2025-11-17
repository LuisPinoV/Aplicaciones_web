<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultaExamen extends Model
{
    protected $table = 'ConsultaExamen';
    protected $primaryKey = 'idConsultaExamen';
    public $timestamps = false;

    protected $fillable = [
        'idConsulta',
        'idExamen'
    ];

    public function consulta()
    {
        return $this->belongsTo(Consulta::class, 'idConsulta');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'idExamen');
    }
}
