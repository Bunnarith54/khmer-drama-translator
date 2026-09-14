# Cloud APK Build — Khmer Drama Translator v2.7

v2.7 uses GitHub Actions to build an installable debug APK in the cloud. No PC is required for the build itself.

The workflow installs Node.js 20, Java 17 and Android SDK, creates the Capacitor Android project, syncs the web build and runs Gradle `assembleDebug`.

For a phone-only walkthrough, see `PHONE_BUILD.md`.

A production APK still needs a private Android signing keystore and a deployed HTTPS backend.
