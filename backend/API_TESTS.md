# Triumph CRM - Postman Testing Guide

This guide covers all edge cases for the currently implemented endpoints to help you test them using Postman. 

## 1. System Health Check

### `GET /health`
Validates that all backend subsystems are working and properly configured.

- **URL:** `http://localhost:5000/health`
- **Method:** `GET`
- **Edge Cases to Test:**
  1. **All Services Up:** Start Redis & Postgres. Request should return `status: "ok"` and `200 OK`.
  2. **Database Down:** Stop Postgres container (`docker stop postgres_crm`). Request should return `status: "error"`, `database: "unhealthy"` and `503 Service Unavailable`.
  3. **Redis Down:** Stop Redis container (`docker stop redis_crm`). Request should return `status: "error"`, `redis: "unhealthy"` and `503 Service Unavailable`.

---

## 2. Authentication (Better Auth)

Better Auth handles routes implicitly under `/api/v1/auth/*`. 

### A. Sign Up (Email & Password)
- **URL:** `http://localhost:5000/api/v1/auth/sign-up/email`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "testuser@triumph.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }
  ```
- **Edge Cases to Test:**
  1. **Success (200):** Valid email and password. Returns user object & sets Session cookies.
  2. **Duplicate Email (400/409):** Try registering the same email again. Should fail.
  3. **Weak Password (400):** Try password `123`. Better Auth will reject it.
  4. **Invalid Email (400):** Try email `testuser.com`. Should fail format validation.

### B. Sign In (Email & Password)
- **URL:** `http://localhost:5000/api/v1/auth/sign-in/email`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "testuser@triumph.com",
    "password": "SecurePassword123!"
  }
  ```
- **Edge Cases to Test:**
  1. **Success (200):** Correct credentials. Check Postman Cookies tab to verify Session token is set.
  2. **Wrong Password (401):** Valid email but incorrect password.
  3. **Unregistered Email (401/404):** Email that does not exist in the database.
  4. **Missing Fields (400):** Send empty JSON `{}`.
  5. **Login Lockout Guard (429/403):** Enter incorrect passwords multiple times (e.g., 5+ times). The custom `loginLockoutGuard` middleware should block further attempts for a cooldown period.

### C. Verify Session / Get Current User
- **URL:** `http://localhost:5000/api/v1/auth/get-session`
- **Method:** `GET`
- **Edge Cases to Test:**
  1. **Authenticated (200):** Send request *after* logging in (Postman will automatically send the saved Session cookie). Should return user details.
  2. **Unauthenticated (401):** Clear Postman cookies and send the request. Should return unauthorized.

### D. Sign Out
- **URL:** `http://localhost:5000/api/v1/auth/sign-out`
- **Method:** `POST`
- **Edge Cases to Test:**
  1. **Success (200):** Call after login. The session cookie will be invalidated/cleared.
  2. **Call Get Session (401):** After signing out, `/get-session` should now fail.

### E. Send Verification OTP
- **URL:** `http://localhost:5000/api/v1/auth/email-otp/send-verification-otp`
- **Method:** `POST`
- **Edge Cases to Test:**
  1. **OTP Rate Limiter (429):** Call this endpoint multiple times in quick succession. The `otpRateLimiter` middleware should block the IP from spamming OTP requests.

---

## 3. Users Module

### A. Get My Profile (Custom Route)
- **URL:** `http://localhost:5000/api/v1/users/me`
- **Method:** `GET`
- **Edge Cases to Test:**
  1. **Success (200):** Send request with valid authentication cookie. Should return `{ "success": true, "data": { ...user } }`.
  2. **Unauthenticated (401):** Send without a valid cookie. The `requireAuth` middleware should block the request.

---

## Postman Setup Tips:
1. **Cookies:** Make sure Postman's "Cookies" setting is enabled so it captures the `better-auth.session_token` automatically after login.
2. **Environment Variables:** You can create a Postman Environment with a `{{BASE_URL}}` variable set to `http://localhost:5000` to easily switch between local and production.
