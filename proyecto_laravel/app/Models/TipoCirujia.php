<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoCirujia extends Model
{
    protected $table = 'tipocirujia';
    protected $primaryKey = 'idTipoCirujia';
    protected $fillable = ['tipoCirujia'];

    public function cirujias()
    {
        return $this->hasMany(Cirujia::class, 'idTipoCirujia');
    }
}
