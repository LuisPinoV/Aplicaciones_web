<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cirujia extends Model
{
    protected $table = 'cirujia';
    protected $primaryKey = 'idCirujia';
    protected $fillable = ['idTipoCirujia','nombre','descripcion'];

    public function tipo()
    {
        return $this->belongsTo(TipoCirujia::class, 'idTipoCirujia');
    }

    public function fichaMedicaCirujias()
    {
        return $this->hasMany(FichaMedicaCirujia::class, 'idCirujia');
    }
}
