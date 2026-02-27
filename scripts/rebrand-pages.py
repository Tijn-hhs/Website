import os, re

pages_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'pages')

files = [
    'UniversityApplicationPage.tsx', 'FundingScholarshipPage.tsx', 'StudentVisaPage.tsx',
    'CodiceFiscalePage.tsx', 'BeforeDeparturePage.tsx', 'ImmigrationRegistrationPage.tsx',
    'HousingPage.tsx', 'BankingPage.tsx', 'InsurancePage.tsx', 'HealthcarePage.tsx',
    'CostOfLivingPage.tsx', 'InformationCentrePage.tsx', 'BuddySystemPage.tsx',
    'FindYourPeersPage.tsx', 'AISupportPage.tsx', 'MySituationPage.tsx',
    'OnboardingBuildingPage.tsx',
]

replacements = [
    (r'\btext-blue-600\b', 'text-[#8870FF]'),
    (r'\btext-blue-700\b', 'text-[#6a54e0]'),
    (r'\btext-blue-800\b', 'text-[#5b3fd4]'),
    (r'\btext-blue-500\b', 'text-[#8870FF]'),
    (r'\btext-blue-400\b', 'text-[#a594ff]'),
    (r'\bbg-blue-600\b',   'bg-[#8870FF]'),
    (r'\bbg-blue-500\b',   'bg-[#8870FF]'),
    (r'\bbg-blue-100\b',   'bg-[#F0EDFF]'),
    (r'bg-blue-50/40',     'bg-[#F0EDFF]/40'),
    (r'\bbg-blue-50\b',    'bg-[#F0EDFF]'),
    (r'\bborder-blue-300\b', 'border-[#a594ff]'),
    (r'\bborder-blue-200\b', 'border-[#D9D3FB]'),
    (r'\bborder-blue-100\b', 'border-[#EDE9D8]'),
    (r'\bhover:bg-blue-100\b', 'hover:bg-[#E8E4FF]'),
    (r'\bhover:bg-blue-50\b',  'hover:bg-[#F0EDFF]'),
    (r'\bhover:text-blue-700\b', 'hover:text-[#6a54e0]'),
    (r'\bhover:text-blue-600\b', 'hover:text-[#8870FF]'),
    (r'\bhover:border-blue-300\b', 'hover:border-[#a594ff]'),
    ("'bg-slate-900 text-white shadow-sm'",   "'bg-[#8870FF] text-white shadow-sm'"),
    ("'bg-slate-900 text-white font-semibold'","'bg-[#8870FF] text-white font-semibold'"),
]

for fname in files:
    path = os.path.join(pages_dir, fname)
    if not os.path.exists(path):
        print(f'SKIP (not found): {fname}')
        continue
    with open(path, 'r') as f:
        content = f.read()
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f'OK: {fname}')
    else:
        print(f'NO CHANGE: {fname}')
