<?php

namespace App\Http\Requests\Auth;

use App\Models\Pengguna;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SikudaLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_pengguna' => ['required', 'string'],
            'kata_sandi'    => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_pengguna.required' => 'Username tidak boleh kosong.',
            'kata_sandi.required'    => 'Password tidak boleh kosong.',
        ];
    }

    /**
     * Autentikasi menggunakan guard 'sikuda' (bukan guard 'web' bawaan Breeze).
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = [
            'nama_pengguna' => $this->string('nama_pengguna'),
            'password'      => $this->string('kata_sandi'),
        ];

        if (! Auth::guard('sikuda')->attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'nama_pengguna' => __('Username atau password yang kamu masukkan salah.'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'nama_pengguna' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('nama_pengguna')) . '|' . $this->ip()
        );
    }
}
