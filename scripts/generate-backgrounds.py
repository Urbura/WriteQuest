"""Generate compact writing-room scenery for WriteQuest's existing rank milestones."""
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]
THEMES=[
 ('beginner','Quiet Desk','#101e37','#243d5b','#83accb'),
 ('bronze','Candlelit Study','#241b26','#66412f','#d99c64'),
 ('silver','Moonlit Reading Room','#132439','#354b67','#bed4ea'),
 ('gold','Golden Library','#292119','#6c512b','#f0ce79'),
 ('platinum','Skyward Archive','#102e3c','#326b7d','#a7e6ed'),
 ('emerald','Garden Library','#112e2b','#2f6651','#7ee3ad'),
 ('diamond','Starlit Athenaeum','#152445','#3e6192','#aad9ff'),
 ('master','Author’s Observatory','#251c40','#634981','#d5b1ff'),
 ('grandmaster','Grand Author’s Hall','#29213f','#79613c','#ffe6a0'),
]
def scene(tier,key,title,dark,mid,accent):
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1000" overflow="hidden" fill="none"><title>{escape(title)}</title>',
 f'<defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="{mid}"/><stop offset="1" stop-color="{dark}"/></linearGradient><radialGradient id="light"><stop stop-color="{accent}" stop-opacity=".32"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient></defs>',
 '<path fill="url(#wall)" d="M0 0h600v1000H0z"/>',
 '<ellipse cx="300" cy="240" rx="360" ry="400" fill="url(#light)"/>',
 f'<path d="M0 820h600v180H0z" fill="{dark}"/><path d="M0 820h600" stroke="{accent}" stroke-opacity=".2"/>']
 if tier>=1:
  out += [f'<path d="M205 270V135a95 95 0 0 1 190 0v135z" fill="{dark}" stroke="{accent}" stroke-width="3" stroke-opacity=".55"/>',
   f'<path d="M300 45v225M205 165h190" stroke="{accent}" stroke-opacity=".35" stroke-width="3"/>',
   f'<circle cx="338" cy="112" r="23" fill="{accent}" opacity=".6"/>']
 if tier>=2:
  for x in [14,478]:
   out += [f'<rect x="{x}" y="315" width="108" height="440" rx="8" fill="{dark}" stroke="{accent}" stroke-opacity=".25" stroke-width="3"/>']
   for y in [340,430,520,610,700]:
    out += [f'<path d="M{x+5} {y+42}h98" stroke="{accent}" stroke-opacity=".3" stroke-width="3"/>']
    for j in range(6):
     h=24+(j*13+y)%22
     out += [f'<rect x="{x+10+j*15}" y="{y+40-h}" width="10" height="{h}" rx="2" fill="{accent}" opacity="{.16+.065*(j%4)}"/>']
 if tier>=3:
  out += [f'<path d="M55 290V190a245 245 0 0 1 490 0v100" stroke="{accent}" stroke-width="7" opacity=".35"/>',
   f'<path d="M67 295V195a233 233 0 0 1 466 0v100" stroke="{accent}" stroke-width="2" opacity=".25"/>']
 if tier>=4:
  for x in [148,446]:
   out += [f'<path d="M{x} 320v440M{x-8} 326h16M{x-8} 752h16" stroke="{accent}" stroke-opacity=".27" stroke-width="5"/>']
  out += [f'<path d="m300 285 13 18-13 18-13-18z" fill="{accent}" opacity=".65"/>']
 if tier>=5:
  for x,flip in [(142,1),(458,-1)]:
   out += [f'<path d="M{x} 750q{30*flip} -100 0 -220" stroke="{accent}" stroke-width="3" opacity=".4"/>']
   for n in range(6):
    y=565+n*30
    out += [f'<ellipse cx="{x+flip*(12 if n%2 else -8)}" cy="{y}" rx="8" ry="17" fill="{accent}" opacity=".3" transform="rotate({flip*35} {x} {y})"/>']
 if tier>=6:
  for n in range(22):
   x=28+(n*97)%545;y=35+(n*53)%240
   out += [f'<circle cx="{x}" cy="{y}" r="{1+n%2}" fill="{accent}" opacity="{.3+.1*(n%4)}"/>']
 if tier>=7:
  out += [f'<ellipse cx="300" cy="155" rx="160" ry="73" stroke="{accent}" stroke-width="2" opacity=".3" transform="rotate(-25 300 155)"/>',
   f'<ellipse cx="300" cy="155" rx="160" ry="73" stroke="{accent}" stroke-width="2" opacity=".3" transform="rotate(25 300 155)"/>']
 if tier>=8:
  out += [f'<path d="M80 870h440v18H80zM110 850h380v18H110z" fill="{accent}" opacity=".17"/>',
   f'<path d="m300 40 8 20 22 2-17 14 5 21-18-12-18 12 5-21-17-14 22-2z" fill="{accent}" opacity=".9"/>']
 # The desk and open manuscript anchor every stage of the writing journey.
 out += [f'<path d="M142 827h316v19H142zM166 846h12v92h-12zM422 846h12v92h-12z" fill="{accent}" opacity=".45"/>',
  f'<path d="M234 784q35-14 66 0 31-14 66 0v40q-34-11-66 0-32-11-66 0z" fill="{accent}" opacity=".7"/>',
  f'<path d="M300 784v40M244 794h42M244 802h42M314 794h42M314 802h42" stroke="{dark}" stroke-width="2" opacity=".7"/>']
 if tier>=1:
  out += [f'<path d="M196 793h9v33h-9z" fill="{accent}" opacity=".7"/><path d="M201 777q-10 12 0 15 10-3 0-15" fill="{accent}"/>']
 out += ['</svg>']
 return ''.join(out)+'\n'
for tier,(key,title,dark,mid,accent) in enumerate(THEMES):
 (ROOT/'assets/backgrounds'/f'{key}.svg').write_text(scene(tier,key,title,dark,mid,accent))
