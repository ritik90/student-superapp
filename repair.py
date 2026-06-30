import os

files = [
    'app/marketplace/[id]/page.tsx',
    'app/users/[id]/page.tsx',
]

# The broken pattern - multiline anchor tag split across 6 lines
broken = (
    '<a\n'
    '            href="/marketplace"\n'
    '            className="text-xs text-slate-400 hover:text-sky-300"\n'
    '          >\n'
    '            \u2190 Back to marketplace\n'
    '          </a>'
)

# What it should be - single line
fixed = '<a href="/marketplace" className="text-xs text-slate-400 hover:text-sky-300">\u2190 Back to marketplace</a>'

for fname in files:
    if not os.path.exists(fname):
        print(f'SKIP (not found): {fname}')
        continue

    txt = open(fname, 'r', encoding='utf-8').read()
    new_txt = txt.replace(broken, fixed)

    if new_txt == txt:
        print(f'No broken pattern found in: {fname}')
        # Try with different indentation
        for indent in ['  ', '    ', '      ', '        ', '          ', '            ']:
            b2 = (
                indent + '<a\n' +
                indent + '  href="/marketplace"\n' +
                indent + '  className="text-xs text-slate-400 hover:text-sky-300"\n' +
                indent + '>\n' +
                indent + '  \u2190 Back to marketplace\n' +
                indent + '</a>'
            )
            new_txt2 = txt.replace(b2, fixed)
            if new_txt2 != txt:
                open(fname, 'w', encoding='utf-8').write(new_txt2)
                print(f'Fixed (indent={len(indent)}): {fname}')
                break
        else:
            print(f'Could not auto-fix: {fname} -- open in VS Code, go to the error line, and collapse the <a> tag to one line manually')
    else:
        open(fname, 'w', encoding='utf-8').write(new_txt)
        print(f'Fixed: {fname}')

print('\nDone. Now run: npm run build')