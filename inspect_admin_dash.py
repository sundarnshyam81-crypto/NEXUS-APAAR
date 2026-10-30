import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\sunda\OneDrive\Desktop\nexusapaar\stitch_design\stitch_nexus_apaar_platform\nexus_apaar_college_admin_dashboard\code.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_start = html.find('<main')
print(html[body_start:body_start+4500])
