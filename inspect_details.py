import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

base = r'c:\Users\sunda\OneDrive\Desktop\nexusapaar\stitch_design\stitch_nexus_apaar_platform'

def inspect(name):
    p = os.path.join(base, name, 'code.html')
    if not os.path.exists(p): return
    with open(p, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract main tag or body content
    m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    body = m.group(1) if m else html
    
    # Strip scripts, styles
    body = re.sub(r'<script.*?</script>', '', body, flags=re.DOTALL)
    body = re.sub(r'<style.*?</style>', '', body, flags=re.DOTALL)
    
    # Find all headings, forms, tables, key divs
    headings = re.findall(r'<h[1-4][^>]*>.*?</h[1-4]>', body, re.DOTALL)
    clean_h = [re.sub(r'<[^>]+>', '', h).strip() for h in headings]
    
    print(f"==================================================")
    print(f"SCREEN: {name}")
    print(f"Headings: {clean_h}")
    # Search for key action buttons / inputs
    inputs = re.findall(r'<input[^>]*placeholder=[\"\']([^\"\']*)[\"\']', body)
    print(f"Inputs placeholders: {inputs}")
    buttons = re.findall(r'<button[^>]*>(.*?)</button>', body, re.DOTALL)
    clean_b = [re.sub(r'<[^>]+>', '', b).strip() for b in buttons if re.sub(r'<[^>]+>', '', b).strip()]
    print(f"Buttons: {clean_b[:8]}")
    tables = re.findall(r'<th[^>]*>(.*?)</th>', body, re.DOTALL)
    clean_th = [re.sub(r'<[^>]+>', '', th).strip() for th in tables]
    if clean_th:
        print(f"Table Headers: {clean_th[:10]}")
    print()

screens = [
    'nexus_apaar_landing_page',
    'nexus_apaar_student_login',
    'nexus_apaar_college_admin_login',
    'nexus_apaar_student_dashboard',
    'nexus_apaar_student_profile',
    'nexus_apaar_academic_credits',
    'nexus_apaar_admission_enrolment',
    'nexus_apaar_credit_transfer_requests',
    'nexus_apaar_student_identity_verification',
    'nexus_apaar_college_admin_dashboard',
    'nexus_apaar_department_seat_capacity',
    'nexus_apaar_student_records_management',
    'nexus_apaar_reports_analytics',
    'nexus_apaar_notifications_audit_logs'
]

for s in screens:
    inspect(s)
