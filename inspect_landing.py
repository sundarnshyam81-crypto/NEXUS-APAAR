import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\sunda\OneDrive\Desktop\nexusapaar\stitch_design\stitch_nexus_apaar_platform\nexus_apaar_landing_page\code.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_start = html.find('<body')
print(html[body_start:body_start+5000])
