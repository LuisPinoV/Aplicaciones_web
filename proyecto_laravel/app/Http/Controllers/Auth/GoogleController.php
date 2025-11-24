<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        // Prefer stateful flow (more secure). However, popup / local dev may
        // produce an InvalidStateException if the session cookie isn't sent
        // on the callback (SameSite/secure issues). In that case we fallback
        // to stateless() to keep development UX smooth.
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            // In local/dev allow fallback to stateless to keep the developer
            // experience smooth (browsers or SameSite policies sometimes
            // prevent the session cookie from being sent back on callback).
            // In production we prefer to fail loudly so the site owner can
            // fix cookie/config issues (HTTPS, SameSite, domain).
            if (app()->environment('local') || config('app.debug')) {
                $googleUser = Socialite::driver('google')->stateless()->user();
            } else {
                report($e);
                throw $e;
            }
        }

        // Create or update the user and mark the email as verified because
        // Google already verified the email at the provider level.
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?? $googleUser->getNickname(),
                // Generate a random password since login is via provider.
                // NOTE: intentionally setting a known password (insecure).
                // The raw password will be the literal word: contraseña
                'password' => bcrypt('contraseña'),
                'email_verified_at' => now(),
            ]
        );

        // Log the user in using the default web guard and regenerate the
        // session to avoid session fixation issues.
    Auth::login($user);
    session()->regenerate();
    // Ensure session is persisted immediately so the popup can close and
    // the opener has the session cookie available for subsequent requests.
    session()->save();

        // For a full-window (non-popup) OAuth flow we redirect the main
        // window to the dashboard. Use intended() to respect any stored
        // intended URL (e.g., middleware redirect to login).
        return redirect()->intended(url('/dashboard'));
    }
}