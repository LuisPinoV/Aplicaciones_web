<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultaMedicamento extends Model
{
    protected $table = 'ConsultaMedicamento';
    protected $primaryKey = 'idConsultaMedicamento';
    public $timestamps = false;

    protected $fillable = [
        'idMedicamento',
        'idConsulta',
        'cantidad',
        'formato',
        'tiempoConsumo',
        'frecuenciaConsumo'
    ];

    public function consulta()
    {
        return $this->belongsTo(Consulta::class, 'idConsulta');
    }

    public function medicamento()
    {
        return $this->belongsTo(Medicamento::class, 'idMedicamento');
    }
}
