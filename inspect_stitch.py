import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

base = r'c:\Users\sunda\OneDrive\Desktop\nexusapaar\stitch_design\stitch_nexus_apaar_platform'
for item in sorted(os.listdir(base)):
    p = os.path.join(base, item, 'code.html')
    if not os.path.exists(p): 
        continue
    with open(p, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract headers
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    h2 = re.findall(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL)
    clean_h1 = [re.sub(r'<[^>]+>', '', x).strip() for x in h1]
    clean_h2 = [re.sub(r'<[^>]+>', '', x).strip() for x in h2]
    
    # Extract nav links
    navs = re.findall(r'<a[^>]*class=\"[^\"]*font-label[^\"]*\"[^>]*>(.*?)</a>', html, re.DOTALL)
    clean_navs = [re.sub(r'<[^>]+>', '', x).strip() for x in navs if len(re.sub(r'<[^>]+>', '', x).strip()) > 0]
    
    # Extract main cards / sections
    cards = re.findall(r'<h3[^>]*>(.*?)</h3>', html, re.DOTALL)
    clean_cards = [re.sub(r'<[^>]+>', '', x).strip() for x in cards[:6]]
    
    print(f"=== {item} ===")
    print("  H1:", clean_h1)
    print("  H2:", clean_h2[:3])
    print("  Nav:", clean_navs[:6])
    print("  H3 Cards:", clean_cards)
    print()
