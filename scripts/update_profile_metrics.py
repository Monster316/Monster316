#!/usr/bin/env python3
import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from xml.sax.saxutils import escape

USERNAME = os.environ.get("PROFILE_USERNAME", "Monster316")
TOKEN = os.environ["GITHUB_TOKEN"]
NOW = datetime.now(timezone.utc)
TODAY = NOW.date()
YEAR = TODAY.year
START = f"{YEAR}-01-01T00:00:00Z"
END = f"{YEAR}-12-31T23:59:59Z"

QUERY = """
query($login:String!, $from:DateTime!, $to:DateTime!) {
  user(login:$login) {
    login
    name
    followers { totalCount }
    following { totalCount }
    repositories(first:1, ownerAffiliations:OWNER, privacy:PUBLIC) { totalCount }
    contributionsCollection(from:$from, to:$to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
"""

def graphql():
    payload = json.dumps({
        "query": QUERY,
        "variables": {"login": USERNAME, "from": START, "to": END}
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "profile-metrics-action"
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.load(resp)
    if "errors" in result:
        raise RuntimeError(result["errors"])
    return result["data"]["user"]

def streaks(counts):
    start = datetime(YEAR, 1, 1, tzinfo=timezone.utc).date()
    days = []
    d = start
    while d <= TODAY:
        days.append(counts.get(d.isoformat(), 0))
        d += timedelta(days=1)

    longest = 0
    run = 0
    for c in days:
        if c > 0:
            run += 1
            longest = max(longest, run)
        else:
            run = 0

    cursor = TODAY
    if counts.get(cursor.isoformat(), 0) == 0:
        cursor -= timedelta(days=1)
    current = 0
    while cursor.year == YEAR and counts.get(cursor.isoformat(), 0) > 0:
        current += 1
        cursor -= timedelta(days=1)
    return current, longest

def level(count, positives):
    if count <= 0:
        return 0
    if not positives:
        return 1
    values = sorted(positives)
    def q(p):
        idx = min(len(values) - 1, max(0, int((len(values) - 1) * p)))
        return values[idx]
    q1, q2, q3 = q(0.25), q(0.50), q(0.75)
    if count <= q1:
        return 1
    if count <= q2:
        return 2
    if count <= q3:
        return 3
    return 4

def metrics_svg(user, total, current, longest):
    name = escape(user.get("name") or USERNAME)
    followers = user["followers"]["totalCount"]
    following = user["following"]["totalCount"]
    repos = user["repositories"]["totalCount"]
    sync = NOW.strftime("%d %b %Y · %H:%M UTC")
    cards = [
        ("CONTRIBUTIONS", f"{total:,}", str(YEAR)),
        ("CURRENT STREAK", f"{current}", "days"),
        ("LONGEST STREAK", f"{longest}", "days"),
        ("PUBLIC REPOS", f"{repos}", "owned"),
        ("FOLLOWERS", f"{followers}", f"following {following}"),
    ]
    width, height = 1000, 205
    card_w = 180
    gap = 15
    start_x = 20
    card_y = 62
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<style>
  .bg{{fill:#ffffff}} .border{{fill:none;stroke:#d0d7de;stroke-width:1}}
  .title{{fill:#24292f;font:700 18px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif}}
  .label{{fill:#57606a;font:600 11px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.7px}}
  .value{{fill:#24292f;font:700 29px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif}}
  .sub{{fill:#6e7781;font:400 11px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif}}
  .card{{fill:#f6f8fa;stroke:#d8dee4;stroke-width:1}}
  @media (prefers-color-scheme: dark){{
    .bg{{fill:#0d1117}} .border{{stroke:#30363d}} .title,.value{{fill:#f0f6fc}}
    .label{{fill:#8b949e}} .sub{{fill:#8b949e}} .card{{fill:#161b22;stroke:#30363d}}
  }}
</style>
<rect class="bg" width="100%" height="100%" rx="12"/>
<rect class="border" x=".5" y=".5" width="{width-1}" height="{height-1}" rx="12"/>
<text class="title" x="20" y="32">{name} · GitHub Performance</text>
<text class="sub" x="980" y="31" text-anchor="end">Updated {sync}</text>''']
    for i, (label, value, sub) in enumerate(cards):
        x = start_x + i * (card_w + gap)
        parts.append(f'''<rect class="card" x="{x}" y="{card_y}" width="{card_w}" height="112" rx="10"/>
<text class="label" x="{x+14}" y="{card_y+25}">{escape(label)}</text>
<text class="value" x="{x+14}" y="{card_y+64}">{escape(value)}</text>
<text class="sub" x="{x+14}" y="{card_y+88}">{escape(sub)}</text>''')
    parts.append('</svg>')
    return "".join(parts)

def heatmap_svg(counts):
    jan1 = datetime(YEAR,1,1,tzinfo=timezone.utc).date()
    dec31 = datetime(YEAR,12,31,tzinfo=timezone.utc).date()
    # Sunday before/on Jan 1, Saturday after/on Dec 31
    start = jan1 - timedelta(days=(jan1.weekday()+1)%7)
    end = dec31 + timedelta(days=(5-dec31.weekday())%7)
    weeks = ((end-start).days // 7) + 1

    cell, gap = 13, 4
    left, top = 52, 54
    width = left + weeks*(cell+gap) + 20
    height = top + 7*(cell+gap) + 42

    positives = [v for k,v in counts.items() if v > 0]
    palette = ["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"]

    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<style>
  .bg{{fill:#ffffff}} .title{{fill:#24292f;font:700 16px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif}}
  .axis{{fill:#57606a;font:400 10px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif}}
  .future{{fill:#f6f8fa}}
  @media (prefers-color-scheme: dark){{
    .bg{{fill:#0d1117}} .title{{fill:#f0f6fc}} .axis{{fill:#8b949e}} .future{{fill:#161b22}}
  }}
</style>
<rect class="bg" width="100%" height="100%" rx="10"/>
<text class="title" x="16" y="24">{YEAR} Contribution Activity</text>''']

    # Month labels
    month_seen = set()
    for w in range(weeks):
        d = start + timedelta(days=w*7)
        for j in range(7):
            dd = d + timedelta(days=j)
            if dd.year == YEAR and dd.day <= 7 and dd.month not in month_seen:
                month_seen.add(dd.month)
                x = left + w*(cell+gap)
                parts.append(f'<text class="axis" x="{x}" y="43">{dd.strftime("%b")}</text>')
                break

    for label, row in [("Mon",1),("Wed",3),("Fri",5)]:
        y = top + row*(cell+gap) + 10
        parts.append(f'<text class="axis" x="14" y="{y}">{label}</text>')

    for w in range(weeks):
        for row in range(7):
            d = start + timedelta(days=w*7+row)
            if d.year != YEAR:
                continue
            x = left + w*(cell+gap)
            y = top + row*(cell+gap)
            if d > TODAY:
                parts.append(f'<rect class="future" x="{x}" y="{y}" width="{cell}" height="{cell}" rx="2"/>')
            else:
                c = counts.get(d.isoformat(), 0)
                fill = palette[level(c, positives)]
                parts.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" rx="2" fill="{fill}"><title>{d.isoformat()}: {c} contributions</title></rect>')

    total = sum(v for k,v in counts.items() if k.startswith(str(YEAR)))
    parts.append(f'<text class="axis" x="{left}" y="{height-14}">{total:,} contributions in {YEAR} · Source: GitHub contribution calendar</text>')
    parts.append('</svg>')
    return "".join(parts)

def main():
    user = graphql()
    cal = user["contributionsCollection"]["contributionCalendar"]
    counts = {}
    for week in cal["weeks"]:
        for day in week["contributionDays"]:
            counts[day["date"]] = day["contributionCount"]
    total = cal["totalContributions"]
    current, longest = streaks(counts)
    out = Path("metrics")
    out.mkdir(exist_ok=True)
    (out / "profile-metrics.svg").write_text(metrics_svg(user, total, current, longest), encoding="utf-8")
    (out / "contribution-heatmap.svg").write_text(heatmap_svg(counts), encoding="utf-8")

if __name__ == "__main__":
    main()
