<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaMedicaAlergia extends Model
{
    protected $table = 'FichaMedicaAlergia';
    protected $primaryKey = 'idFichaMedicaAlergia';
    public $timestamps = false;

    protected $fillable = [
        'idFichaMedica',
        'idAlergia',
        'fecha'
    ];

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }

    public function alergia()
    {
        return $this->belongsTo(Alergia::class, 'idAlergia');
    }
}
