<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'address',
        'phone',
        'email',
        'instagram',
        'whatsapp',
        'facebook',
        'twitter',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the formatted phone number.
     */
    public function getFormattedPhoneAttribute(): string
    {
        return $this->phone;
    }

    /**
     * Get the WhatsApp link.
     */
    public function getWhatsappLinkAttribute(): string
    {
        $phone = preg_replace('/[^0-9]/', '', $this->whatsapp ?? $this->phone);
        return "https://wa.me/{$phone}";
    }

    /**
     * Get the Instagram link.
     */
    public function getInstagramLinkAttribute(): string
    {
        $username = ltrim($this->instagram, '@');
        return "https://instagram.com/{$username}";
    }
}
