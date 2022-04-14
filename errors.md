Error response: 
```json
{
  "ok": false,
  "code": 400000,
  "msg": "Email is already in use",
  "data": {}
}
```

Везде ниже приводятся примеры поля `data`.

- 400:
    - 400000: Invalid payload:
        - field: str or [str];
        - reason: used, required, invalid.
    - 400001: Enable totp first;
    - 400002: Totp enabled already;
    - 400003: Totp disabled already;
    - 400004: No phone provided;
    - 400005: Email is already verified;
    - 400006: Insufficient balance;

- 401: 
    - 401000: Incorrect email and password pair;

- 403: 
    - 403000: Validate your email first;
