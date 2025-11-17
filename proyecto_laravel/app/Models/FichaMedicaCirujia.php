<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaMedicaCirujia extends Model
{
    protected $table = 'FichaMedicaCirujia';
    protected $primaryKey = 'idFichaMedicaCirujia';
    public $timestamps = false;

    protected $fillable = [
        'idFichaMedica',
        'idCirujia',
        'fecha'
    ];

    public function fichaMedica()
    {
        return $this->belongsTo(FichaMedica::class, 'idFichaMedica');
    }

    public function cirujia()
    {
        return $this->belongsTo(Cirujia::class, 'idCirujia');
    }
}
