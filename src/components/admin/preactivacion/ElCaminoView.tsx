import { SECTIONS } from '../../../lib/preactivacionSteps';

export default function ElCaminoView() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          Lo mínimo indispensable <span style={{ color: '#E8962E' }}>para activar</span>
        </h2>
        <p className="text-sm text-[#F2EFE9]/60 max-w-2xl leading-relaxed">
          Sin cada uno de estos pasos resueltos, prender Meta Ads es quemar plata. No hay extras
          acá — solo lo que tiene que existir y funcionar.
        </p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((sec, sectionIdx) => (
          <div
            key={sec.id}
            className="rounded-xl overflow-hidden border border-[rgba(232,150,46,0.10)]"
          >
            <div className="flex items-center gap-3.5 px-5 py-3.5 bg-[#111110] border-b border-[rgba(232,150,46,0.1)]">
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: 'rgba(232,150,46,0.12)',
                  color: '#E8962E',
                  fontSize: 13,
                  fontWeight: 700,
                  border: '1px solid rgba(232,150,46,0.10)',
                }}
              >
                {String(sectionIdx + 1).padStart(2, '0')}
              </div>
              <h3
                className="flex-1 text-base"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                {sec.title}
              </h3>
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {sec.items.length} {sec.items.length === 1 ? 'paso' : 'pasos'}
              </span>
            </div>

            <div>
              {sec.items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-start px-5 py-3.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0"
                >
                  <div
                    className="shrink-0 pt-0.5 font-semibold"
                    style={{
                      fontSize: 13,
                      color: 'rgba(232,150,46,0.8)',
                      minWidth: 32,
                    }}
                  >
                    {sectionIdx + 1}.{itemIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-[#F2EFE9] mb-1.5">
                      {item.title}
                    </div>
                    <div
                      className="text-[14px] leading-relaxed text-[#F2EFE9]/65"
                      dangerouslySetInnerHTML={{ __html: item.detail }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
