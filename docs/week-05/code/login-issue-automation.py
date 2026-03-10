import json
import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from unittest.mock import MagicMock

# ─────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("automation.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# CONFIGURATION (replace with real values)
# ─────────────────────────────────────────────
CONFIG = {
    # Odoo API
    "odoo_url": "https://mindx2.odoo.com",
    "odoo_db": "mindx2",
    "odoo_user": "lannn@mindx.com.vn",
    "odoo_password": "YOUR_API_KEY",
    # HR System API (mock endpoint)
    "hr_api_url": "YOUR_HR_API_URL",
    "hr_api_key": "YOUR_HR_API_KEY",
    # LMS API
    "lms_api_url": "YOUR_LMS_API_URL",
    "lms_api_key": "YOUR_LMS_API_KEY",
    # Email (SMTP)
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "support@mindx.edu.vn",
    "smtp_password": "YOUR_EMAIL_PASSWORD",
    "support_email": "support@mindx.edu.vn",
    # Automation behavior
    "auto_reactivate": True,          # Set False to run in dry-run mode
    "notify_on_escalation": True,
}

# Keywords that identify a login issue ticket
LOGIN_KEYWORDS = [
    "login", "log in", "đăng nhập", "không vào được",
    "invalid username", "invalid password", "sai mật khẩu",
    "cannot login", "can't login", "không đăng nhập",
    "lỗi đăng nhập", "password", "mật khẩu",
]


# ─────────────────────────────────────────────
# STEP 1 – TICKET CLASSIFIER
# ─────────────────────────────────────────────
def is_login_issue(ticket: dict) -> bool:
    """
    Analyze ticket content to determine if it is a login issue.
    Returns True if login keywords are found in subject or description.
    """
    text = (
        (ticket.get("name", "") + " " + ticket.get("description", "")).lower()
    )
    matched = [kw for kw in LOGIN_KEYWORDS if kw in text]
    if matched:
        log.info(f"[Classifier] Login issue detected. Matched keywords: {matched}")
        return True
    log.info("[Classifier] Not a login issue — skipping automation.")
    return False


def extract_user_email(ticket: dict) -> str | None:
    """Extract reporter email from ticket partner info."""
    partner = ticket.get("partner_id")
    if isinstance(partner, dict):
        return partner.get("email")
    # Fallback: parse from description
    desc = ticket.get("description", "")
    for line in desc.split("\n"):
        if "@" in line and "." in line:
            parts = line.strip().split()
            for part in parts:
                if "@" in part:
                    return part.strip(".,<>")
    return None


# ─────────────────────────────────────────────
# STEP 2 – HR STATUS CHECK
# ─────────────────────────────────────────────
def check_hr_status(email: str) -> dict:
    """
    Query HR system for employee and account status.

    Returns dict:
        {
            "found": bool,
            "employment_status": "active" | "terminated" | "unknown",
            "account_status": "active" | "deactivated" | "unknown",
            "employee_name": str,
        }

    NOTE: In production, replace mock with real HTTP call:
        import requests
        resp = requests.get(
            f"{CONFIG['hr_api_url']}/employee",
            params={"email": email},
            headers={"Authorization": f"Bearer {CONFIG['hr_api_key']}"},
        )
        return resp.json()
    """
    log.info(f"[HR Check] Querying HR system for: {email}")

    # ── MOCK RESPONSE (simulates real HR API) ──────────────────────────────
    MOCK_HR_DATABASE = {
        "nguyen.van.a@mindx.edu.vn": {
            "found": True,
            "employment_status": "active",
            "account_status": "deactivated",   # <── triggers reactivation
            "employee_name": "Nguyễn Văn A",
        },
        "terminated.user@mindx.edu.vn": {
            "found": True,
            "employment_status": "terminated",
            "account_status": "deactivated",
            "employee_name": "Former Employee",
        },
    }
    result = MOCK_HR_DATABASE.get(
        email,
        {
            "found": False,
            "employment_status": "unknown",
            "account_status": "unknown",
            "employee_name": "Unknown",
        },
    )
    # ── END MOCK ────────────────────────────────────────────────────────────

    log.info(f"[HR Check] Result: {result}")
    return result


# ─────────────────────────────────────────────
# STEP 3 – DECISION LOGIC
# ─────────────────────────────────────────────
def decide_action(hr_status: dict) -> dict:
    """
    Apply decision logic based on HR status.

    Returns:
        {
            "action": "reactivate" | "reset_password" | "escalate",
            "reason": str,
            "auto_handle": bool,
        }
    """
    emp = hr_status.get("employment_status")
    acc = hr_status.get("account_status")

    if emp == "active" and acc == "deactivated":
        return {
            "action": "reactivate",
            "reason": "Employee is active but account was deactivated (30-day inactivity rule).",
            "auto_handle": True,
        }
    elif emp == "active" and acc == "active":
        return {
            "action": "reset_password",
            "reason": "Account is active — likely a password issue. Sending reset link.",
            "auto_handle": True,
        }
    elif emp == "terminated":
        return {
            "action": "escalate",
            "reason": "Employee is terminated. Manual review required before any action.",
            "auto_handle": False,
        }
    else:
        return {
            "action": "escalate",
            "reason": f"Unknown status (employment={emp}, account={acc}). Escalating to human.",
            "auto_handle": False,
        }


# ─────────────────────────────────────────────
# STEP 4 – ACTION EXECUTION
# ─────────────────────────────────────────────
def reactivate_lms_account(email: str) -> bool:
    """
    Reactivate LMS account for the given email.

    NOTE: In production, replace mock with real API call:
        import requests
        resp = requests.post(
            f"{CONFIG['lms_api_url']}/users/reactivate",
            json={"email": email},
            headers={"Authorization": f"Bearer {CONFIG['lms_api_key']}"},
        )
        return resp.status_code == 200
    """
    log.info(f"[LMS] Reactivating account for: {email}")
    if not CONFIG["auto_reactivate"]:
        log.info("[LMS] Dry-run mode — skipping actual reactivation.")
        return True
    # MOCK: always succeeds
    log.info(f"[LMS] [v] Account reactivated: {email}")
    return True


def send_password_reset(email: str) -> bool:
    """Send password reset link via LMS API."""
    log.info(f"[LMS] Sending password reset link to: {email}")
    # MOCK: always succeeds
    log.info(f"[LMS] [v] Password reset email sent to: {email}")
    return True


def update_odoo_ticket(ticket_id: int, stage: str, log_note: str) -> bool:
    """
    Update Odoo ticket stage and add an internal log note.

    NOTE: In production, use xmlrpc.client:
        import xmlrpc.client
        common = xmlrpc.client.ServerProxy(f"{CONFIG['odoo_url']}/xmlrpc/2/common")
        uid = common.authenticate(CONFIG['odoo_db'], CONFIG['odoo_user'],
                                  CONFIG['odoo_password'], {})
        models = xmlrpc.client.ServerProxy(f"{CONFIG['odoo_url']}/xmlrpc/2/object")
        # Add log note
        models.execute_kw(CONFIG['odoo_db'], uid, CONFIG['odoo_password'],
            'mail.message', 'create', [{
                'res_id': ticket_id,
                'model': 'helpdesk.ticket',
                'body': log_note,
                'message_type': 'comment',
                'subtype_xmlid': 'mail.mt_note',
            }])
    """
    log.info(f"[Odoo] Updating ticket #{ticket_id} → stage: {stage}")
    log.info(f"[Odoo] Log note: {log_note}")
    # MOCK: always succeeds
    return True


# ─────────────────────────────────────────────
# STEP 5 – AUTO EMAIL RESPONSE
# ─────────────────────────────────────────────
EMAIL_TEMPLATES = {
    "reactivate": {
        "subject": "RE: Không thể đăng nhập vào LMS - Đã xử lý - Ticket #{ticket_id}",
        "body": """Chào {name},

Team đã kiểm tra và phát hiện tài khoản của bạn đã bị deactivate trong hệ thống do không đăng nhập trong 30 ngày.

Sau khi xác nhận trạng thái nhân sự, team đã **reactivate tài khoản** cho bạn.

Bạn vui lòng thử đăng nhập lại tại: https://lms.mindx.edu.vn
Nếu vẫn gặp vấn đề, vui lòng reply email này.

Trân trọng,
MindX Support Team (Automated)
Ticket #{ticket_id}
""",
    },
    "reset_password": {
        "subject": "RE: Không thể đăng nhập vào LMS - Ticket #{ticket_id}",
        "body": """Chào {name},

Team đã kiểm tra tài khoản và nhận thấy tài khoản vẫn đang active.

Team đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả Spam/Junk).

Link đăng nhập: https://lms.mindx.edu.vn
Nếu không nhận được email reset, vui lòng reply để được hỗ trợ thêm.

Trân trọng,
MindX Support Team (Automated)
Ticket #{ticket_id}
""",
    },
    "escalate": {
        "subject": "RE: Không thể đăng nhập vào LMS - Đang xử lý - Ticket #{ticket_id}",
        "body": """Chào {name},

Team đã nhận được yêu cầu hỗ trợ của bạn. Trường hợp này cần được xem xét thêm bởi team kỹ thuật.

Team sẽ liên hệ lại với bạn trong vòng 2 giờ làm việc.

Trân trọng,
MindX Support Team
Ticket #{ticket_id}
""",
    },
}


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send email via SMTP.

    NOTE: In production, configure real SMTP credentials in CONFIG.
    For testing, this function logs instead of sending.
    """
    log.info(f"[Email] Sending to: {to_email}")
    log.info(f"[Email] Subject: {subject}")
    log.info(f"[Email] Body preview: {body[:80]}...")

    # ── MOCK: log only, do not actually send ────────────────────────────────
    # In production, uncomment below:
    # msg = MIMEMultipart()
    # msg["From"] = CONFIG["smtp_user"]
    # msg["To"] = to_email
    # msg["Subject"] = subject
    # msg.attach(MIMEText(body, "plain", "utf-8"))
    # with smtplib.SMTP(CONFIG["smtp_host"], CONFIG["smtp_port"]) as server:
    #     server.starttls()
    #     server.login(CONFIG["smtp_user"], CONFIG["smtp_password"])
    #     server.sendmail(CONFIG["smtp_user"], to_email, msg.as_string())
    # ── END MOCK ────────────────────────────────────────────────────────────

    log.info(f"[Email] [v] Email sent (mock) to: {to_email}")
    return True


# ─────────────────────────────────────────────
# MAIN AUTOMATION WORKFLOW
# ─────────────────────────────────────────────
def process_ticket(ticket: dict) -> dict:
    """
    Full automation workflow for a single Odoo helpdesk ticket.

    Steps:
        1. Classify ticket (is it a login issue?)
        2. Extract user email
        3. Check HR status
        4. Decide action
        5. Execute action (reactivate / reset / escalate)
        6. Send response email
        7. Update Odoo ticket
        8. Return result log

    Args:
        ticket: Odoo helpdesk ticket dict

    Returns:
        result dict with all decisions and outcomes
    """
    ticket_id = ticket.get("id", "N/A")
    timestamp = datetime.now().isoformat()
    result = {
        "ticket_id": ticket_id,
        "timestamp": timestamp,
        "steps": [],
    }

    log.info(f"\n{'='*60}")
    log.info(f"Processing ticket #{ticket_id}: {ticket.get('name')}")
    log.info(f"{'='*60}")

    # ── STEP 1: Classify ────────────────────────────────────────────────────
    if not is_login_issue(ticket):
        result["outcome"] = "skipped"
        result["reason"] = "Not a login issue"
        result["steps"].append("Step 1: Classified as non-login issue — skipped")
        return result
    result["steps"].append("Step 1: [v] Classified as login issue")

    # ── STEP 2: Extract email ────────────────────────────────────────────────
    email = extract_user_email(ticket)
    if not email:
        result["outcome"] = "escalated"
        result["reason"] = "Could not extract user email from ticket"
        result["steps"].append("Step 2: [X] Email extraction failed — escalated")
        update_odoo_ticket(ticket_id, "In Progress",
                           " Automation: Could not extract user email. Manual review required.")
        return result
    result["steps"].append(f"Step 2: [v] Email extracted: {email}")
    result["user_email"] = email

    # ── STEP 3: HR Status ────────────────────────────────────────────────────
    hr = check_hr_status(email)
    result["hr_status"] = hr
    result["steps"].append(
        f"Step 3: [v] HR check — employment: {hr['employment_status']}, "
        f"account: {hr['account_status']}"
    )

    # ── STEP 4: Decision ─────────────────────────────────────────────────────
    decision = decide_action(hr)
    action = decision["action"]
    result["decision"] = decision
    result["steps"].append(f"Step 4: [v] Decision → {action} ({decision['reason']})")
    log.info(f"[Decision] Action: {action} | Reason: {decision['reason']}")

    # ── STEP 5: Execute ──────────────────────────────────────────────────────
    success = False
    if action == "reactivate":
        success = reactivate_lms_account(email)
        odoo_log = (
            f"Automation: Account reactivated for {email}.\n"
            f"Reason: {decision['reason']}\n"
            f"Timestamp: {timestamp}"
        )
    elif action == "reset_password":
        success = send_password_reset(email)
        odoo_log = (
            f"Automation: Password reset email sent to {email}.\n"
            f"Reason: {decision['reason']}\n"
            f"Timestamp: {timestamp}"
        )
    else:  # escalate
        success = True
        odoo_log = (
            f"[!] Automation: Escalated to human review.\n"
            f"Reason: {decision['reason']}\n"
            f"User: {email} | Timestamp: {timestamp}"
        )

    result["steps"].append(f"Step 5: {'[v]' if success else '[x]'} Action executed: {action}")

    # ── STEP 6: Update Odoo ──────────────────────────────────────────────────
    stage = "Waiting" if decision["auto_handle"] else "In Progress"
    update_odoo_ticket(ticket_id, stage, odoo_log)
    result["steps"].append(f"Step 6: [v] Odoo ticket updated → stage: {stage}")

    # ── STEP 7: Send Email ───────────────────────────────────────────────────
    template = EMAIL_TEMPLATES[action]
    name = hr.get("employee_name", "bạn")
    subject = template["subject"].format(ticket_id=ticket_id)
    body = template["body"].format(name=name, ticket_id=ticket_id)
    send_email(email, subject, body)
    result["steps"].append(f"Step 7: [v] Response email sent ({action} template)")

    # ── FINAL RESULT ─────────────────────────────────────────────────────────
    result["outcome"] = "resolved" if decision["auto_handle"] else "escalated"
    log.info(f"\n[Result] Ticket #{ticket_id} → {result['outcome'].upper()}")
    for step in result["steps"]:
        log.info(f"  {step}")

    return result


# ─────────────────────────────────────────────
# WEBHOOK HANDLER (Flask — production entrypoint)
# ─────────────────────────────────────────────
def create_webhook_app():
    """
    Create Flask webhook app for Odoo integration.

    Setup in Odoo:
        Settings → Technical → Automation → Automated Actions
        → On ticket creation → Call webhook: POST https://server-name/webhook/ticket

    To run:
        pip install flask
        python login_issue_automation.py
    """
    try:
        from flask import Flask, jsonify, request

        app = Flask(__name__)

        @app.route("/webhook/ticket", methods=["POST"])
        def ticket_webhook():
            ticket = request.json
            log.info(f"[Webhook] Received ticket: {ticket.get('id')}")
            result = process_ticket(ticket)
            return jsonify(result), 200

        @app.route("/health", methods=["GET"])
        def health():
            return jsonify({"status": "ok", "service": "MindX Login Automation"}), 200

        return app

    except ImportError:
        log.warning("Flask not installed — webhook mode unavailable. Run: pip install flask")
        return None


# ─────────────────────────────────────────────
# DEMO / TEST RUN
# ─────────────────────────────────────────────
def run_demo():
    """
    Run automation against 3 mock ticket scenarios to demonstrate all branches.
    """
    test_tickets = [
        {
            "id": 101,
            "name": "Không thể đăng nhập vào LMS",
            "description": (
                "Chào Tech team,\n"
                "Em đang cố đăng nhập vào LMS nhưng cứ bị lỗi 'Invalid username or password'.\n"
                "Em cần truy cập tài liệu lớp học cho buổi học hôm nay.\n"
                "Cảm ơn, Giáo viên Nguyễn Văn A"
            ),
            "partner_id": {"email": "nguyen.van.a@mindx.edu.vn", "name": "Nguyễn Văn A"},
        },
        {
            "id": 102,
            "name": "Không thể đăng nhập - nhân viên đã nghỉ việc",
            "description": "login issue, invalid password",
            "partner_id": {"email": "terminated.user@mindx.edu.vn", "name": "Former Employee"},
        },
        {
            "id": 103,
            "name": "Video không phát được trong bài học",
            "description": "Video lesson 3 bị lỗi, không load được.",
            "partner_id": {"email": "someone@mindx.edu.vn", "name": "Someone"},
        },
    ]

    print("\n" + "=" * 60)
    print("  MindX Login Issue Automation — DEMO RUN")
    print("=" * 60)

    results = []
    for ticket in test_tickets:
        result = process_ticket(ticket)
        results.append(result)
        print()

    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    for r in results:
        print(f"  Ticket #{r['ticket_id']:>3} → {r['outcome'].upper():<12} | {r.get('reason', r['decision']['reason'] if 'decision' in r else '')}")

    return results


if __name__ == "__main__":
    run_demo()