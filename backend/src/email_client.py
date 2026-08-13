import json

async def send_smtp_email(env, recipient_email: str, subject: str, body_text: str):
    smtp_user = getattr(env, "SMTP_USER", None)
    smtp_pass = getattr(env, "SMTP_PASS", None)
    
    if not smtp_user or not smtp_pass:
        print("SMTP credentials (SMTP_USER or SMTP_PASS) not configured. Skipping email send.")
        return

    payload = {
        "smtp_user": smtp_user,
        "smtp_pass": smtp_pass,
        "to": recipient_email,
        "subject": subject,
        "body": body_text
    }

    url = "https://namo-jan-connect-email.kushagra-singh0602.workers.dev"

    in_workers = False
    try:
        import js
        from pyodide.ffi import to_js
        in_workers = True
    except ImportError:
        pass

    if in_workers:
        try:
            js_payload = to_js(payload)
            body_str = js.JSON.stringify(js_payload)
            options = to_js({
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body_str
            })
            response = await js.fetch(url, options)
            if not response.ok:
                error_text = await response.text()
                print(f"Failed to send email via JS bridge: {response.status} {error_text}")
            else:
                print("Email sent successfully via JS bridge worker.")
        except Exception as e:
            print(f"Error calling JS email bridge: {e}")
    else:
        try:
            import urllib.request
            import asyncio
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            def do_request():
                with urllib.request.urlopen(req) as r:
                    return r.read().decode("utf-8")
            loop = asyncio.get_event_loop()
            res = await loop.run_in_executor(None, do_request)
            print(f"Local SMTP bridge response: {res}")
        except Exception as e:
            print(f"Error calling SMTP bridge locally: {e}")
