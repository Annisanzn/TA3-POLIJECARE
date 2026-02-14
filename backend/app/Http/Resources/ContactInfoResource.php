<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'instagram' => $this->instagram,
            'whatsapp' => $this->whatsapp ?? '+6281234567890',
        ];
    }
}
