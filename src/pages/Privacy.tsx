import { ArrowLeft, Shield, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center gap-4 pt-safe box-content">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-600" />
        </button>
        <h1 className="font-black text-xl text-neutral-800 flex-1">
          Políticas de Privacidad
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-neutral-800">Términos, Condiciones y Privacidad</h2>
          <p className="text-neutral-500 font-medium mt-2">Última actualización: Mayo 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-black text-neutral-800 flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-emerald-500" />
              1. Uso de la Información
            </h3>
            <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-6 rounded-3xl">
              Toda la información proporcionada (nombre, correo, teléfono, dirección) es utilizada <strong>estrictamente y exclusivamente</strong> para la interacción dentro de la plataforma VeciMarket. Tu información facilita la comunicación entre compradores y vendedores. No vendemos, alquilamos ni compartimos tus datos con terceros.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-neutral-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              2. Exención de Responsabilidad
            </h3>
            <div className="text-neutral-600 leading-relaxed bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-4">
              <p>
                VeciMarket actúa únicamente como un <strong>directorio facilitador</strong> entre vecinos. 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Los creadores, administradores y la plataforma de VeciMarket <strong>no tienen ninguna participación o responsabilidad</strong> en la negociación, pago, calidad, entrega o garantía de los productos o servicios ofrecidos.</li>
                <li>Cada usuario (comprador o vendedor) es totalmente responsable de las transacciones que realiza.</li>
                <li>Cualquier inconformidad, disputa o reclamo por un artículo o servicio debe resolverse directamente entre las partes involucradas.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-black text-neutral-800 flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              3. Recomendaciones de Seguridad
            </h3>
            <ul className="space-y-3 text-neutral-600 bg-neutral-50 p-6 rounded-3xl">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /> 
                <span><strong>Verifica siempre</strong> el estado de los artículos antes de hacer un pago.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /> 
                <span>Las transacciones son bajo tu propio riesgo. Asegúrate de tratar con vecinos verificados de preferencia.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /> 
                <span>Si detectas un usuario abusivo, fraudulento u ofensivo, utiliza la herramienta de <strong>Reportar</strong> para que un administrador revise el caso.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="pt-8 border-t border-neutral-100 text-center text-sm text-neutral-400">
          Al usar VeciMarket, aceptas estos términos y condiciones.
        </div>
      </div>
    </div>
  );
}
