<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaMedicaEnfermedad extends Model
{
    protected $table = 'FichaMedicaEnfermedad';
    protected $primaryKey = 'idFichaMedicaEnfermedad';
    public $timestamps = false;

    protected $fillable = [
        'idFichaMedica',
        'idEnfermedad',
        'fecha'
    ];

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }

    public function enfermedad()
    {
        return $this->belongsTo(Enfermedad::class, 'idEnfermedad');
    }
}
