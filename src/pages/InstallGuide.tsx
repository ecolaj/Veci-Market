import { ArrowLeft, Share, PlusSquare, MoreVertical, Smartphone, MonitorSmartphone, Apple, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstallGuide() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-16 sm:top-20 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center gap-4 box-content -mx-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-600" />
        </button>
        <h1 className="font-black text-xl text-neutral-800 flex-1">
          Guía de Instalación
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* Intro */}
        <section className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-neutral-800">Agrega VeciMarket a tu celular</h2>
          <p className="text-lg text-neutral-600 font-medium leading-relaxed max-w-2xl mx-auto">
            VeciMarket es una aplicación web moderna (PWA). Esto significa que puedes instalarla directamente en tu teléfono sin tener que bajar nada de la App Store o Google Play. ¡No ocupa espacio!
          </p>
        </section>

        {/* Apple (iOS) */}
        <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
              <Apple className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-neutral-800">iPhone o iPad (iOS)</h3>
              <p className="text-neutral-500 font-medium">Usando Safari</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 mt-1">1</div>
              <div>
                <p className="font-bold text-neutral-800 mb-2">Abre Safari y toca el ícono de Compartir</p>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-4 text-neutral-600 max-w-sm shadow-sm">
                  <div className="bg-blue-50 p-3 rounded-xl shrink-0"><Share className="w-8 h-8 text-blue-500" /></div>
                  <span className="text-sm">Abajo en la pantalla (un cuadro con flecha hacia arriba).</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 mt-1">2</div>
              <div>
                <p className="font-bold text-neutral-800 mb-2">Busca "Agregar a Inicio"</p>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-4 text-neutral-600 max-w-sm shadow-sm">
                  <div className="bg-neutral-100 p-3 rounded-xl shrink-0"><PlusSquare className="w-8 h-8 text-neutral-800" /></div>
                  <span className="text-sm">Desliza el menú hacia arriba. Toca el botón de más (+).</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">3</div>
              <div>
                <p className="font-bold text-neutral-800">Toca en "Agregar" arriba a la derecha. ¡Listo!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Android */}
        <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <MonitorSmartphone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-neutral-800">Android</h3>
              <p className="text-neutral-500 font-medium">Usando Google Chrome</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 mt-1">1</div>
              <div>
                <p className="font-bold text-neutral-800 mb-2">Abre Chrome y toca el menú de opciones</p>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-4 text-neutral-600 max-w-sm shadow-sm">
                  <div className="bg-neutral-100 p-3 rounded-xl shrink-0"><MoreVertical className="w-8 h-8 text-neutral-800" /></div>
                  <span className="text-sm">Arriba a la derecha (tres puntitos verticales).</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 mt-1">2</div>
              <div>
                <p className="font-bold text-neutral-800 mb-2">Toca en "Instalar aplicación"</p>
                <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-4 text-neutral-600 max-w-sm shadow-sm">
                  <div className="bg-neutral-100 p-3 rounded-xl shrink-0"><Download className="w-8 h-8 text-neutral-800" /></div>
                  <span className="text-sm">Podría decir también "Agregar a la pantalla principal".</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">3</div>
              <div>
                <p className="font-bold text-neutral-800">Confirma en el mensaje que sale. ¡Listo!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
