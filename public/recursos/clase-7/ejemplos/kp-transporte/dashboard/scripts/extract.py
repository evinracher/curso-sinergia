import json, datetime, hashlib
from pathlib import Path
from collections import defaultdict, Counter
import openpyxl

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dashboard'
def serial(v):
    if isinstance(v, datetime.datetime): return v.isoformat(sep=' ')
    if isinstance(v, (datetime.date, datetime.time)): return v.isoformat()
    return v
def read(file):
    wb = openpyxl.load_workbook(ROOT/file, read_only=True, data_only=True)
    result = {}
    for s in wb:
        rows = list(s.values)
        headers = rows[4]
        result[s.title] = [dict(zip(headers, [serial(v) for v in r])) for r in rows[5:] if r and r[0] is not None]
    return result

files = sorted(p.name for p in ROOT.glob('[0-9]*.xlsx'))
cat = read(files[0]); track = read(files[4])
bus_routes = {r['Placa']: r['Ruta base'] for r in cat['Buses']}
drivers = {r['ID conductor']:r['Nombre ficticio'] for r in cat['Conductores']}
daily = {}; incidents = []; maintenance = {}; reports=[]
def row(day,bus):
    key = (day[:10],bus)
    if key not in daily: daily[key] = dict(date=key[0],bus=bus,route=bus_routes[bus],passengers=0,revenue=0,fuel=None,gallons=None,trips=0)
    return daily[key]
for file in files[1:4]:
    src = read(file)
    trips = src['Trayectos']; passengers = src['Pasajeros']; fuel=src['Combustible']
    assert len({r['ID trayecto'] for r in trips}) == len(trips)
    assert sum(r['Pasajeros'] for r in trips) == sum(r['Suben'] for r in passengers)
    assert sum(r['Ingreso COP'] for r in trips) == sum(r['Recaudo COP'] for r in passengers)
    for route in cat['Rutas']:
        code=route['Código ruta']; summary=next(r for r in src['Resumen'] if r['Ruta']==code)
        assert summary['Pasajeros transportados']==sum(r['Pasajeros'] for r in trips if r['Ruta']==code)
        assert summary['Ingresos COP']==sum(r['Ingreso COP'] for r in trips if r['Ruta']==code)
    for r in trips:
        a=row(r['Fecha'],r['Placa']); a['passengers']+=r['Pasajeros']; a['revenue']+=r['Ingreso COP']; a['trips']+=1
    for r in fuel:
        a=row(r['Fecha'],r['Placa']); assert a['fuel'] is None
        a['fuel']=r['Costo consumido COP']; a['gallons']=r['Consumo gal']
        assert abs(r['Consumo gal']-r['Km recorridos']/r['Rendimiento km/gal'])<1e-7
    for r in src['Kilometraje']:
        b=r['Placa']
        if b not in maintenance or r['Corte']>maintenance[b]['Corte']: maintenance[b]=r
        remaining=r['Próximo aceite km']-r['Odómetro final km']
        assert abs(remaining-r['Km restantes'])<1e-6
        assert r['Estado aceite']==('Vencido' if remaining<=0 else 'Programar cambio' if remaining<800 else 'Vigente')
    incidents.extend(src['Incidencias'])
    revenue=sum(r['Ingreso COP'] for r in trips); cost=sum(r['Costo consumido COP'] for r in fuel)
    reports.append(dict(file=file,passengers=sum(r['Pasajeros'] for r in trips),revenue=revenue,fuel=cost,partial=revenue-cost,days=len({r['Fecha'] for r in fuel}),trips=len(trips)))
records=[]; pending=0
for r in track['Seguimiento']:
    if r['Estado'] is None:
        pending+=1; continue
    records.append(dict(bus=r['Placa'],route=r['Ruta'],time=r['Hora'][:5],date=r['Fecha'][:10],state=r['Estado'],current=r['Parada actual'],last=r['Última parada'],next=r['Próxima parada'],passengers=r['Pasajeros a bordo'],driver=drivers.get(r['ID conductor']),notes=r['Observaciones']))
latest={}
for r in records:
    if r['bus'] not in latest or r['time']>latest[r['bus']]['time']: latest[r['bus']]=r
assert len(latest)==12 and all(r['time']=='19:00' for r in latest.values())
assert all(r['passengers'] is not None for r in latest.values())
data=dict(routes=cat['Rutas'],stops=cat['Paradas'],buses=cat['Buses'],daily=list(daily.values()),records=records,maintenance=list(maintenance.values()),incidents=incidents,sources=[dict(file=f,sha256=hashlib.sha256((ROOT/f).read_bytes()).hexdigest()) for f in files],reports=reports,pending=pending)
(OUT/'dist/data.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
report=dict(months=reports,latest_states=dict(Counter(r['state'] for r in latest.values())),onboard=sum(r['passengers'] for r in latest.values()),pending=pending,oil_alerts=sum(r['Km restantes']<800 for r in maintenance.values()),incidents=len(incidents),open_incidents=sum(r['Estado']!='Resuelta' for r in incidents),checks='Passenger boardings, trip revenue, monthly summaries, fuel consumption and oil rules reconciled to source')
(OUT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
